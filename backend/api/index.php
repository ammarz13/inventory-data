<?php

define('LARAVEL_START', microtime(true));

// Vercel serverless: only /tmp is writable at runtime
$storagePath = '/tmp/storage';
foreach ([
    "$storagePath/framework/sessions",
    "$storagePath/framework/views",
    "$storagePath/framework/cache/data",
    "$storagePath/logs",
] as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0777, true);
    }
}

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->useStoragePath($storagePath);

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

$response->send();
$kernel->terminate($request, $response);
