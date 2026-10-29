<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

#[Fillable(['vendor_id', 'category_id', 'name', 'slug', 'description', 'price', 'compare_price', 'stock', 'image', 'status'])]
class Product extends Model
{
    use HasFactory;

    protected $appends = ['image_url'];

    protected function casts(): array
    {
        return [
            'price' => 'float',
            'compare_price' => 'float',
            'stock' => 'integer',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /** Products a customer is allowed to see and buy. */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('status', 'active')
            ->whereHas('vendor', fn ($q) => $q->where('status', Vendor::STATUS_APPROVED));
    }

    public function isPurchasable(): bool
    {
        return $this->status === 'active' && $this->vendor?->isApproved();
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? Storage::url($this->image) : null;
    }
}
