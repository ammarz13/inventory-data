<?php

define('LARAVEL_START', microtime(true));

// Catch any early boot failure and return JSON so we can diagnose
set_exception_handler(function (\Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'boot_error' => true,
        'message'    => $e->getMessage(),
        'file'       => str_replace('/var/task/', '', $e->getFile()),
        'line'       => $e->getLine(),
    ]);
    exit;
});

// Vercel: only /tmp is writable at runtime
$storagePath = '/tmp/storage';
foreach ([
    "$storagePath/app",
    "$storagePath/app/public",
    "$storagePath/framework/sessions",
    "$storagePath/framework/views",
    "$storagePath/framework/cache/data",
    "$storagePath/logs",
] as $dir) {
    if (!is_dir($dir)) mkdir($dir, 0777, true);
}

// On Vercel, bypass external DB — use the pre-built SQLite database
if (getenv('VERCEL') === '1' || isset($_SERVER['VERCEL'])) {
    $dbDest = '/tmp/invenpro.sqlite';
    if (!file_exists($dbDest)) {
        $dbSource = __DIR__ . '/../database/database.sqlite';
        if (file_exists($dbSource)) {
            copy($dbSource, $dbDest);
        }
    }
    putenv('DB_CONNECTION=sqlite');
    putenv("DB_DATABASE=$dbDest");
    $_ENV['DB_CONNECTION']    = 'sqlite';
    $_ENV['DB_DATABASE']      = $dbDest;
    $_SERVER['DB_CONNECTION'] = 'sqlite';
    $_SERVER['DB_DATABASE']   = $dbDest;
}

if (!file_exists(__DIR__ . '/../vendor/autoload.php')) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['boot_error' => true, 'message' => 'vendor/autoload.php not found — composer install did not run']);
    exit;
}

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->useStoragePath($storagePath);

$app->handleRequest(Illuminate\Http\Request::capture());
