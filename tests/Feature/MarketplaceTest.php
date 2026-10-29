<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class MarketplaceTest extends TestCase
{
    use RefreshDatabase;

    private function customer(): User
    {
        return User::factory()->create(['role' => User::ROLE_CUSTOMER]);
    }

    private function checkout(User $user): TestResponse
    {
        return $this->actingAs($user)->post('/checkout', [
            'shipping_name' => 'Test Buyer',
            'shipping_phone' => '01700000000',
            'shipping_address' => 'Road 1',
            'shipping_city' => 'Dhaka',
        ]);
    }

    public function test_storefront_pages_render(): void
    {
        $product = Product::factory()->create();

        $this->get('/')->assertOk();
        $this->get('/products')->assertOk();
        $this->get("/product/{$product->slug}")->assertOk();
        $this->get("/store/{$product->vendor->slug}")->assertOk();
    }

    public function test_products_of_unapproved_vendors_are_hidden(): void
    {
        $product = Product::factory()->for(Vendor::factory()->pending())->create();

        $this->get("/product/{$product->slug}")->assertNotFound();
        $this->post('/cart', ['product_id' => $product->id])->assertNotFound();
    }

    public function test_order_is_split_per_vendor_with_commission_and_stock_decrement(): void
    {
        $a = Product::factory()->create(['price' => 1000, 'stock' => 5]);
        $b = Product::factory()->for(Vendor::factory()->state(['commission_rate' => 5]))->create(['price' => 200, 'stock' => 3]);
        $user = $this->customer();

        $this->actingAs($user)->post('/cart', ['product_id' => $a->id, 'quantity' => 2]);
        $this->post('/cart', ['product_id' => $b->id, 'quantity' => 1]);
        $this->checkout($user)->assertRedirect();

        $order = Order::with('items')->sole();
        $this->assertEquals(2200 + 60, $order->total);
        $this->assertCount(2, $order->items);

        $itemA = $order->items->firstWhere('vendor_id', $a->vendor_id);
        $this->assertEquals(200, $itemA->commission);       // default 10%
        $this->assertEquals(1800, $itemA->vendor_earning);
        $this->assertEquals(10, $order->items->firstWhere('vendor_id', $b->vendor_id)->commission); // custom 5%

        $this->assertEquals(3, $a->fresh()->stock);
        $this->assertEquals(2, $b->fresh()->stock);
    }

    public function test_cannot_order_more_than_stock(): void
    {
        $product = Product::factory()->create(['stock' => 2]);
        $user = $this->customer();

        $this->actingAs($user)->post('/cart', ['product_id' => $product->id, 'quantity' => 2]);
        $product->update(['stock' => 1]); // someone else bought one meanwhile

        $this->checkout($user)->assertSessionHasErrors('cart');
        $this->assertSame(0, Order::count());
    }

    public function test_vendor_fulfilment_flow_marks_order_delivered_and_paid(): void
    {
        $product = Product::factory()->create(['price' => 500]);
        $user = $this->customer();
        $this->actingAs($user)->post('/cart', ['product_id' => $product->id]);
        $this->checkout($user);
        $item = Order::sole()->items()->sole();

        $vendorUser = $product->vendor->user;
        foreach (['processing', 'shipped', 'delivered'] as $status) {
            $this->actingAs($vendorUser)->patch("/vendor/orders/{$item->id}", ['status' => $status])->assertSessionHasNoErrors();
        }

        $order = Order::sole();
        $this->assertSame('delivered', $order->status);
        $this->assertSame('paid', $order->payment_status);
        $this->assertEquals(450, $product->vendor->fresh()->availableBalance());
    }

    public function test_vendor_cannot_skip_status_or_touch_other_vendors_items(): void
    {
        $product = Product::factory()->create();
        $user = $this->customer();
        $this->actingAs($user)->post('/cart', ['product_id' => $product->id]);
        $this->checkout($user);
        $item = Order::sole()->items()->sole();

        $this->actingAs($product->vendor->user)->patch("/vendor/orders/{$item->id}", ['status' => 'delivered'])
            ->assertSessionHasErrors('status');

        $other = Vendor::factory()->create();
        $this->actingAs($other->user)->patch("/vendor/orders/{$item->id}", ['status' => 'processing'])->assertNotFound();
    }

    public function test_customer_cancel_restores_stock(): void
    {
        $product = Product::factory()->create(['stock' => 4]);
        $user = $this->customer();
        $this->actingAs($user)->post('/cart', ['product_id' => $product->id, 'quantity' => 3]);
        $this->checkout($user);
        $order = Order::sole();

        $this->actingAs($this->customer())->post("/account/orders/{$order->id}/cancel")->assertNotFound();
        $this->actingAs($user)->post("/account/orders/{$order->id}/cancel")->assertRedirect();

        $this->assertSame('cancelled', $order->fresh()->status);
        $this->assertEquals(4, $product->fresh()->stock);
    }

    public function test_vendor_can_only_edit_own_products(): void
    {
        $mine = Vendor::factory()->create();
        $theirs = Product::factory()->create();

        $this->actingAs($mine->user)->post('/vendor/products', [
            'name' => 'My Product', 'price' => 100, 'stock' => 5, 'status' => 'active',
        ])->assertRedirect('/vendor/products');
        $this->assertDatabaseHas('products', ['name' => 'My Product', 'vendor_id' => $mine->id]);

        $this->actingAs($mine->user)->get("/vendor/products/{$theirs->id}/edit")->assertNotFound();
        $this->actingAs($mine->user)->delete("/vendor/products/{$theirs->id}")->assertNotFound();
    }

    public function test_panels_are_role_protected(): void
    {
        $customer = $this->customer();

        $this->get('/admin')->assertRedirect('/login');
        $this->actingAs($customer)->get('/admin')->assertForbidden();
        $this->actingAs($customer)->get('/vendor')->assertForbidden();
        $this->actingAs(User::factory()->create(['role' => User::ROLE_ADMIN]))->get('/admin')->assertOk();
    }

    public function test_vendor_registration_requires_admin_approval(): void
    {
        $this->post('/register', [
            'name' => 'Seller', 'email' => 'seller@example.com', 'password' => 'password123',
            'password_confirmation' => 'password123', 'as_vendor' => true, 'shop_name' => 'My Shop',
        ])->assertRedirect('/vendor');

        $vendor = Vendor::sole();
        $this->assertSame('pending', $vendor->status);

        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        $this->actingAs($admin)->patch("/admin/vendors/{$vendor->id}", ['status' => 'approved']);
        $this->assertTrue($vendor->fresh()->isApproved());
    }

    public function test_payout_cannot_exceed_balance(): void
    {
        $vendor = Vendor::factory()->create();

        $this->actingAs($vendor->user)->post('/vendor/payouts', [
            'amount' => 500, 'method' => 'bkash', 'account' => '01700000000',
        ])->assertSessionHasErrors('amount');
    }

    public function test_deactivated_user_is_logged_out(): void
    {
        $user = User::factory()->create(['is_active' => false]);

        $this->actingAs($user)->get('/account/orders')->assertRedirect('/login');
        $this->assertGuest();
    }
}
