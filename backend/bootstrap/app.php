<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // This backend is API-only — always return JSON for any /api/* request
        $isApi = fn(Request $r) => str_starts_with($r->path(), 'api/') || $r->expectsJson();

        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, Request $request) use ($isApi) {
            if ($isApi($request)) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors'  => $e->errors(),
                ], 422);
            }
        });

        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, Request $request) use ($isApi) {
            if ($isApi($request)) {
                return response()->json(['message' => 'Not found'], 404);
            }
        });

        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException $e, Request $request) use ($isApi) {
            if ($isApi($request)) {
                return response()->json(['message' => 'Method not allowed'], 405);
            }
        });

        $exceptions->render(function (\Illuminate\Database\QueryException $e, Request $request) use ($isApi) {
            if ($isApi($request)) {
                $message = app()->isProduction()
                    ? 'Database error. Please try again later.'
                    : $e->getMessage();
                return response()->json(['message' => $message], 500);
            }
        });

        $exceptions->render(function (\Throwable $e, Request $request) use ($isApi) {
            if ($isApi($request)) {
                $message = app()->isProduction() ? 'Server error.' : $e->getMessage();
                return response()->json(['message' => $message], 500);
            }
        });
    })->create();
