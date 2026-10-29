<?php

namespace Database\Factories;

use App\Models\Affiliate;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Affiliate>
 */
class AffiliateFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state(['role' => User::ROLE_AFFILIATE]),
            'code' => strtoupper(Str::random(8)),
            'promo_channel' => 'Facebook',
            'status' => Affiliate::STATUS_APPROVED,
        ];
    }
}
