<?php

namespace Tests\Feature;

use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AffiliateTest extends TestCase
{
    use RefreshDatabase;

    private function buyViaReferral(Affiliate $affiliate, Product $product): User
    {
        $buyer = User::factory()->create();

        $this->get("/product/{$product->slug}?ref={$affiliate->code}")
            ->assertOk()->assertCookie('hb_ref', $affiliate->code);

        $this->actingAs($buyer)->post('/cart', ['product_id' => $product->id]);
        $this->withCookie('hb_ref', $affiliate->code)->post('/checkout', [
            'shipping_name' => 'Buyer', 'shipping_phone' => '017', 'shipping_address' => 'Road 1', 'shipping_city' => 'Dhaka',
        ])->assertRedirect();

        return $buyer;
    }

    public function test_referral_link_records_click_and_credits_commission_on_delivery(): void
    {
        $affiliate = Affiliate::factory()->create();
        $product = Product::factory()->create(['price' => 1000]);

        $this->buyViaReferral($affiliate, $product);

        $this->assertSame(1, $affiliate->clicks()->count());
        $order = Order::sole();
        $this->assertSame($affiliate->id, $order->affiliate_id);

        $commission = AffiliateCommission::sole();
        $this->assertEquals(50, $commission->amount); // default 5% of subtotal
        $this->assertSame('pending', $commission->status);
        $this->assertEquals(0, $affiliate->availableBalance());

        $item = $order->items()->sole();
        foreach (['processing', 'shipped', 'delivered'] as $status) {
            $this->actingAs($product->vendor->user)->patch("/vendor/orders/{$item->id}", ['status' => $status]);
        }

        $this->assertSame('approved', $commission->fresh()->status);
        $this->assertEquals(50, $affiliate->fresh()->availableBalance());
    }

    public function test_cancelled_order_cancels_commission(): void
    {
        $affiliate = Affiliate::factory()->create();
        $buyer = $this->buyViaReferral($affiliate, Product::factory()->create());

        $this->actingAs($buyer)->post('/account/orders/'.Order::sole()->id.'/cancel');

        $this->assertSame('cancelled', AffiliateCommission::sole()->status);
    }

    public function test_pending_affiliate_codes_and_self_referrals_earn_nothing(): void
    {
        $pending = Affiliate::factory()->create(['status' => 'pending']);
        $product = Product::factory()->create();

        $this->get("/product/{$product->slug}?ref={$pending->code}")->assertCookieMissing('hb_ref');

        $approved = Affiliate::factory()->create();
        $this->actingAs($approved->user)->post('/cart', ['product_id' => $product->id]);
        $this->withCookie('hb_ref', $approved->code)->post('/checkout', [
            'shipping_name' => 'Me', 'shipping_phone' => '017', 'shipping_address' => 'Road 1', 'shipping_city' => 'Dhaka',
        ]);

        $this->assertNull(Order::sole()->affiliate_id);
        $this->assertSame(0, AffiliateCommission::count());
    }

    public function test_affiliate_registration_and_panel_access(): void
    {
        $this->post('/register', [
            'name' => 'Promoter', 'email' => 'promo@example.com', 'password' => 'password123',
            'password_confirmation' => 'password123', 'account_type' => 'affiliate', 'promo_channel' => 'YouTube',
        ])->assertRedirect('/affiliate');

        $affiliate = Affiliate::sole();
        $this->assertSame('pending', $affiliate->status);
        $this->assertSame(8, strlen($affiliate->code));

        $this->get('/affiliate')->assertOk();
        $this->get('/affiliate/links')->assertOk();
        $this->actingAs(User::factory()->create())->get('/affiliate')->assertForbidden();
    }

    public function test_affiliate_payout_limited_to_approved_balance(): void
    {
        $affiliate = Affiliate::factory()->create();

        $this->actingAs($affiliate->user)->post('/affiliate/payouts', [
            'amount' => 100, 'method' => 'bkash', 'account' => '017',
        ])->assertSessionHasErrors('amount');
    }

    public function test_admin_can_approve_affiliate(): void
    {
        $affiliate = Affiliate::factory()->create(['status' => 'pending']);
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);

        $this->actingAs($admin)->get('/admin/affiliates')->assertOk();
        $this->actingAs($admin)->patch("/admin/affiliates/{$affiliate->id}", ['status' => 'approved']);

        $this->assertTrue($affiliate->fresh()->isApproved());
    }
}
