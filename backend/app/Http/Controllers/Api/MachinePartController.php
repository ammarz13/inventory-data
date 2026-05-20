<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MachinePart;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MachinePartController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MachinePart::with(['machine', 'category', 'supplier'])
            ->when($request->search, fn($q) => $q->search($request->search))
            ->when($request->machine_id, fn($q) => $q->where('machine_id', $request->machine_id))
            ->when($request->stock_status === 'low_stock', fn($q) => $q->lowStock())
            ->when($request->stock_status === 'out_of_stock', fn($q) => $q->where('quantity', '<=', 0))
            ->orderBy($request->sort_by ?? 'created_at', $request->sort_dir ?? 'desc');

        $data = $query->paginate($request->per_page ?? 15);

        $items = collect($data->items())->map(fn($p) => array_merge($p->toArray(), ['stock_status' => $p->stock_status]));

        return response()->json([
            'data' => $items,
            'meta' => ['current_page' => $data->currentPage(), 'last_page' => $data->lastPage(), 'total' => $data->total(), 'per_page' => $data->perPage()],
            'low_stock_count' => MachinePart::lowStock()->count(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'sku'          => 'required|string|unique:machine_parts,sku',
            'machine_id'   => 'required|exists:machines,id',
            'category_id'  => 'required|exists:categories,id',
            'supplier_id'  => 'nullable|exists:suppliers,id',
            'quantity'     => 'required|integer|min:0',
            'min_quantity' => 'required|integer|min:0',
            'unit_price'   => 'required|numeric|min:0',
            'unit'         => 'nullable|string',
        ]);

        $part = MachinePart::create($validated);
        $part->load(['machine', 'category']);

        return response()->json(['message' => 'Part created', 'data' => $part], 201);
    }

    public function show(MachinePart $machinePart): JsonResponse
    {
        $machinePart->load(['machine', 'category', 'supplier']);
        return response()->json(['data' => $machinePart]);
    }

    public function update(Request $request, MachinePart $machinePart): JsonResponse
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'sku'          => 'required|string|unique:machine_parts,sku,' . $machinePart->id,
            'machine_id'   => 'required|exists:machines,id',
            'category_id'  => 'required|exists:categories,id',
            'quantity'     => 'required|integer|min:0',
            'min_quantity' => 'required|integer|min:0',
            'unit_price'   => 'required|numeric|min:0',
        ]);

        $machinePart->update($validated);
        return response()->json(['message' => 'Part updated', 'data' => $machinePart]);
    }

    public function destroy(MachinePart $machinePart): JsonResponse
    {
        $machinePart->delete();
        return response()->json(['message' => 'Part deleted']);
    }
}
