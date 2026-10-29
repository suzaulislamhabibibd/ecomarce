<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('Admin/Settings', ['values' => Setting::allValues()]);
    }

    public function update(Request $request): RedirectResponse
    {
        Setting::put($request->validate([
            'site_name' => ['required', 'string', 'max:60'],
            'commission_rate' => ['required', 'numeric', 'between:0,100'],
            'shipping_fee' => ['required', 'numeric', 'min:0', 'max:10000'],
            'affiliate_commission_rate' => ['required', 'numeric', 'between:0,100'],
            'affiliate_cookie_days' => ['required', 'integer', 'between:1,365'],
        ]));

        return back()->with('success', 'Settings saved.');
    }
}
