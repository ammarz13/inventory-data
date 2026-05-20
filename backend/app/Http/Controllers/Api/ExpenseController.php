<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ExpenseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $now = Carbon::now();

        $query = Expense::with('category')
            ->when($request->search, fn($q) => $q->search($request->search))
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->when($request->from_date, fn($q) => $q->whereDate('date', '>=', $request->from_date))
            ->when($request->to_date, fn($q) => $q->whereDate('date', '<=', $request->to_date))
            ->orderBy('date', 'desc');

        $data = $query->paginate($request->per_page ?? 15);

        $monthlyTotal     = Expense::forMonth($now->year, $now->month)->sum('amount');
        $lastMonthTotal   = Expense::forMonth($now->year, $now->copy()->subMonth()->month)->sum('amount');
        $totalAll         = Expense::sum('amount');

        $byCategory = Expense::forMonth($now->year, $now->month)
            ->select('category_id', DB::raw('SUM(amount) as total'))
            ->with('category:id,name')
            ->groupBy('category_id')
            ->get()
            ->map(fn($e) => ['category' => $e->category?->name, 'total' => $e->total]);

        $items = collect($data->items())->map(fn($e) => array_merge($e->toArray(), ['category' => $e->category?->name]));

        return response()->json([
            'data' => $items,
            'meta' => ['current_page' => $data->currentPage(), 'last_page' => $data->lastPage(), 'total' => $data->total(), 'per_page' => $data->perPage()],
            'summary'     => ['total' => $totalAll, 'this_month' => $monthlyTotal, 'last_month' => $lastMonthTotal],
            'by_category' => $byCategory,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'category_id'    => 'required|exists:categories,id',
            'amount'         => 'required|numeric|min:0.01',
            'date'           => 'required|date',
            'description'    => 'nullable|string',
            'payment_method' => 'required|in:cash,bank,cheque',
        ]);

        $validated['added_by'] = auth()->id();
        $expense = Expense::create($validated);
        $expense->load('category');

        return response()->json(['message' => 'Expense saved', 'data' => $expense], 201);
    }

    public function update(Request $request, Expense $expense): JsonResponse
    {
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'category_id'    => 'required|exists:categories,id',
            'amount'         => 'required|numeric|min:0.01',
            'date'           => 'required|date',
            'payment_method' => 'required|in:cash,bank,cheque',
        ]);

        $expense->update($validated);
        return response()->json(['message' => 'Expense updated', 'data' => $expense]);
    }

    public function destroy(Expense $expense): JsonResponse
    {
        $expense->delete();
        return response()->json(['message' => 'Expense deleted']);
    }
}
