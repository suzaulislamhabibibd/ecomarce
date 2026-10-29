<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SetupDatabaseTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        foreach (['SEED_DEMO_DATA', 'ADMIN_EMAIL', 'ADMIN_PASSWORD'] as $key) {
            putenv($key);
            unset($_ENV[$key], $_SERVER[$key]);
        }
        parent::tearDown();
    }

    private function setEnv(array $values): void
    {
        foreach ($values as $key => $value) {
            putenv("{$key}={$value}");
            $_ENV[$key] = $_SERVER[$key] = $value;
        }
    }

    public function test_fresh_install_creates_admin_from_env(): void
    {
        $this->setEnv(['ADMIN_EMAIL' => 'owner@example.com', 'ADMIN_PASSWORD' => 'secret-pass-123']);

        $this->artisan('app:setup-database')->assertSuccessful();

        $admin = User::where('role', User::ROLE_ADMIN)->sole();
        $this->assertSame('owner@example.com', $admin->email);
        $this->assertTrue(Hash::check('secret-pass-123', $admin->password));
        $this->assertSame(0, Product::count());
    }

    public function test_demo_seed_replaces_default_admin_credentials(): void
    {
        $this->setEnv(['SEED_DEMO_DATA' => 'true', 'ADMIN_EMAIL' => 'owner@example.com', 'ADMIN_PASSWORD' => 'secret-pass-123']);

        $this->artisan('app:setup-database')->assertSuccessful();

        $this->assertGreaterThan(0, Product::count());
        $this->assertSame('owner@example.com', User::where('role', User::ROLE_ADMIN)->sole()->email);
        $this->assertFalse(User::where('email', 'admin@haatbazar.test')->exists());
    }

    public function test_existing_data_is_left_alone(): void
    {
        $user = User::factory()->create();
        $this->setEnv(['SEED_DEMO_DATA' => 'true', 'ADMIN_EMAIL' => 'owner@example.com', 'ADMIN_PASSWORD' => 'x']);

        $this->artisan('app:setup-database')->assertSuccessful();

        $this->assertSame(1, User::count());
        $this->assertTrue($user->is(User::sole()));
    }
}
