<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();

        return Inertia::render('Vendor/Orders', [
            'items' => $request->user()->vendor->orderItems()
                ->with('order:id,number,created_at,shipping_name,shipping_phone,shipping_address,shipping_city,note')
                ->when($status, fn ($q) => $q->where('status', $status))
                ->latest()->paginate(15)->withQueryString(),
            'filters' => ['status' => $status],
            'transitions' => OrderItem::TRANSITIONS,
        ]);
    }

    public function update(Request $request, OrderItem $item, OrderService $orders): RedirectResponse
    {
        abort_unless($item->vendor_id === $request->user()->vendor->id, 404);

        $data = $request->validate([
            'status' => ['required', Rule::in(array_keys(OrderItem::TRANSITIONS))],
        ]);
        $orders->updateItemStatus($item, $data['status']);

        return back()->with('success', "Item marked as {$data['status']}.");
    }
}
