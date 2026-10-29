<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['affiliate_id', 'product_id', 'source', 'ip_hash'])]
class AffiliateClick extends Model
{
    public const UPDATED_AT = null;

    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(Affiliate::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Record a referral visit, ignoring repeat visits from the same
     * IP to the same target within an hour.
     */
    public static function record(Affiliate $affiliate, ?int $productId, string $source, ?string $ip): void
    {
        $ipHash = $ip ? hash('sha256', $ip.config('app.key')) : null;

        $recent = static::where('affiliate_id', $affiliate->id)
            ->where('ip_hash', $ipHash)
            ->where('product_id', $productId)
            ->where('created_at', '>=', now()->subHour())
            ->exists();

        if (! $recent) {
            static::create([
                'affiliate_id' => $affiliate->id,
                'product_id' => $productId,
                'source' => $source,
                'ip_hash' => $ipHash,
            ]);
        }
    }
}
