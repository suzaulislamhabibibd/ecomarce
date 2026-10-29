# HaatBazar — Multivendor E-commerce

A multivendor marketplace built with **Laravel 13**, **React 19** (via **Inertia.js**), **Vite**, **Tailwind CSS 4** and **MySQL**, with an affiliate program and an **Android app** (React Native / Expo) that scans product QR codes.

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

**Affiliates (Affiliate Center)**
- Sign up as an affiliate on the website or in the app, or join later from a customer account. An admin approves each affiliate.
- Personal referral code. Any link with `?ref=CODE` is remembered for 30 days (configurable) and credits the affiliate.
- Links & QR page: a referral link and a downloadable QR code for every product, plus a store-wide QR
- Dashboard: clicks, referred orders, conversion, pending and approved earnings, most-clicked products
- The commission (default 5% of the order subtotal) becomes payable only when the order is delivered. Cancelled items are deducted automatically, and self-referrals earn nothing.
- Withdrawal requests, limited to the approved balance

**QR codes**
- Every product page shows a QR code. Scanning it with the HaatBazar app opens that product in the app.
- Approved affiliates see their own affiliate QR on product pages. Scans of it are tracked as `qr` clicks.

**Android app** — see [`mobile/README.md`](mobile/README.md)
- Shopping: browse, search, categories, cart, COD checkout, orders, cancellation
- **QR scanner** that opens the scanned product (and records the affiliate referral)
- Affiliate dashboard with stats, a QR code, link sharing, commissions and payout requests
- Admin panel: stats, approve or suspend vendors and affiliates, orders, process payouts

**Windows desktop app**: see [`desktop/README.md`](desktop/README.md)
- An Electron app with an installer and a portable `.exe`. It opens the storefront and every panel in its own window.
- On first run you pick the server: the live website or this PC (Laragon)

**Admin**
- Dashboard: gross sales (GMV), commission earned, top vendors, recent orders
- Approve or suspend vendors and set a custom commission rate per vendor
- Approve or suspend affiliates and set a custom affiliate rate
- Manage categories, block or unblock products, view all orders with the commission breakdown
- Process payouts (mark paid or reject), activate or deactivate users
- Settings: marketplace name, default commission %, shipping fee, affiliate commission %, referral cookie length

## How the money works

- Each order line stores `line_total`, `commission` (the vendor's rate, or the global rate) and `vendor_earning`.
- A vendor's **available balance** is delivered earnings minus payouts that are requested or already paid.
- The order status is derived from its items. When every item is delivered, the order is marked **paid** (COD).
- Affiliate commission is paid by the platform, as a percentage of the order subtotal. It stays `pending` until delivery, then becomes `approved`. If every item is cancelled, it becomes `cancelled`.

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
| Affiliate (code `KARIM2026`) | affiliate@haatbazar.test |

> Change or remove these accounts before going live.

## REST API (for the app)

Base URL: `/api/v1`. It uses token auth (Laravel Sanctum): send `Authorization: Bearer <token>`.

| Area | Endpoints |
|---|---|
| Auth | `POST auth/login`, `POST auth/register`, `GET auth/me`, `POST auth/logout` |
| Catalog | `GET home`, `GET products?q=&category=&sort=`, `GET products/{slug}` |
| Referral | `POST referrals/click` `{ref, product_slug, source}` |
| Orders | `GET orders`, `POST orders` `{items:[{product_id,quantity}], shipping_*, ref}`, `GET orders/{id}`, `POST orders/{id}/cancel` |
| Affiliate | `GET affiliate/dashboard`, `GET affiliate/commissions`, `GET/POST affiliate/payouts` |
| Admin | `GET admin/stats`, `GET/PATCH admin/vendors`, `GET/PATCH admin/affiliates`, `GET admin/orders[/{id}]`, `GET/PATCH admin/payouts` |

### Android App Links

`/.well-known/assetlinks.json` is served from `ANDROID_PACKAGE` and `ANDROID_SHA256_FINGERPRINTS` in `.env`. With these set, product links and QR codes opened with the phone's normal camera also open straight in the app.

## Deploying

See [DEPLOY-VERCEL.md](DEPLOY-VERCEL.md) for hosting on Vercel (serverless PHP, external MySQL, S3/R2 uploads).

## Tests

```bash
php artisan test
```

The feature tests use in-memory SQLite (see `phpunit.xml`). They cover order splitting and commission, stock limits, the fulfilment flow, cancellation, role protection, vendor approval, payout limits, affiliate referrals and commission rules, and the mobile API.

## Project structure

```
app/
  Http/Controllers/          Storefront: Home, Product, Store, Cart, Checkout, Review
  Http/Controllers/Auth      Login / register (customer or vendor)
  Http/Controllers/Account   Customer orders
  Http/Controllers/Vendor    Seller Center
  Http/Controllers/Admin     Admin panel
  Http/Controllers/Affiliate Affiliate Center
  Http/Controllers/Api/V1    REST API for the Android app
  Http/Middleware            Inertia shared props, role guard, inactive-user guard, referral capture
  Models/                    User, Vendor, Affiliate, AffiliateClick, AffiliateCommission, Category,
                             Product, Order, OrderItem, Review, Payout, Setting
  Services/                  Cart (session) and OrderService (checkout, status flow)
resources/js/
  Layouts/                   ShopLayout, PanelLayout (vendor/admin)
  Components/                ProductCard, Pagination, Form fields, badges…
  Pages/                     Inertia React pages
mobile/                      Android app (Expo / React Native)
desktop/                     Windows desktop app (Electron)
```

## Next steps

- Online payment gateway (SSLCommerz / bKash) next to COD
- Email/SMS notifications for order status changes
- Product variants (size and colour) and multiple images
- Coupons and per-vendor shipping rules
