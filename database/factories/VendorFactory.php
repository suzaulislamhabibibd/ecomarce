<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Vendor>
 */
class VendorFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'user_id' => User::factory()->state(['role' => User::ROLE_VENDOR]),
            'shop_name' => $name,
            'slug' => Str::slug($name).'-'.Str::lower(Str::random(4)),
            'description' => fake()->sentence(12),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'status' => Vendor::STATUS_APPROVED,
        ];
    }

    public function pending(): static
    {
        return $this->state(['status' => Vendor::STATUS_PENDING]);
    }
}
