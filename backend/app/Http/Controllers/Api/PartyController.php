<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Party;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PartyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Party::withCount('cashflows')
            ->when($request->search, fn($q) => $q->search($request->search))
            ->when($request->type, fn($q) => $q->where('type', $request->type))
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
            'name'            => 'required|string|max:255',
            'type'            => 'required|in:client,vendor,both',
            'phone'           => 'nullable|string',
            'email'           => 'nullable|email',
            'address'         => 'nullable|string',
            'opening_balance' => 'nullable|numeric|min:0',
            'balance_type'    => 'nullable|in:credit,debit',
        ]);

        $party = Party::create($validated);
        return response()->json(['message' => 'Party created', 'data' => $party], 201);
    }

    public function update(Request $request, Party $party): JsonResponse
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'type'  => 'required|in:client,vendor,both',
            'phone' => 'nullable|string',
            'email' => 'nullable|email',
        ]);

        $party->update($validated);
        return response()->json(['message' => 'Party updated', 'data' => $party]);
    }

    public function destroy(Party $party): JsonResponse
    {
        if ($party->cashflows()->exists()) {
            return response()->json(['message' => 'Cannot delete party with transactions'], 422);
        }
        $party->delete();
        return response()->json(['message' => 'Party deleted']);
    }
}
