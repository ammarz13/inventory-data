<?php

http_response_code(200);
header('Content-Type: application/json');

$info = [
    'php'        => PHP_VERSION,
    'vercel'     => getenv('VERCEL'),
    'cwd'        => getcwd(),
    'extensions' => ['pdo' => extension_loaded('pdo'), 'pdo_sqlite' => extension_loaded('pdo_sqlite'), 'pdo_pgsql' => extension_loaded('pdo_pgsql')],
];

// Catch PHP fatal errors (uncatchable by try/catch) via shutdown
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
    echo json_encode(['step' => 'vendor_missing', 'path' => $autoload, 'info' => $info]);
    exit;
}

// Step 2: load autoloader
try {
    require $autoload;
} catch (\Throwable $e) {
    ob_clean();
    echo json_encode(['step' => 'autoload_failed', 'error' => $e->getMessage(), 'info' => $info]);
    exit;
}

// Step 3: SQLite setup
$dbDest   = '/tmp/invenpro.sqlite';
$dbSource = __DIR__ . '/../database/database.sqlite';
$dbCopied = false;
if (!file_exists($dbDest) && file_exists($dbSource)) {
    $dbCopied = copy($dbSource, $dbDest);
}
putenv('DB_CONNECTION=sqlite');
putenv("DB_DATABASE=$dbDest");
$_ENV['DB_CONNECTION'] = $_SERVER['DB_CONNECTION'] = 'sqlite';
$_ENV['DB_DATABASE']   = $_SERVER['DB_DATABASE']   = $dbDest;

// Step 4: storage dirs
$storagePath = '/tmp/storage';
foreach ([
    "$storagePath/app", "$storagePath/app/public",
    "$storagePath/framework/sessions", "$storagePath/framework/views",
    "$storagePath/framework/cache/data", "$storagePath/logs",
] as $dir) {
    if (!is_dir($dir)) mkdir($dir, 0777, true);
}

// Step 5: bootstrap
try {
    $app = require_once __DIR__ . '/../bootstrap/app.php';
} catch (\Throwable $e) {
    ob_clean();
    echo json_encode(['step' => 'bootstrap_failed', 'error' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine(), 'info' => $info]);
    exit;
}

$app->useStoragePath($storagePath);

// Step 6: handle request — crash here will be caught by shutdown function above
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
        'info'  => $info,
    ]);
}
