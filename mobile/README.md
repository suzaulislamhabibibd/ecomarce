# HaatBazar Android app

React Native app built with **Expo SDK 58** and **Expo Router**. It talks to the Laravel REST API (`/api/v1`).

## Features

- **Shop:** home with search and category filters, product details, cart (stored on the device), Cash on Delivery checkout, order history and cancellation
- **Scan:** QR scanner. Point it at the QR code on any product page of the website and the product opens in the app. If the QR belongs to an affiliate (`?ref=CODE`), the referral is recorded and the next order credits that affiliate.
- **Affiliate:** stats, a personal QR code, link sharing, commission list and payout requests
- **Admin:** dashboard stats, approve or suspend vendors and affiliates, all orders, mark payouts paid or rejected
- **Deep links:** `haatbazar://product/<slug>` and, with Android App Links set up, `https://<your-domain>/product/<slug>`

Vendors manage their shops from the website's Seller Center.

## Setup

```bash
cd mobile
npm install
```

Set the API address in `app.json` → `expo.extra.apiUrl` (and `webHosts` → the domains your website QR codes use). You can also override it for local testing:

```bash
EXPO_PUBLIC_API_URL=http://192.168.0.10:8000 npx expo start
```

When testing locally, run Laravel with `php artisan serve --host=0.0.0.0` and set `APP_URL=http://192.168.0.10:8000` in the Laravel `.env`. The QR codes then contain an address your phone can reach. Use your computer's LAN IP.

The QR scanner uses `expo-camera`. Use a development build (`npx expo run:android`) or an APK. Expo Go works for quick testing.

## Build an APK

The app uses [EAS Build](https://docs.expo.dev/build/introduction/) (cloud build, no Android Studio needed):

```bash
npx eas-cli@latest login
```

```bash
npx eas-cli@latest build -p android --profile preview
```

The `preview` profile builds an installable `.apk`, and `production` builds an `.aab` for the Play Store (see `eas.json`).

For App Links (opening website links directly in the app), copy the SHA-256 fingerprint of your signing key (from `eas credentials`) into `ANDROID_SHA256_FINGERPRINTS` in the Laravel `.env`. Then replace `haatbazar.com` in `app.json` → `android.intentFilters` with your domain.

## Structure

```
src/app/            Expo Router screens
  (tabs)/           Home, Scan, Cart, Account
  product/[slug]    Product details (+ share/QR)
  orders/           Order list and details
  affiliate/        Affiliate dashboard
  admin/            Admin screens
src/lib/            API client, auth (SecureStore token), cart, QR/referral parsing
src/components/     UI building blocks
```
