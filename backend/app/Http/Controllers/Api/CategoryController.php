<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = Category::withCount(['machines','machineParts','products','expenses'])
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->orderBy('name')->get()
            ->map(fn($c) => array_merge($c->toArray(), [
                'items_count' => $c->machines_count + $c->machine_parts_count + $c->products_count + $c->expenses_count,
            ]));

        return response()->json(['data' => $categories]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:100|unique:categories,name',
            'type'        => 'required|in:machine,part,product,expense',
            'description' => 'nullable|string',
        ]);
        return response()->json(['message' => 'Category created', 'data' => Category::create($validated)], 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:categories,name,' . $category->id,
            'type' => 'required|in:machine,part,product,expense',
        ]);
        $category->update($validated);
        return response()->json(['message' => 'Category updated', 'data' => $category]);
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();
        return response()->json(['message' => 'Category deleted']);
    }
}
