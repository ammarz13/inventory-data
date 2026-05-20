<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Machine;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MachineController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Machine::with(['category', 'supplier'])
            ->when($request->search, fn($q) => $q->search($request->search))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->orderBy($request->sort_by ?? 'created_at', $request->sort_dir ?? 'desc');

        $data = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'data' => $data->items(),
            'meta' => [
                'current_page' => $data->currentPage(),
                'last_page'    => $data->lastPage(),
                'total'        => $data->total(),
                'per_page'     => $data->perPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'model_no'    => 'required|string|max:100',
            'sku'         => 'required|string|unique:machines,sku',
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'location'    => 'nullable|string',
            'status'      => 'required|in:active,inactive,maintenance',
            'description' => 'nullable|string',
        ]);

        $machine = Machine::create($validated);
        $machine->load(['category', 'supplier']);

        return response()->json(['message' => 'Machine created', 'data' => $machine], 201);
    }

    public function show(Machine $machine): JsonResponse
    {
        $machine->load(['category', 'supplier', 'machineParts']);
        return response()->json(['data' => $machine]);
    }

    public function update(Request $request, Machine $machine): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'model_no'    => 'required|string|max:100',
            'sku'         => 'required|string|unique:machines,sku,' . $machine->id,
            'category_id' => 'required|exists:categories,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'location'    => 'nullable|string',
            'status'      => 'required|in:active,inactive,maintenance',
            'description' => 'nullable|string',
        ]);

        $machine->update($validated);
        $machine->load(['category', 'supplier']);

        return response()->json(['message' => 'Machine updated', 'data' => $machine]);
    }

    public function destroy(Machine $machine): JsonResponse
    {
        $machine->delete();
        return response()->json(['message' => 'Machine deleted']);
    }
}
