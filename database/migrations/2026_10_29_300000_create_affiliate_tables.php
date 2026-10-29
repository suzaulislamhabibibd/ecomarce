<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['customer', 'vendor', 'admin', 'affiliate'])->default('customer')->change();
        });

        Schema::create('affiliates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('code', 20)->unique();
            $table->string('promo_channel')->nullable();
            $table->enum('status', ['pending', 'approved', 'suspended'])->default('pending')->index();
            // Null means the global affiliate rate from settings applies.
            $table->decimal('commission_rate', 5, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('affiliate_clicks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('affiliate_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('source', 10)->default('web');
            $table->string('ip_hash', 64)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['affiliate_id', 'created_at']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('affiliate_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
        });

        Schema::create('affiliate_commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('affiliate_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('rate', 5, 2);
            $table->decimal('order_amount', 12, 2);
            $table->decimal('amount', 12, 2);
            // pending until the order is delivered; cancelled if every item is cancelled.
            $table->enum('status', ['pending', 'approved', 'cancelled'])->default('pending')->index();
            $table->timestamps();
        });

        Schema::table('payouts', function (Blueprint $table) {
            $table->foreignId('vendor_id')->nullable()->change();
            $table->foreignId('affiliate_id')->nullable()->after('vendor_id')->constrained()->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('payouts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('affiliate_id');
        });
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('affiliate_id');
        });
        Schema::dropIfExists('affiliate_commissions');
        Schema::dropIfExists('affiliate_clicks');
        Schema::dropIfExists('affiliates');
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['customer', 'vendor', 'admin'])->default('customer')->change();
        });
    }
};
