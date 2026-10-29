<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

#[Fillable(['user_id', 'code', 'promo_channel', 'status', 'commission_rate'])]
class Affiliate extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_SUSPENDED = 'suspended';

    protected function casts(): array
    {
        return ['commission_rate' => 'decimal:2'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function clicks(): HasMany
    {
        return $this->hasMany(AffiliateClick::class);
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(AffiliateCommission::class);
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(Payout::class);
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function effectiveCommissionRate(): float
    {
        return $this->commission_rate !== null
            ? (float) $this->commission_rate
            : (float) Setting::get('affiliate_commission_rate', 5);
    }

    /** Find an approved affiliate by referral code. */
    public static function findActiveByCode(?string $code): ?self
    {
        if (! $code) {
            return null;
        }

        return static::where('code', strtoupper($code))->where('status', self::STATUS_APPROVED)->first();
    }

    public static function generateCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (static::where('code', $code)->exists());

        return $code;
    }

    public function totalEarned(): float
    {
        return (float) $this->commissions()->where('status', 'approved')->sum('amount');
    }

    public function pendingEarnings(): float
    {
        return (float) $this->commissions()->where('status', 'pending')->sum('amount');
    }

    /** Approved commissions minus payouts that are requested or already paid. */
    public function availableBalance(): float
    {
        $withdrawn = (float) $this->payouts()->whereIn('status', ['requested', 'paid'])->sum('amount');

        return round($this->totalEarned() - $withdrawn, 2);
    }

    /** Referral URL for the home page or a specific product. */
    public function link(?Product $product = null): string
    {
        $base = $product ? route('products.show', $product) : route('home');

        return $base.'?ref='.$this->code;
    }

    public function stats(): array
    {
        $orders = $this->commissions()->where('status', '!=', 'cancelled')->count();
        $clicks = $this->clicks()->count();

        return [
            'clicks' => $clicks,
            'orders' => $orders,
            // Repeat visits are de-duplicated, so orders can outnumber clicks.
            'conversion' => $clicks ? min(100, round($orders / $clicks * 100, 1)) : 0,
            'pending' => $this->pendingEarnings(),
            'earned' => $this->totalEarned(),
            'balance' => $this->availableBalance(),
            'rate' => $this->effectiveCommissionRate(),
        ];
    }
}
