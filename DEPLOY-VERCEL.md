# Deploying HaatBazar to Vercel

The repository is ready for Vercel. Laravel runs as a serverless function through the community [`vercel-php`](https://github.com/vercel-community/php) runtime (PHP 8.5). The React/Vite assets are served as static files.

| File | Purpose |
|---|---|
| `vercel.json` | Builds the frontend (`npm run build`), routes `/build/*` to static files and everything else to `api/index.php`, and sets serverless env defaults (caches in `/tmp`, logs to stderr, sessions and cache in MySQL) |
| `api/index.php` | Function entry point that boots Laravel |
| `.vercelignore` | Keeps `vendor/`, `node_modules/`, `mobile/` and tests out of the upload |
| `bootstrap/app.php` | Moves `storage/` to `/tmp/storage` when `VERCEL` is set, and trusts proxy headers so URLs use HTTPS |

## 1. Create a MySQL database

Vercel does not host MySQL. Create a database with any hosted MySQL provider, for example TiDB Cloud Serverless, Aiven for MySQL or Railway. Note the host, port, database name, user and password.

Run the migrations (and the demo seed, if you want it) from your computer, against that database:

```bash
DB_HOST=<host> DB_PORT=<port> DB_DATABASE=<db> DB_USERNAME=<user> DB_PASSWORD=<pass> php artisan migrate --force --seed
```

> The seed creates demo accounts with the password `password`. Skip `--seed`, or change those accounts right after deploying.

## 2. Create storage for uploaded images

Vercel's filesystem is not persistent, so product images and shop logos go to S3-compatible storage. Cloudflare R2, AWS S3 and Backblaze B2 all work. Create a bucket with public read access and an access key.

## 3. Import the project in Vercel

1. In Vercel, choose **Add New → Project** and import the `ecomarce` GitHub repository.
2. Framework preset: **Other**. The build settings come from `vercel.json`.
3. Add these **Environment Variables**:

| Variable | Value |
|---|---|
| `APP_KEY` | output of `php artisan key:generate --show` |
| `APP_URL` | `https://<your-project>.vercel.app` (or your domain) |
| `APP_NAME` | `HaatBazar` |
| `DB_CONNECTION` | `mysql` |
| `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | from step 1 |
| `MYSQL_ATTR_SSL_CA` | `/etc/pki/tls/certs/ca-bundle.crt` (if your provider requires TLS) |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `AWS_BUCKET` | from step 2 (`AWS_DEFAULT_REGION=auto` for R2) |
| `AWS_ENDPOINT` | R2/B2 only, e.g. `https://<account>.r2.cloudflarestorage.com` |
| `AWS_URL` | public URL of the bucket, used for image links |
| `ANDROID_SHA256_FINGERPRINTS` | optional, for Android App Links |

4. Click **Deploy**.

Vercel deploys the repository's production branch (usually `main`) to your production URL. Other branches get preview URLs.

## 4. After deploying

- Set `extra.apiUrl` and `extra.webHosts` in `mobile/app.json` to the live URL, so the app and its QR scanner use it.
- Product QR codes contain `APP_URL`. Set it to the final domain before printing any QR codes.

## Limits on serverless

- There are no background workers or cron, so the queue runs synchronously (`QUEUE_CONNECTION=sync`).
- Each request can run for at most 30 seconds (`maxDuration` in `vercel.json`).

## Troubleshooting a 500 "Server error"

If the HaatBazar error page shows, Laravel is running on Vercel but something it needs is missing. To find the cause:

1. Open the deployment in Vercel, then **Logs**. Errors are written there, because `LOG_CHANNEL=stderr`.
2. Or set `APP_DEBUG=true` in **Settings → Environment Variables**, redeploy, open the site and read the error. **Remove it again afterwards**, because it shows secrets to visitors.

Common causes:

| Error | Fix |
|---|---|
| `No application encryption key has been specified` | Add `APP_KEY` (`php artisan key:generate --show`) |
| `SQLSTATE[HY000] [2002]` / `Connection refused` / `timed out` | `DB_HOST`/`DB_PORT` are wrong, or the database does not allow outside connections |
| `SQLSTATE[HY000] [1045] Access denied` | Wrong `DB_USERNAME` / `DB_PASSWORD` |
| `Connections using insecure transport are prohibited` / SSL errors | Set `MYSQL_ATTR_SSL_CA=/etc/pki/tls/certs/ca-bundle.crt` |
| `Base table or view not found: ... sessions` (or `cache`, `products`) | Run `php artisan migrate --force` against the production database |
| `Vite manifest not found` | The build step did not run. Check the build logs for `npm run build` |

After changing environment variables, redeploy. Vercel only applies them to new deployments.
