<?php

namespace App\Http\Middleware;

use App\Models\Category;
use App\Models\Setting;
use App\Services\Cart;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'vendor' => $user->vendor?->only(['id', 'shop_name', 'slug', 'status']),
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'cartCount' => fn () => app(Cart::class)->count(),
            'settings' => fn () => [
                'site_name' => Setting::get('site_name'),
                'shipping_fee' => (float) Setting::get('shipping_fee'),
            ],
            'navCategories' => fn () => Category::orderBy('name')->get(['id', 'name', 'slug']),
        ];
    }
}
