<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Vendor;
use App\Support\Slug;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('Vendor/Shop', ['vendor' => $request->user()->vendor]);
    }

    public function update(Request $request): RedirectResponse
    {
        $vendor = $request->user()->vendor;
        $data = $request->validate([
            'shop_name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:2000'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:255'],
            'logo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:1024'],
        ]);

        if ($request->hasFile('logo')) {
            if ($vendor->logo) {
                Storage::disk(config('filesystems.uploads'))->delete($vendor->logo);
            }
            $data['logo'] = $request->file('logo')->store('logos', config('filesystems.uploads'));
        } else {
            unset($data['logo']);
        }

        if ($data['shop_name'] !== $vendor->shop_name) {
            $data['slug'] = Slug::unique(Vendor::class, $data['shop_name'], $vendor->id);
        }

        $vendor->update($data);

        return back()->with('success', 'Shop profile updated.');
    }

    /** Lets an existing customer open a shop. */
    public function apply(Request $request): Response|RedirectResponse
    {
        if ($request->user()->vendor) {
            return redirect()->route('vendor.dashboard');
        }

        return Inertia::render('Vendor/Apply');
    }

    public function storeApplication(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_if($user->vendor || $user->isAdmin(), 403);

        $data = $request->validate([
            'shop_name' => ['required', 'string', 'max:100'],
            'phone' => ['required', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        DB::transaction(function () use ($user, $data) {
            Vendor::create([...$data, 'user_id' => $user->id, 'slug' => Slug::unique(Vendor::class, $data['shop_name'])]);
            $user->update(['role' => User::ROLE_VENDOR]);
        });

        return redirect()->route('vendor.dashboard')->with('success', 'Application submitted! An admin will review your shop soon.');
    }
}
