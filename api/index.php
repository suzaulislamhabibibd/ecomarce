<?php

/*
| Vercel entry point (vercel-php runtime). Every request that is not a
| static file is routed here by vercel.json and handed to Laravel.
*/

// Laravel's storage directory is moved to /tmp on Vercel (see bootstrap/app.php).
foreach (['app/public', 'framework/cache/data', 'framework/sessions', 'framework/views', 'logs'] as $dir) {
    if (! is_dir($path = '/tmp/storage/'.$dir)) {
        mkdir($path, 0755, true);
    }
}

// The request reaches us as /api/index.php; without this Laravel would treat
// "/api" as the base path and strip it from URLs such as /api/v1/home.
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = __DIR__.'/../public/index.php';

require __DIR__.'/../public/index.php';
