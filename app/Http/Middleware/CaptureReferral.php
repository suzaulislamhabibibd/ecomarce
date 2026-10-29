<?php

namespace App\Http\Middleware;

use App\Models\Affiliate;
use App\Models\AffiliateClick;
use App\Models\Product;
use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Response;

/**
 * Remembers ?ref=CODE links in a cookie so the referring affiliate
 * gets credit when the visitor later places an order.
 */
class CaptureReferral
{
    public const COOKIE = 'hb_ref';

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $code = $request->query('ref');
        if (! is_string($code) || ! $request->isMethod('GET')) {
            return $response;
        }

        $affiliate = Affiliate::findActiveByCode($code);
        if (! $affiliate || $affiliate->user_id === $request->user()?->id) {
            return $response;
        }

        $product = $request->route('product');
        AffiliateClick::record(
            $affiliate,
            $product instanceof Product ? $product->id : null,
            $request->query('src') === 'qr' ? 'qr' : 'web',
            $request->ip(),
        );

        $minutes = (int) Setting::get('affiliate_cookie_days', 30) * 24 * 60;
        $response->headers->setCookie(Cookie::make(self::COOKIE, $affiliate->code, $minutes));

        return $response;
    }
}
