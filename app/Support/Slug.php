<?php

namespace App\Support;

use Illuminate\Support\Str;

class Slug
{
    /** Generate a slug unique within the model's table, ignoring $ignoreId. */
    public static function unique(string $model, string $value, ?int $ignoreId = null): string
    {
        $base = Str::slug($value) ?: Str::lower(Str::random(8));
        $slug = $base;
        $i = 2;

        while ($model::where('slug', $slug)->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))->exists()) {
            $slug = $base.'-'.$i++;
        }

        return $slug;
    }
}
