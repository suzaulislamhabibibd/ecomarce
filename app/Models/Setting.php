<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

#[Fillable(['key', 'value'])]
class Setting extends Model
{
    protected $primaryKey = 'key';

    public $incrementing = false;

    protected $keyType = 'string';

    public const DEFAULTS = [
        'site_name' => 'HaatBazar',
        'commission_rate' => '10',
        'shipping_fee' => '60',
        'affiliate_commission_rate' => '5',
        'affiliate_cookie_days' => '30',
    ];

    public static function allValues(): array
    {
        return Cache::rememberForever('settings', function () {
            return array_merge(self::DEFAULTS, static::query()->pluck('value', 'key')->all());
        });
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return self::allValues()[$key] ?? $default;
    }

    public static function put(array $values): void
    {
        foreach ($values as $key => $value) {
            static::updateOrCreate(['key' => $key], ['value' => $value]);
        }
        Cache::forget('settings');
    }
}
