<?php

define('LARAVEL_START', microtime(true));

// Catch PHP fatal errors that escape try/catch
register_shutdown_function(function () {
    $err = error_get_last();
    if ($err && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR], true)) {
        while (ob_get_level() > 0) ob_end_clean();
        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode(['step' => 'fatal_error', 'error' => $err]);
    }
});

// Step 1: vendor
$autoload = __DIR__ . '/../vendor/autoload.php';
if (!file_exists($autoload)) {
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode(['step' => 'vendor_missing', 'tried' => $autoload]);
    exit;
}
require $autoload;

// Step 2: force PostgreSQL via Supabase pooler (IPv4, works on Vercel)
// Direct Supabase host is IPv6-only; pooler resolves to IPv4.
// Also ensures env vars are set even if Dotenv can't override process env.
foreach ([
    'DB_CONNECTION' => 'pgsql',
    'DB_HOST'       => 'ep-withered-forest-ap6stnl2-pooler.c-7.us-east-1.aws.neon.tech',
    'DB_PORT'       => '5432',
    'DB_DATABASE'   => 'neondb',
    'DB_USERNAME'   => 'neondb_owner',
    'DB_PASSWORD'   => 'npg_0CGYP7AeoRvB',
    'DB_SSLMODE'    => 'require',
] as $k => $v) {
    putenv("$k=$v");
    $_ENV[$k] = $_SERVER[$k] = $v;
}

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
// PackageManifest tries to write here; /var/task is read-only on Vercel
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
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode(['step' => 'bootstrap_failed', 'error' => $e->getMessage()]);
    exit;
}

$app->useStoragePath($storagePath);
$app->useBootstrapPath('/tmp/bootstrap');

// Step 6: handle request
$request = Illuminate\Http\Request::capture();
try {
    $app->handleRequest($request);
} catch (\Throwable $e) {
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        'step'   => 'handle_request_exception',
        'method' => $request->method(),
        'path'   => $request->path(),
        'error'  => $e->getMessage(),
        'class'  => get_class($e),
        'file'   => str_replace('/var/task/', '', $e->getFile()),
        'line'   => $e->getLine(),
    ]);
}
