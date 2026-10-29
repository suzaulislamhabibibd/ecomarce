<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Review;
use App\Models\Setting;
use App\Models\User;
use App\Models\Vendor;
use App\Services\Cart;
use App\Services\OrderService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Setting::put(Setting::DEFAULTS);

        User::create([
            'name' => 'Site Admin',
            'email' => 'admin@haatbazar.test',
            'password' => 'password',
            'role' => User::ROLE_ADMIN,
        ]);

        $categories = collect(['Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Groceries', 'Books'])
            ->mapWithKeys(fn ($name) => [$name => Category::create(['name' => $name, 'slug' => Str::slug($name)])]);

        $catalog = [
            ['Tech Corner', 'tech@haatbazar.test', 'Gadgets and accessories at honest prices.', [
                ['Wireless Earbuds Pro', 'Electronics', 2490, 3200],
                ['20000mAh Power Bank', 'Electronics', 1850, null],
                ['Smart Watch S5', 'Electronics', 3990, 4990],
                ['USB-C Fast Charger 65W', 'Electronics', 1290, null],
                ['Mechanical Keyboard', 'Electronics', 4500, 5200],
                ['Bluetooth Speaker Mini', 'Electronics', 1590, null],
            ]],
            ['Deshi Fashion House', 'fashion@haatbazar.test', 'Handcrafted Bangladeshi clothing.', [
                ['Cotton Panjabi - Navy', 'Fashion', 1650, 1990],
                ['Jamdani Saree', 'Fashion', 6800, null],
                ['Men\'s Polo Shirt', 'Fashion', 690, 850],
                ['Leather Wallet', 'Fashion', 850, null],
                ['Kids Frock Set', 'Fashion', 990, 1200],
                ['Handloom Gamcha (2 pcs)', 'Home & Living', 350, null],
            ]],
            ['Green Basket', 'grocery@haatbazar.test', 'Fresh and organic groceries delivered.', [
                ['Sundarban Honey 500g', 'Groceries', 650, 750],
                ['Chinigura Rice 5kg', 'Groceries', 820, null],
                ['Mustard Oil 1L', 'Groceries', 310, null],
                ['Green Tea 100 bags', 'Groceries', 450, 520],
                ['Aloe Vera Gel', 'Beauty', 380, null],
                ['Natural Neem Soap', 'Beauty', 120, 150],
            ]],
            ['Boighor', 'books@haatbazar.test', 'Books for every reader.', [
                ['Learn Laravel the Smart Way', 'Books', 750, 900],
                ['React for Beginners', 'Books', 680, null],
                ['Bangla Classic Stories', 'Books', 420, null],
                ['Ceramic Coffee Mug', 'Home & Living', 390, 450],
            ]],
        ];

        $vendors = [];
        foreach ($catalog as [$shop, $email, $about, $products]) {
            $user = User::create([
                'name' => $shop.' Owner',
                'email' => $email,
                'password' => 'password',
                'role' => User::ROLE_VENDOR,
            ]);
            $vendor = Vendor::create([
                'user_id' => $user->id,
                'shop_name' => $shop,
                'slug' => Str::slug($shop),
                'description' => $about,
                'phone' => '01700000000',
                'address' => 'Dhaka, Bangladesh',
                'status' => Vendor::STATUS_APPROVED,
            ]);
            foreach ($products as [$name, $category, $price, $compare]) {
                $vendor->products()->create([
                    'category_id' => $categories[$category]->id,
                    'name' => $name,
                    'slug' => Str::slug($name),
                    'description' => "{$name} from {$shop}. Quality checked and shipped across Bangladesh.",
                    'price' => $price,
                    'compare_price' => $compare,
                    'stock' => rand(8, 60),
                    'status' => 'active',
                ]);
            }
            $vendors[] = $vendor;
        }

        // A vendor waiting for approval, to demo the admin workflow.
        $pendingUser = User::create([
            'name' => 'New Seller',
            'email' => 'pending@haatbazar.test',
            'password' => 'password',
            'role' => User::ROLE_VENDOR,
        ]);
        Vendor::create([
            'user_id' => $pendingUser->id,
            'shop_name' => 'Craft Village',
            'slug' => 'craft-village',
            'description' => 'Handmade crafts.',
            'status' => Vendor::STATUS_PENDING,
        ]);

        $customer = User::create([
            'name' => 'Rahim Uddin',
            'email' => 'customer@haatbazar.test',
            'phone' => '01800000000',
            'password' => 'password',
            'role' => User::ROLE_CUSTOMER,
        ]);

        $this->seedOrders($customer);
    }

    /** One delivered multi-vendor order (with reviews) and one pending order. */
    private function seedOrders(User $customer): void
    {
        $orders = app(OrderService::class);
        $cart = app(Cart::class);
        $shipping = [
            'shipping_name' => $customer->name,
            'shipping_phone' => $customer->phone,
            'shipping_address' => 'House 12, Road 5, Dhanmondi',
            'shipping_city' => 'Dhaka',
        ];

        foreach (['wireless-earbuds-pro', 'sundarban-honey-500g', 'cotton-panjabi-navy'] as $slug) {
            $cart->add(Product::where('slug', $slug)->first(), 1);
        }
        $delivered = $orders->place($customer, $shipping, $cart);
        foreach ($delivered->items as $item) {
            foreach (['processing', 'shipped', 'delivered'] as $status) {
                $orders->updateItemStatus($item->fresh(), $status);
            }
            Review::create([
                'product_id' => $item->product_id,
                'user_id' => $customer->id,
                'rating' => rand(4, 5),
                'comment' => 'Great quality and fast delivery. Recommended!',
            ]);
        }

        foreach (['smart-watch-s5', 'jamdani-saree'] as $slug) {
            $cart->add(Product::where('slug', $slug)->first(), 1);
        }
        $orders->place($customer, $shipping, $cart);
    }
}
