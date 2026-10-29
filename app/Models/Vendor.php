<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

#[Fillable(['user_id', 'shop_name', 'slug', 'description', 'phone', 'address', 'logo', 'status', 'commission_rate'])]
class Vendor extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_SUSPENDED = 'suspended';

    protected $appends = ['logo_url'];

    protected function casts(): array
    {
        return ['commission_rate' => 'decimal:2'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(Payout::class);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    public function effectiveCommissionRate(): float
    {
        return $this->commission_rate !== null
            ? (float) $this->commission_rate
            : (float) Setting::get('commission_rate', 10);
    }

    /** Earnings from delivered items. */
    public function totalEarned(): float
    {
        return (float) $this->orderItems()->where('status', 'delivered')->sum('vendor_earning');
    }

    /** Delivered earnings minus payouts that are requested or already paid. */
    public function availableBalance(): float
    {
        $withdrawn = (float) $this->payouts()->whereIn('status', ['requested', 'paid'])->sum('amount');

        return round($this->totalEarned() - $withdrawn, 2);
    }

    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo ? Storage::url($this->logo) : null;
    }
}
