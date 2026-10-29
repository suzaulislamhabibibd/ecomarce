<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $role = $request->string('role')->toString();
        $search = $request->string('q')->toString();

        return Inertia::render('Admin/Users', [
            'users' => User::withCount('orders')
                ->when($role, fn ($q) => $q->where('role', $role))
                ->when($search, fn ($q) => $q->where(fn ($w) => $w->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%")))
                ->latest()->paginate(20)->withQueryString(),
            'filters' => ['role' => $role, 'q' => $search],
        ]);
    }

    public function toggleActive(Request $request, User $user): RedirectResponse
    {
        abort_if($user->id === $request->user()->id, 422, 'You cannot deactivate yourself.');
        $user->update(['is_active' => ! $user->is_active]);

        return back()->with('success', "{$user->name} is now ".($user->is_active ? 'active' : 'deactivated').'.');
    }
}
