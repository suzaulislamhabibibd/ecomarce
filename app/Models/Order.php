<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'number', 'user_id', 'subtotal', 'shipping_fee', 'total', 'shipping_name', 'shipping_phone',
    'shipping_address', 'shipping_city', 'note', 'payment_method', 'payment_status', 'status',
])]
class Order extends Model
{
    protected function casts(): array
    {
        return [
            'subtotal' => 'float',
            'shipping_fee' => 'float',
            'total' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function isCancellableByCustomer(): bool
    {
        return $this->items->every(fn (OrderItem $item) => $item->status === 'pending');
    }
}
