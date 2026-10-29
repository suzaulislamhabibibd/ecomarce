<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Affiliate;
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
        $type = $request->boolean('vendor') ? 'vendor' : ($request->boolean('affiliate') ? 'affiliate' : 'customer');

        return Inertia::render('Auth/Register', ['accountType' => $type]);
    }

    public function register(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'account_type' => ['required', 'in:customer,vendor,affiliate'],
            'shop_name' => ['required_if:account_type,vendor', 'nullable', 'string', 'max:100'],
            'promo_channel' => ['required_if:account_type,affiliate', 'nullable', 'string', 'max:255'],
        ]);

        $user = $this->createAccount($data);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect($this->home($user))->with('success', match ($user->role) {
            User::ROLE_VENDOR => 'Welcome! Your shop is awaiting admin approval.',
            User::ROLE_AFFILIATE => 'Welcome! Your affiliate account is awaiting admin approval.',
            default => 'Welcome to '.config('app.name').'!',
        });
    }

    /** Create a user with the vendor or affiliate profile its account type needs. */
    public static function createAccount(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $type = $data['account_type'];
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'],
                'role' => $type,
            ]);

            if ($type === User::ROLE_VENDOR) {
                Vendor::create([
                    'user_id' => $user->id,
                    'shop_name' => $data['shop_name'],
                    'slug' => Slug::unique(Vendor::class, $data['shop_name']),
                    'phone' => $data['phone'] ?? null,
                ]);
            } elseif ($type === User::ROLE_AFFILIATE) {
                Affiliate::create([
                    'user_id' => $user->id,
                    'code' => Affiliate::generateCode(),
                    'promo_channel' => $data['promo_channel'],
                ]);
            }

            return $user;
        });
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
            User::ROLE_AFFILIATE => route('affiliate.dashboard'),
            default => '/',
        };
    }
}
