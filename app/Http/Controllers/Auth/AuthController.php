<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Vendor;
use App\Support\Slug;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function showLogin(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt([...$credentials, 'is_active' => true], $request->boolean('remember'))) {
            throw ValidationException::withMessages(['email' => 'These credentials do not match our records.']);
        }

        $request->session()->regenerate();

        return redirect()->intended($this->home($request->user()));
    }

    public function showRegister(Request $request): Response
    {
        return Inertia::render('Auth/Register', ['asVendor' => $request->boolean('vendor')]);
    }

    public function register(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'as_vendor' => ['boolean'],
            'shop_name' => ['required_if:as_vendor,true', 'nullable', 'string', 'max:100'],
        ]);

        $user = DB::transaction(function () use ($data) {
            $isVendor = ! empty($data['as_vendor']);
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'],
                'role' => $isVendor ? User::ROLE_VENDOR : User::ROLE_CUSTOMER,
            ]);

            if ($isVendor) {
                Vendor::create([
                    'user_id' => $user->id,
                    'shop_name' => $data['shop_name'],
                    'slug' => Slug::unique(Vendor::class, $data['shop_name']),
                    'phone' => $data['phone'] ?? null,
                ]);
            }

            return $user;
        });

        Auth::login($user);
        $request->session()->regenerate();

        return redirect($this->home($user))->with('success', $user->isVendor()
            ? 'Welcome! Your shop is awaiting admin approval.'
            : 'Welcome to '.config('app.name').'!');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    private function home(User $user): string
    {
        return match ($user->role) {
            User::ROLE_ADMIN => route('admin.dashboard'),
            User::ROLE_VENDOR => route('vendor.dashboard'),
            default => '/',
        };
    }
}
