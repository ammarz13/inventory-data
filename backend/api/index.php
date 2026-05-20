<?php

// Return 200 so Vercel doesn't strip the body — pure diagnostic
http_response_code(200);
header('Content-Type: application/json');

$info = [
    'php'    => PHP_VERSION,
    'vercel' => getenv('VERCEL'),
    'cwd'    => getcwd(),
];

// Step 1: vendor
$autoload = __DIR__ . '/../vendor/autoload.php';
if (!file_exists($autoload)) {
    echo json_encode(['step' => 'vendor_missing', 'path' => $autoload, 'info' => $info]);
    exit;
}

// Step 2: load autoloader
try {
    require $autoload;
} catch (\Throwable $e) {
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
    echo json_encode(['step' => 'bootstrap_failed', 'error' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine(), 'info' => $info]);
    exit;
}

// Step 6: handle request
$app->useStoragePath($storagePath);

echo json_encode(['step' => 'all_ok', 'db_source_exists' => file_exists($dbSource), 'db_dest_exists' => file_exists($dbDest), 'db_copied' => $dbCopied, 'info' => $info]);
// Uncomment when ready to go live:
// $app->handleRequest(Illuminate\Http\Request::capture());
