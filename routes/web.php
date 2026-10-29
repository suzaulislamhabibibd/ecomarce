<?php

use App\Http\Controllers\Account\OrderController as AccountOrderController;
use App\Http\Controllers\Admin;
use App\Http\Controllers\Affiliate\AffiliateController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\Vendor;
use Illuminate\Support\Facades\Route;

// Android App Links verification (see config/services.php).
Route::get('/.well-known/assetlinks.json', fn () => response()->json([[
    'relation' => ['delegate_permission/common.handle_all_urls'],
    'target' => [
        'namespace' => 'android_app',
        'package_name' => config('services.android.package'),
        'sha256_cert_fingerprints' => array_values(config('services.android.sha256_fingerprints')),
    ],
]]));

// Storefront
Route::get('/', HomeController::class)->name('home');
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/product/{product:slug}', [ProductController::class, 'show'])->name('products.show');
Route::get('/stores', [StoreController::class, 'index'])->name('stores.index');
Route::get('/store/{vendor:slug}', [StoreController::class, 'show'])->name('stores.show');

Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
Route::patch('/cart/{product}', [CartController::class, 'update'])->whereNumber('product')->name('cart.update');
Route::delete('/cart/{product}', [CartController::class, 'destroy'])->whereNumber('product')->name('cart.destroy');

// Auth
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/checkout', [CheckoutController::class, 'create'])->name('checkout.create');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
    Route::post('/product/{product}/reviews', [ReviewController::class, 'store'])->name('reviews.store');

    Route::get('/account/orders', [AccountOrderController::class, 'index'])->name('account.orders.index');
    Route::get('/account/orders/{order}', [AccountOrderController::class, 'show'])->name('account.orders.show');
    Route::post('/account/orders/{order}/cancel', [AccountOrderController::class, 'cancel'])->name('account.orders.cancel');

    Route::get('/affiliate/join', [AffiliateController::class, 'join'])->name('affiliate.join');
    Route::post('/affiliate/join', [AffiliateController::class, 'storeJoin'])->name('affiliate.join.store');

    Route::get('/sell', [Vendor\ShopController::class, 'apply'])->name('vendor.apply');
    Route::post('/sell', [Vendor\ShopController::class, 'storeApplication'])->name('vendor.apply.store');
});

// Vendor panel
Route::middleware(['auth', 'role:vendor'])->prefix('vendor')->name('vendor.')->group(function () {
    Route::get('/', Vendor\DashboardController::class)->name('dashboard');
    Route::resource('products', Vendor\ProductController::class)->except('show');
    Route::get('/orders', [Vendor\OrderController::class, 'index'])->name('orders.index');
    Route::patch('/orders/{item}', [Vendor\OrderController::class, 'update'])->name('orders.update');
    Route::get('/payouts', [Vendor\PayoutController::class, 'index'])->name('payouts.index');
    Route::post('/payouts', [Vendor\PayoutController::class, 'store'])->name('payouts.store');
    Route::get('/shop', [Vendor\ShopController::class, 'edit'])->name('shop.edit');
    Route::post('/shop', [Vendor\ShopController::class, 'update'])->name('shop.update');
});

// Affiliate panel
Route::middleware(['auth', 'role:affiliate'])->prefix('affiliate')->name('affiliate.')->group(function () {
    Route::get('/', [AffiliateController::class, 'dashboard'])->name('dashboard');
    Route::get('/links', [AffiliateController::class, 'links'])->name('links');
    Route::get('/commissions', [AffiliateController::class, 'commissions'])->name('commissions');
    Route::get('/payouts', [AffiliateController::class, 'payouts'])->name('payouts.index');
    Route::post('/payouts', [AffiliateController::class, 'requestPayout'])->name('payouts.store');
});

// Admin panel
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', Admin\DashboardController::class)->name('dashboard');
    Route::get('/vendors', [Admin\VendorController::class, 'index'])->name('vendors.index');
    Route::patch('/vendors/{vendor}', [Admin\VendorController::class, 'update'])->name('vendors.update');
    Route::resource('categories', Admin\CategoryController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::get('/products', [Admin\ProductController::class, 'index'])->name('products.index');
    Route::post('/products/{product}/toggle-block', [Admin\ProductController::class, 'toggleBlock'])->name('products.toggle-block');
    Route::get('/orders', [Admin\OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [Admin\OrderController::class, 'show'])->name('orders.show');
    Route::get('/users', [Admin\UserController::class, 'index'])->name('users.index');
    Route::post('/users/{user}/toggle-active', [Admin\UserController::class, 'toggleActive'])->name('users.toggle-active');
    Route::get('/affiliates', [Admin\AffiliateController::class, 'index'])->name('affiliates.index');
    Route::patch('/affiliates/{affiliate}', [Admin\AffiliateController::class, 'update'])->name('affiliates.update');
    Route::get('/payouts', [Admin\PayoutController::class, 'index'])->name('payouts.index');
    Route::patch('/payouts/{payout}', [Admin\PayoutController::class, 'update'])->name('payouts.update');
    Route::get('/settings', [Admin\SettingController::class, 'edit'])->name('settings.edit');
    Route::put('/settings', [Admin\SettingController::class, 'update'])->name('settings.update');
});
