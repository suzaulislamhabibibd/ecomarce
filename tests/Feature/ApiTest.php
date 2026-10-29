<?php

namespace Tests\Feature;

use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiTest extends TestCase
{
    use RefreshDatabase;

    private function token(User $user): array
    {
        $token = $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'password'])
            ->assertOk()->json('token');

        return ['Authorization' => "Bearer {$token}"];
    }

    public function test_login_and_profile(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'wrong'])->assertStatus(422);
        $this->getJson('/api/v1/auth/me', $this->token($user))->assertOk()->assertJsonPath('user.email', $user->email);
    }

    public function test_register_as_affiliate(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'App User', 'email' => 'app@example.com', 'password' => 'password123',
            'password_confirmation' => 'password123', 'account_type' => 'affiliate', 'promo_channel' => 'TikTok',
        ])->assertCreated()->assertJsonPath('user.role', 'affiliate')->assertJsonStructure(['token']);
    }

    public function test_catalog_endpoints_hide_unapproved_vendors(): void
    {
        $product = Product::factory()->create();
        $hidden = Product::factory()->for(Vendor::factory()->pending())->create();

        $this->getJson('/api/v1/home')->assertOk()->assertJsonStructure(['categories', 'latest', 'deals']);
        $this->getJson('/api/v1/products')->assertOk()->assertJsonPath('total', 1);
        $this->getJson("/api/v1/products/{$product->slug}")->assertOk()->assertJsonPath('product.id', $product->id);
        $this->getJson("/api/v1/products/{$hidden->slug}")->assertNotFound();
    }

    public function test_app_checkout_with_scanned_referral(): void
    {
        $affiliate = Affiliate::factory()->create();
        $product = Product::factory()->create(['price' => 400, 'stock' => 5]);
        $headers = $this->token(User::factory()->create());

        $this->postJson('/api/v1/referrals/click', ['ref' => $affiliate->code, 'product_slug' => $product->slug, 'source' => 'qr'])
            ->assertOk()->assertJson(['valid' => true]);
        $this->assertSame('qr', $affiliate->clicks()->sole()->source);

        $this->postJson('/api/v1/orders', [
            'items' => [['product_id' => $product->id, 'quantity' => 2]],
            'shipping_name' => 'Buyer', 'shipping_phone' => '017', 'shipping_address' => 'Road 1', 'shipping_city' => 'Dhaka',
            'ref' => $affiliate->code,
        ], $headers)->assertCreated();

        $this->assertEquals(3, $product->fresh()->stock);
        $this->assertEquals(40, AffiliateCommission::sole()->amount);

        $orderId = Order::sole()->id;
        $this->getJson('/api/v1/orders', $headers)->assertOk()->assertJsonPath('data.0.id', $orderId);
        $this->postJson("/api/v1/orders/{$orderId}/cancel", [], $headers)->assertOk()->assertJsonPath('order.status', 'cancelled');
    }

    public function test_admin_and_affiliate_endpoints_are_role_protected(): void
    {
        $this->getJson('/api/v1/orders')->assertUnauthorized();

        $customer = $this->token(User::factory()->create());
        $this->getJson('/api/v1/admin/stats', $customer)->assertForbidden();
        $this->getJson('/api/v1/affiliate/dashboard', $customer)->assertForbidden();

        $this->app['auth']->forgetGuards();
        $admin = $this->token(User::factory()->create(['role' => User::ROLE_ADMIN]));
        $vendor = Vendor::factory()->pending()->create();
        $this->getJson('/api/v1/admin/stats', $admin)->assertOk()->assertJsonPath('pending_vendors', 1);
        $this->patchJson("/api/v1/admin/vendors/{$vendor->id}", ['status' => 'approved'], $admin)->assertOk();
        $this->assertTrue($vendor->fresh()->isApproved());

        $this->app['auth']->forgetGuards();
        $affiliate = Affiliate::factory()->create();
        $this->getJson('/api/v1/affiliate/dashboard', $this->token($affiliate->user))
            ->assertOk()->assertJsonPath('affiliate.code', $affiliate->code);
    }
}
