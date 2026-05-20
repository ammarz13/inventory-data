<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Salary;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class SalaryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $now   = Carbon::now();
        $month = $request->month ?? $now->month;
        $year  = $request->year  ?? $now->year;

        $query = Salary::with('employee')
            ->when($month && $year, fn($q) => $q->where('month', $month)->where('year', $year))
            ->orderBy('created_at', 'desc');

        $data = $query->paginate($request->per_page ?? 25);

        $items = collect($data->items())->map(fn($s) => array_merge($s->toArray(), ['employee' => $s->employee?->name]));
        $summary = [
            'total_payroll' => $query->sum('net'),
            'paid_count'    => Salary::where('month', $month)->where('year', $year)->where('status', 'paid')->count(),
            'pending_count' => Salary::where('month', $month)->where('year', $year)->where('status', 'pending')->count(),
        ];

        return response()->json([
            'data'    => $items,
            'meta'    => ['current_page' => $data->currentPage(), 'last_page' => $data->lastPage(), 'total' => $data->total(), 'per_page' => $data->perPage()],
            'summary' => $summary,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'month'       => 'required|integer|between:1,12',
            'year'        => 'required|integer|min:2020',
            'basic'       => 'required|numeric|min:0',
            'bonus'       => 'nullable|numeric|min:0',
            'advance'     => 'nullable|numeric|min:0',
            'deductions'  => 'nullable|numeric|min:0',
            'status'      => 'required|in:paid,pending',
            'paid_date'   => 'nullable|date',
        ]);

        $salary = Salary::create($validated);
        $salary->load('employee');

        return response()->json(['message' => 'Salary record created', 'data' => $salary], 201);
    }

    public function update(Request $request, Salary $salary): JsonResponse
    {
        $validated = $request->validate([
            'basic'      => 'required|numeric|min:0',
            'bonus'      => 'nullable|numeric|min:0',
            'advance'    => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'status'     => 'required|in:paid,pending',
            'paid_date'  => 'nullable|date',
        ]);

        $salary->update($validated);
        return response()->json(['message' => 'Salary updated', 'data' => $salary]);
    }

    public function destroy(Salary $salary): JsonResponse
    {
        $salary->delete();
        return response()->json(['message' => 'Record deleted']);
    }
}
