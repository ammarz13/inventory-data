<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\{
    AuthController,
    DashboardController,
    MachineController,
    MachinePartController,
    CategoryController,
    SupplierController,
    PartyController,
    CashFlowController,
    ProductController,
    RetailSaleController,
    EmployeeController,
    SalaryController,
    ExpenseController,
};

// ─── Public Auth Routes ─────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/login',          [AuthController::class, 'login']);
    Route::post('/forgot-password',[AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// ─── Protected Routes ────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me',      [AuthController::class, 'me']);

    // Profile
    Route::put('/profile', function (Illuminate\Http\Request $request) {
        $user = $request->user();
        $data = $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
        ]);
        $user->update($data);
        return response()->json(['message' => 'Profile updated', 'data' => array_merge($user->fresh()->toArray(), ['role' => $user->getRoleNames()->first() ?? 'admin'])]);
    });

    Route::put('/profile/password', function (Illuminate\Http\Request $request) {
        $request->validate([
            'current_password'      => 'required',
            'password'              => 'required|min:8|confirmed',
            'password_confirmation' => 'required',
        ]);
        if (!\Illuminate\Support\Facades\Hash::check($request->current_password, $request->user()->password)) {
            return response()->json(['message' => 'Validation failed', 'errors' => ['current_password' => ['Current password is incorrect.']]], 422);
        }
        $request->user()->update(['password' => \Illuminate\Support\Facades\Hash::make($request->password)]);
        return response()->json(['message' => 'Password changed successfully']);
    });

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // ── Inventory ────────────────────────────────────────────────────────────
    Route::apiResource('machines',     MachineController::class);
    Route::apiResource('machine-parts',MachinePartController::class);
    Route::apiResource('categories',   CategoryController::class);
    Route::apiResource('suppliers',    SupplierController::class);

    // ── Cash Flow ────────────────────────────────────────────────────────────
    Route::apiResource('parties',   PartyController::class);
    Route::apiResource('cashflows', CashFlowController::class);

    // ── Retail ───────────────────────────────────────────────────────────────
    Route::apiResource('products',      ProductController::class);
    Route::apiResource('retail-sales',  RetailSaleController::class);

    // ── Invoices (stub — frontend uses demo data) ────────────────────────────
    Route::get('/invoices',         fn() => response()->json(['data' => [], 'meta' => ['total' => 0, 'current_page' => 1, 'last_page' => 1, 'per_page' => 15]]));
    Route::post('/invoices',        fn() => response()->json(['message' => 'Invoice created'], 201));
    Route::get('/invoices/{id}',    fn($id) => response()->json(['message' => 'Not found'], 404));
    Route::put('/invoices/{id}',    fn($id) => response()->json(['message' => 'Not found'], 404));
    Route::delete('/invoices/{id}', fn($id) => response()->json(['message' => 'Not found'], 404));

    // ── Purchases (stub — frontend uses demo data) ───────────────────────────
    Route::get('/purchases',         fn() => response()->json(['data' => [], 'meta' => ['total' => 0, 'current_page' => 1, 'last_page' => 1, 'per_page' => 15]]));
    Route::post('/purchases',        fn() => response()->json(['message' => 'Purchase recorded'], 201));
    Route::get('/purchases/{id}',    fn($id) => response()->json(['message' => 'Not found'], 404));
    Route::put('/purchases/{id}',    fn($id) => response()->json(['message' => 'Not found'], 404));
    Route::delete('/purchases/{id}', fn($id) => response()->json(['message' => 'Not found'], 404));

    // ── Users (settings page) ────────────────────────────────────────────────
    Route::get('/users', function () {
        $users = \App\Models\User::all()->map(fn($u) => array_merge($u->toArray(), ['role' => $u->getRoleNames()->first() ?? 'employee']));
        return response()->json(['data' => $users]);
    });

    // ── Employees ────────────────────────────────────────────────────────────
    Route::apiResource('employees', EmployeeController::class);
    Route::apiResource('salaries',  SalaryController::class);

    Route::get('/attendance', function (Illuminate\Http\Request $request) {
        $date = $request->date ?? now()->toDateString();
        $records = \App\Models\Attendance::with('employee')
            ->whereDate('date', $date)
            ->get()
            ->map(fn($a) => [
                'id'        => $a->id,
                'employee'  => $a->employee?->name,
                'date'      => $a->date?->toDateString(),
                'check_in'  => $a->check_in,
                'check_out' => $a->check_out,
                'status'    => $a->status,
                'hours'     => $a->hours,
            ]);
        return response()->json(['data' => $records]);
    });
    Route::post('/attendance', function (Illuminate\Http\Request $request) {
        $data = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date'        => 'required|date',
            'check_in'    => 'nullable|date_format:H:i',
            'check_out'   => 'nullable|date_format:H:i',
            'status'      => 'required|in:present,absent,half_day,leave',
            'notes'       => 'nullable|string',
        ]);
        $attendance = \App\Models\Attendance::updateOrCreate(
            ['employee_id' => $data['employee_id'], 'date' => $data['date']],
            $data
        );
        return response()->json(['data' => $attendance->load('employee'), 'message' => 'Attendance recorded'], 201);
    });

    // ── Expenses ─────────────────────────────────────────────────────────────
    Route::apiResource('expenses', ExpenseController::class);

    // ── Reports ──────────────────────────────────────────────────────────────
    Route::get('/reports/revenue',   fn() => response()->json(['data' => []]));
    Route::get('/reports/sales',     fn() => response()->json(['data' => []]));
    Route::get('/reports/inventory', fn() => response()->json(['data' => []]));
    Route::get('/reports/payroll',   fn() => response()->json(['data' => []]));

    // ── Settings ─────────────────────────────────────────────────────────────
    Route::get('/settings',    fn() => response()->json(['data' => []]));
    Route::put('/settings',    fn() => response()->json(['message' => 'Settings saved']));
    Route::get('/activity-logs', fn() => response()->json(['data' => []]));
});
