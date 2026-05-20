<?php

http_response_code(200);
header('Content-Type: application/json');

$info = [
    'php'        => PHP_VERSION,
    'vercel'     => getenv('VERCEL'),
    'cwd'        => getcwd(),
    'dir'        => __DIR__,
    'extensions' => ['pdo_sqlite' => extension_loaded('pdo_sqlite'), 'pdo_pgsql' => extension_loaded('pdo_pgsql')],
];

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
    echo json_encode(['step' => 'vendor_missing', 'tried' => $autoload, 'info' => $info]);
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

// Step 3: storage dirs
$storagePath = '/tmp/storage';
foreach ([
    "$storagePath/app", "$storagePath/app/public",
    "$storagePath/framework/sessions", "$storagePath/framework/views",
    "$storagePath/framework/cache/data", "$storagePath/logs",
] as $dir) {
    if (!is_dir($dir)) mkdir($dir, 0777, true);
}

// Step 4: create app
try {
    $app = require_once __DIR__ . '/../bootstrap/app.php';
} catch (\Throwable $e) {
    ob_clean();
    echo json_encode(['step' => 'bootstrap_failed', 'error' => $e->getMessage(), 'info' => $info]);
    exit;
}
$app->useStoragePath($storagePath);

// Step 5: run each bootstrapper individually to find which one fails
$bootstrappers = [
    \Illuminate\Foundation\Bootstrap\LoadEnvironmentVariables::class,
    \Illuminate\Foundation\Bootstrap\LoadConfiguration::class,
    \Illuminate\Foundation\Bootstrap\HandleExceptions::class,
    \Illuminate\Foundation\Bootstrap\RegisterFacades::class,
    \Illuminate\Foundation\Bootstrap\RegisterProviders::class,
    \Illuminate\Foundation\Bootstrap\BootProviders::class,
];

foreach ($bootstrappers as $bs) {
    try {
        $app->make($bs)->bootstrap($app);
    } catch (\Throwable $e) {
        ob_clean();
        echo json_encode([
            'step'         => 'bootstrapper_failed',
            'bootstrapper' => class_basename($bs),
            'error'        => $e->getMessage(),
            'class'        => get_class($e),
            'file'         => str_replace('/var/task/', '', $e->getFile()),
            'line'         => $e->getLine(),
            'info'         => $info,
        ]);
        exit;
    }
}

// Step 6: check if view is bound after all providers registered
$viewBound  = $app->bound('view');
$keyPresent = !empty(config('app.key'));

ob_clean();
echo json_encode([
    'step'       => 'providers_ok',
    'view_bound' => $viewBound,
    'key_set'    => $keyPresent,
    'db_conn'    => config('database.default'),
    'info'       => $info,
]);
