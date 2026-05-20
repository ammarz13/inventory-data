<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RetailSale;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class RetailSaleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $now = Carbon::now();

        $query = RetailSale::with(['items.product'])
            ->when($request->search, fn($q) => $q->where('customer', 'like', '%'.$request->search.'%')
                ->orWhere('sale_no', 'like', '%'.$request->search.'%'))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->from_date, fn($q) => $q->whereDate('date', '>=', $request->from_date))
            ->when($request->to_date, fn($q) => $q->whereDate('date', '<=', $request->to_date))
            ->orderBy('date', 'desc');

        $data = $query->paginate($request->per_page ?? 15);

        $monthSales  = RetailSale::whereYear('date', $now->year)->whereMonth('date', $now->month);
        $totalSales  = (clone $monthSales)->sum('total');
        $totalProfit = RetailSale::with('items.product')
            ->whereYear('date', $now->year)->whereMonth('date', $now->month)
            ->get()->sum(fn($s) => $s->profit);

        $items = collect($data->items())->map(fn($s) => [
            'id'         => $s->id,
            'sale_no'    => $s->sale_no,
            'customer'   => $s->customer,
            'date'       => $s->date?->toDateString(),
            'items'      => $s->items->count(),
            'total'      => $s->total,
            'profit'     => $s->profit,
            'status'     => $s->status,
        ]);

        return response()->json([
            'data'    => $items,
            'meta'    => ['current_page' => $data->currentPage(), 'last_page' => $data->lastPage(), 'total' => $data->total(), 'per_page' => $data->perPage()],
            'summary' => [
                'total_sales'        => $totalSales,
                'total_profit'       => $totalProfit,
                'total_transactions' => (clone $monthSales)->count(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer'       => 'nullable|string|max:255',
            'party_id'       => 'nullable|exists:parties,id',
            'date'           => 'required|date',
            'payment_method' => 'required|in:cash,bank,cheque,online',
            'status'         => 'required|in:paid,partial,unpaid',
            'notes'          => 'nullable|string',
            'items'          => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount'   => 'nullable|numeric|min:0',
        ]);

        $saleNo = 'SAL-' . str_pad(RetailSale::count() + 1, 3, '0', STR_PAD_LEFT);
        $subtotal = collect($validated['items'])->sum(fn($i) => ($i['unit_price'] * $i['quantity']) - ($i['discount'] ?? 0));

        $sale = RetailSale::create([
            'sale_no'        => $saleNo,
            'customer'       => $validated['customer'] ?? 'Walk-in Customer',
            'party_id'       => $validated['party_id'] ?? null,
            'date'           => $validated['date'],
            'subtotal'       => $subtotal,
            'total'          => $subtotal,
            'payment_method' => $validated['payment_method'],
            'status'         => $validated['status'],
            'notes'          => $validated['notes'] ?? null,
        ]);

        foreach ($validated['items'] as $item) {
            $lineTotal = ($item['unit_price'] * $item['quantity']) - ($item['discount'] ?? 0);
            $sale->items()->create([
                'product_id' => $item['product_id'],
                'quantity'   => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'discount'   => $item['discount'] ?? 0,
                'total'      => $lineTotal,
            ]);

            // Deduct stock
            Product::where('id', $item['product_id'])->decrement('stock', $item['quantity']);
        }

        $sale->load('items.product');

        return response()->json(['message' => 'Sale recorded', 'data' => $sale], 201);
    }

    public function show(RetailSale $retailSale): JsonResponse
    {
        $retailSale->load('items.product', 'party');
        return response()->json(['data' => $retailSale]);
    }

    public function update(Request $request, RetailSale $retailSale): JsonResponse
    {
        $validated = $request->validate([
            'customer'       => 'nullable|string|max:255',
            'status'         => 'required|in:paid,partial,unpaid',
            'payment_method' => 'required|in:cash,bank,cheque,online',
            'notes'          => 'nullable|string',
        ]);

        $retailSale->update($validated);
        return response()->json(['message' => 'Sale updated', 'data' => $retailSale]);
    }

    public function destroy(RetailSale $retailSale): JsonResponse
    {
        // Restore stock
        foreach ($retailSale->items as $item) {
            Product::where('id', $item->product_id)->increment('stock', $item->quantity);
        }
        $retailSale->delete();
        return response()->json(['message' => 'Sale deleted']);
    }
}
