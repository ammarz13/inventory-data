<?php

define('LARAVEL_START', microtime(true));

// Vercel: only /tmp is writable at runtime
$storagePath = '/tmp/storage';
foreach ([
    "$storagePath/framework/sessions",
    "$storagePath/framework/views",
    "$storagePath/framework/cache/data",
    "$storagePath/logs",
] as $dir) {
    if (!is_dir($dir)) mkdir($dir, 0777, true);
}

// On Vercel, use the pre-built SQLite database — no external DB required
if (getenv('VERCEL') === '1') {
    $dbDest = '/tmp/invenpro.sqlite';
    if (!file_exists($dbDest)) {
        $dbSource = __DIR__ . '/../database/database.sqlite';
        if (file_exists($dbSource)) copy($dbSource, $dbDest);
    }
    putenv('DB_CONNECTION=sqlite');
    putenv("DB_DATABASE=$dbDest");
    $_ENV['DB_CONNECTION']    = 'sqlite';
    $_ENV['DB_DATABASE']      = $dbDest;
    $_SERVER['DB_CONNECTION'] = 'sqlite';
    $_SERVER['DB_DATABASE']   = $dbDest;
}

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->useStoragePath($storagePath);

$app->handleRequest(Illuminate\Http\Request::capture());
