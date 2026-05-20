<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        apiPrefix: '',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Pure API backend — always return JSON
        $isApi = fn(Request $r) => true;

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
                $msg = app()->isProduction() ? 'Database error.' : $e->getMessage();
                return response()->json(['message' => $msg], 500);
            }
        });

        $exceptions->render(function (\Throwable $e, Request $request) use ($isApi) {
            if ($isApi($request)) {
                $msg = app()->isProduction() ? 'Server error.' : $e->getMessage();
                return response()->json(['message' => $msg], 500);
            }
        });
    })->create();
