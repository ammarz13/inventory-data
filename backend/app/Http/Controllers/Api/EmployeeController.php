<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EmployeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Employee::query()
            ->when($request->search, fn($q) => $q->search($request->search))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->department, fn($q) => $q->where('department', $request->department))
            ->orderBy($request->sort_by ?? 'name', $request->sort_dir ?? 'asc');

        $data = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'data' => $data->items(),
            'meta' => ['current_page' => $data->currentPage(), 'last_page' => $data->lastPage(), 'total' => $data->total(), 'per_page' => $data->perPage()],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'email'      => 'nullable|email|unique:employees,email',
            'phone'      => 'nullable|string',
            'cnic'       => 'nullable|string',
            'address'    => 'nullable|string',
            'position'   => 'required|string',
            'department' => 'nullable|string',
            'salary'     => 'required|numeric|min:0',
            'join_date'  => 'required|date',
            'status'     => 'required|in:active,inactive,on_leave',
        ]);

        $employee = Employee::create($validated);
        return response()->json(['message' => 'Employee added', 'data' => $employee], 201);
    }

    public function show(Employee $employee): JsonResponse
    {
        $employee->load(['salaries', 'attendances' => fn($q) => $q->latest()->take(30)]);
        return response()->json(['data' => $employee]);
    }

    public function update(Request $request, Employee $employee): JsonResponse
    {
        $validated = $request->validate([
            'name'       => 'required|string|max:255',
            'phone'      => 'nullable|string',
            'position'   => 'required|string',
            'department' => 'nullable|string',
            'salary'     => 'required|numeric|min:0',
            'join_date'  => 'required|date',
            'status'     => 'required|in:active,inactive,on_leave',
        ]);

        $employee->update($validated);
        return response()->json(['message' => 'Employee updated', 'data' => $employee]);
    }

    public function destroy(Employee $employee): JsonResponse
    {
        $employee->delete();
        return response()->json(['message' => 'Employee removed']);
    }
}
