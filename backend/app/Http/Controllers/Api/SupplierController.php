<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SupplierController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Supplier::withCount(['machineParts as items_supplied'])
            ->when($request->search, fn($q) => $q->where('name','like','%'.$request->search.'%'))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderBy('name');

        $data = $query->paginate($request->per_page ?? 15);
        return response()->json([
            'data' => $data->items(),
            'meta' => ['current_page' => $data->currentPage(), 'last_page' => $data->lastPage(), 'total' => $data->total(), 'per_page' => $data->perPage()],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'contact' => 'nullable|string',
            'email'   => 'nullable|email',
            'phone'   => 'nullable|string',
            'address' => 'nullable|string',
            'status'  => 'required|in:active,inactive',
        ]);
        return response()->json(['message' => 'Supplier created', 'data' => Supplier::create($validated)], 201);
    }

    public function update(Request $request, Supplier $supplier): JsonResponse
    {
        $validated = $request->validate([
            'name'   => 'required|string|max:255',
            'status' => 'required|in:active,inactive',
        ]);
        $supplier->update($validated);
        return response()->json(['message' => 'Supplier updated', 'data' => $supplier]);
    }

    public function destroy(Supplier $supplier): JsonResponse
    {
        $supplier->delete();
        return response()->json(['message' => 'Supplier deleted']);
    }
}
