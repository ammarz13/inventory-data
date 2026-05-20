<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'supplier'])
            ->when($request->search, fn($q) => $q->search($request->search))
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->orderBy($request->sort_by ?? 'name', $request->sort_dir ?? 'asc');

        $data = $query->paginate($request->per_page ?? 15);
        $items = collect($data->items())->map(fn($p) => array_merge($p->toArray(), ['category' => $p->category?->name, 'stock_status' => $p->stock_status]));

        return response()->json([
            'data' => $items,
            'meta' => ['current_page' => $data->currentPage(), 'last_page' => $data->lastPage(), 'total' => $data->total(), 'per_page' => $data->perPage()],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'sku'            => 'required|string|unique:products,sku',
            'barcode'        => 'nullable|string',
            'category_id'    => 'required|exists:categories,id',
            'supplier_id'    => 'nullable|exists:suppliers,id',
            'purchase_price' => 'required|numeric|min:0',
            'sale_price'     => 'required|numeric|min:0',
            'stock'          => 'required|integer|min:0',
            'min_stock'      => 'required|integer|min:0',
            'unit'           => 'nullable|string',
        ]);

        $product = Product::create($validated);
        $product->load('category');

        return response()->json(['message' => 'Product created', 'data' => $product], 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'sku'            => 'required|string|unique:products,sku,' . $product->id,
            'purchase_price' => 'required|numeric|min:0',
            'sale_price'     => 'required|numeric|min:0',
            'stock'          => 'required|integer|min:0',
            'min_stock'      => 'required|integer|min:0',
        ]);

        $product->update($validated);
        return response()->json(['message' => 'Product updated', 'data' => $product]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }
}
