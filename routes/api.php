<?php

use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AffiliateController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CatalogController;
use App\Http\Controllers\Api\V1\OrderController;
use Illuminate\Support\Facades\Route;

// REST API used by the Android app.
Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:10,1');

    Route::get('/home', [CatalogController::class, 'home']);
    Route::get('/products', [CatalogController::class, 'products']);
    Route::get('/products/{product:slug}', [CatalogController::class, 'product']);
    Route::post('/referrals/click', [AffiliateController::class, 'click'])->middleware('throttle:60,1');

    Route::middleware(['auth:sanctum', 'active'])->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        Route::get('/orders', [OrderController::class, 'index']);
        Route::post('/orders', [OrderController::class, 'store']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);
        Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);

        Route::middleware('role:affiliate')->prefix('affiliate')->group(function () {
            Route::get('/dashboard', [AffiliateController::class, 'dashboard']);
            Route::get('/commissions', [AffiliateController::class, 'commissions']);
            Route::get('/payouts', [AffiliateController::class, 'payouts']);
            Route::post('/payouts', [AffiliateController::class, 'requestPayout']);
        });

        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::get('/stats', [AdminController::class, 'stats']);
            Route::get('/vendors', [AdminController::class, 'vendors']);
            Route::patch('/vendors/{vendor}', [AdminController::class, 'updateVendor']);
            Route::get('/affiliates', [AdminController::class, 'affiliates']);
            Route::patch('/affiliates/{affiliate}', [AdminController::class, 'updateAffiliate']);
            Route::get('/orders', [AdminController::class, 'orders']);
            Route::get('/orders/{order}', [AdminController::class, 'order']);
            Route::get('/payouts', [AdminController::class, 'payouts']);
            Route::patch('/payouts/{payout}', [AdminController::class, 'updatePayout']);
        });
    });
});
