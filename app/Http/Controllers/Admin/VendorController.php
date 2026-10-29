<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VendorController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();

        return Inertia::render('Admin/Vendors', [
            'vendors' => Vendor::with('user:id,name,email')
                ->withCount('products')
                ->withSum(['orderItems as sales' => fn ($q) => $q->where('status', '!=', 'cancelled')], 'line_total')
                ->when($status, fn ($q) => $q->where('status', $status))
                ->latest()->paginate(15)->withQueryString(),
            'filters' => ['status' => $status],
        ]);
    }

    public function update(Request $request, Vendor $vendor): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', 'in:pending,approved,suspended'],
            'commission_rate' => ['sometimes', 'nullable', 'numeric', 'between:0,100'],
        ]);
        $vendor->update($data);

        return back()->with('success', "{$vendor->shop_name} updated.");
    }
}
