<?php

namespace App\Console\Commands;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use PDO;
use Throwable;

/**
 * Runs on every Vercel build (composer "vercel" script): migrates the
 * database and, on an empty database, creates the first admin account
 * (and optionally the demo catalog). Never fails the build.
 */
class SetupDatabase extends Command
{
    protected $signature = 'app:setup-database';

    protected $description = 'Migrate the database and create the first admin on a fresh install';

    public function handle(): int
    {
        if (config('database.default') === 'mysql' && in_array(config('database.connections.mysql.host'), [null, '', '127.0.0.1', 'localhost'], true) && env('VERCEL')) {
            $this->warn('Skipping database setup: DB_HOST is not configured.');

            return self::SUCCESS;
        }

        // Fail fast on a wrong host instead of hanging the build.
        $connection = config('database.default');
        if (config("database.connections.{$connection}.driver") !== 'sqlite') {
            config(["database.connections.{$connection}.options" => (config("database.connections.{$connection}.options") ?? []) + [PDO::ATTR_TIMEOUT => 10]]);
            DB::purge($connection);
        }

        try {
            DB::connection()->getPdo();
        } catch (Throwable $e) {
            $this->warn('Skipping database setup: cannot connect to the database ('.$e->getMessage().').');

            return self::SUCCESS;
        }

        try {
            $this->call('migrate', ['--force' => true]);

            if (User::count() === 0) {
                $this->installFirstRun();
            }
        } catch (Throwable $e) {
            $this->error('Database setup failed: '.$e->getMessage());
        }

        return self::SUCCESS;
    }

    private function installFirstRun(): void
    {
        if (filter_var(env('SEED_DEMO_DATA', false), FILTER_VALIDATE_BOOL)) {
            $this->call('db:seed', ['--force' => true]);
            $this->info('Demo data seeded.');
        } else {
            Setting::put(Setting::DEFAULTS);
        }

        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');
        if (! $email || ! $password) {
            $this->warn('Set ADMIN_EMAIL and ADMIN_PASSWORD to create your own admin account.');

            return;
        }

        $admin = User::where('role', User::ROLE_ADMIN)->first() ?? new User(['role' => User::ROLE_ADMIN]);
        $admin->fill(['name' => 'Site Admin', 'email' => $email, 'password' => $password, 'role' => User::ROLE_ADMIN])->save();
        $this->info("Admin account ready: {$email}");
    }
}
