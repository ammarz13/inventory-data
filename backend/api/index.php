<?php

define('LARAVEL_START', microtime(true));
http_response_code(200);
header('Content-Type: application/json');

ob_start();
register_shutdown_function(function () {
    $err = error_get_last();
    if ($err && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR], true)) {
        ob_clean();
        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode(['step' => 'fatal_error', 'error' => $err]);
    } else {
        ob_end_flush();
    }
});

// Step 1: vendor
$autoload = __DIR__ . '/../vendor/autoload.php';
if (!file_exists($autoload)) {
    ob_clean();
    echo json_encode(['step' => 'vendor_missing', 'tried' => $autoload]);
    exit;
}
require $autoload;

// Step 2: SQLite setup
$dbDest   = '/tmp/invenpro.sqlite';
$dbSource = __DIR__ . '/../database/database.sqlite';
if (!file_exists($dbDest) && file_exists($dbSource)) {
    copy($dbSource, $dbDest);
}
putenv('DB_CONNECTION=sqlite');
putenv("DB_DATABASE=$dbDest");
$_ENV['DB_CONNECTION'] = $_SERVER['DB_CONNECTION'] = 'sqlite';
$_ENV['DB_DATABASE']   = $_SERVER['DB_DATABASE']   = $dbDest;

// Step 3: writable storage in /tmp
$storagePath = '/tmp/storage';
foreach ([
    "$storagePath/app", "$storagePath/app/public",
    "$storagePath/framework/sessions", "$storagePath/framework/views",
    "$storagePath/framework/cache/data", "$storagePath/logs",
] as $dir) {
    if (!is_dir($dir)) mkdir($dir, 0777, true);
}

// Step 4: writable bootstrap/cache in /tmp
// PackageManifest needs to write to bootstrap/cache — /var/task is read-only on Vercel
$bootstrapCache = '/tmp/bootstrap/cache';
if (!is_dir($bootstrapCache)) mkdir($bootstrapCache, 0777, true);
$srcCache = __DIR__ . '/../bootstrap/cache';
foreach (['packages.php', 'services.php'] as $f) {
    $dst = "$bootstrapCache/$f";
    if (!file_exists($dst) && file_exists("$srcCache/$f")) {
        copy("$srcCache/$f", $dst);
    }
}

// Step 5: bootstrap app
try {
    $app = require_once __DIR__ . '/../bootstrap/app.php';
} catch (\Throwable $e) {
    ob_clean();
    echo json_encode(['step' => 'bootstrap_failed', 'error' => $e->getMessage()]);
    exit;
}

$app->useStoragePath($storagePath);
$app->useBootstrapPath('/tmp/bootstrap');

// Step 6: handle request
try {
    $app->handleRequest(Illuminate\Http\Request::capture());
} catch (\Throwable $e) {
    ob_clean();
    echo json_encode([
        'step'  => 'handle_request_exception',
        'error' => $e->getMessage(),
        'class' => get_class($e),
        'file'  => str_replace('/var/task/', '', $e->getFile()),
        'line'  => $e->getLine(),
    ]);
}
