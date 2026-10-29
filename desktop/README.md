# HaatBazar desktop app (Windows)

An Electron app that opens the HaatBazar website in its own window, with menus for the storefront, My orders, Seller Center, Affiliate Center and the Admin panel.

- **First run:** choose the server. The options are the live website, this PC (Laragon / `php artisan serve` at `http://127.0.0.1:8000`) or any other address. The app checks that the address is really a HaatBazar server (`/api/v1/home`) before saving it. You can change it later under **HaatBazar → Server settings…**.
- **Offline or wrong address:** the app shows the settings page with the error, so you can retry or switch servers.
- **Security:** only pages from the chosen server open inside the app. Other links (payment pages, social media) open in your default browser. The website gets no access to Node.js or to the app settings (context isolation, sandbox). Every permission is denied except copying a link to the clipboard.

## Run in development

```bash
cd desktop
npm install
npm start
```

Set `HAATBAZAR_SERVER=http://127.0.0.1:8000` to skip the server screen.

## Build the Windows installer

```bash
npm run build:win
```

This produces, in `dist/`:

- `HaatBazar-Setup-<version>.exe`: an installer, which adds Start-menu and desktop shortcuts
- `HaatBazar-Portable-<version>.exe`: a single file that runs without installing

You can build on Windows directly. On Linux or macOS the build needs Wine, both 64- and 32-bit. The executables are not code-signed, so Windows SmartScreen may show "Windows protected your PC" → **More info → Run anyway**.

## Tests

```bash
npm test
```
