# HaatBazar — Multivendor E-commerce

A multivendor marketplace built with **Laravel 13**, **React 19** (via **Inertia.js**), **Vite**, **Tailwind CSS 4** and **MySQL**.

Customers shop from many sellers in one cart. Each order is split into per-vendor items that every seller fulfils on their own. The platform keeps a commission on each sale, and vendors withdraw their earnings.

## Features

**Customers**
- Browse, search, filter by category and price, and sort products
- Product pages with ratings and reviews (only verified buyers can review)
- Session cart with items from many vendors, and Cash on Delivery checkout
- Order history, per-item tracking, and cancellation while the order is still pending

**Vendors (Seller Center)**
- Sign up as a seller, or apply later from a customer account. An admin approves each shop.
- Dashboard with sales, earnings, available balance and low-stock alerts
- Product CRUD with image upload, draft/active status, and a compare-at price for discounts
- Order fulfilment: `pending → processing → shipped → delivered`, or cancel (stock is restored)
- Withdrawal requests (bKash / Nagad / Rocket / Bank), limited to the available balance
- Shop profile with a logo and a public store page

**Admin**
- Dashboard: gross sales (GMV), commission earned, top vendors, recent orders
- Approve or suspend vendors and set a custom commission rate per vendor
- Manage categories, block or unblock products, view all orders with the commission breakdown
- Process payouts (mark paid or reject), activate or deactivate users
- Settings: marketplace name, default commission %, shipping fee

## How the money works

- Each order line stores `line_total`, `commission` (the vendor's rate, or the global rate) and `vendor_earning`.
- A vendor's **available balance** is delivered earnings minus payouts that are requested or already paid.
- The order status is derived from its items. When every item is delivered, the order is marked **paid** (COD).

## Setup

Requirements: PHP 8.3+, Composer, Node 20+, MySQL 8 / MariaDB 10.6+.

```bash
git clone <repo-url> haatbazar && cd haatbazar
composer install
npm install
cp .env.example .env
php artisan key:generate
```

Create the database, then set `DB_DATABASE`, `DB_USERNAME` and `DB_PASSWORD` in `.env`:

```sql
CREATE DATABASE haatbazar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```bash
php artisan migrate --seed
php artisan storage:link
```

Run the app (two terminals):

```bash
php artisan serve
npm run dev
```

Open http://localhost:8000. For production, run `npm run build` instead of `npm run dev`.

### Demo accounts (password: `password`)

| Role | Email |
|---|---|
| Admin | admin@haatbazar.test |
| Vendor | tech@haatbazar.test, fashion@haatbazar.test, grocery@haatbazar.test, books@haatbazar.test |
| Pending vendor | pending@haatbazar.test |
| Customer | customer@haatbazar.test |

> Change or remove these accounts before going live.

## Tests

```bash
php artisan test
```

The feature tests use in-memory SQLite (see `phpunit.xml`). They cover order splitting and commission, stock limits, the fulfilment flow, cancellation, role protection, vendor approval and payout limits.

## Project structure

```
app/
  Http/Controllers/          Storefront: Home, Product, Store, Cart, Checkout, Review
  Http/Controllers/Auth      Login / register (customer or vendor)
  Http/Controllers/Account   Customer orders
  Http/Controllers/Vendor    Seller Center
  Http/Controllers/Admin     Admin panel
  Http/Middleware            Inertia shared props, role guard, inactive-user guard
  Models/                    User, Vendor, Category, Product, Order, OrderItem, Review, Payout, Setting
  Services/                  Cart (session) and OrderService (checkout, status flow)
resources/js/
  Layouts/                   ShopLayout, PanelLayout (vendor/admin)
  Components/                ProductCard, Pagination, Form fields, badges…
  Pages/                     Inertia React pages
```

## Next steps

- Online payment gateway (SSLCommerz / bKash) next to COD
- Email/SMS notifications for order status changes
- Product variants (size and colour) and multiple images
- Coupons and per-vendor shipping rules
