<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['affiliate_id', 'order_id', 'rate', 'order_amount', 'amount', 'status'])]
class AffiliateCommission extends Model
{
    protected function casts(): array
    {
        return [
            'rate' => 'float',
            'order_amount' => 'float',
            'amount' => 'float',
        ];
    }

    public function affiliate(): BelongsTo
    {
        return $this->belongsTo(Affiliate::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
