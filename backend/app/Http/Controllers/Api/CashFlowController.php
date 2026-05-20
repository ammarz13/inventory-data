<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashFlow;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class CashFlowController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $now = Carbon::now();

        $query = CashFlow::with('party')
            ->when($request->search, fn($q) => $q->whereHas('party', fn($p) => $p->where('name','like','%'.$request->search.'%')))
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->from_date, fn($q) => $q->whereDate('date', '>=', $request->from_date))
            ->when($request->to_date, fn($q) => $q->whereDate('date', '<=', $request->to_date))
            ->orderBy('date', 'desc');

        $data = $query->paginate($request->per_page ?? 15);

        $monthlyCredit = CashFlow::credit()->forMonth($now->year, $now->month)->sum('amount');
        $monthlyDebit  = CashFlow::debit()->forMonth($now->year, $now->month)->sum('amount');

        $items = collect($data->items())->map(fn($t) => array_merge($t->toArray(), ['party' => $t->party?->name]));

        return response()->json([
            'data'    => $items,
            'meta'    => ['current_page' => $data->currentPage(), 'last_page' => $data->lastPage(), 'total' => $data->total(), 'per_page' => $data->perPage()],
            'summary' => ['total_credit' => $monthlyCredit, 'total_debit' => $monthlyDebit, 'net_balance' => $monthlyCredit - $monthlyDebit],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'party_id'       => 'required|exists:parties,id',
            'type'           => 'required|in:credit,debit',
            'amount'         => 'required|numeric|min:0.01',
            'date'           => 'required|date',
            'description'    => 'nullable|string',
            'payment_method' => 'required|in:cash,bank,cheque,online',
            'status'         => 'required|in:paid,pending,partial,unpaid',
        ]);

        $transaction = CashFlow::create($validated);
        $transaction->load('party');

        return response()->json(['message' => 'Transaction created', 'data' => $transaction], 201);
    }

    public function show(CashFlow $cashflow): JsonResponse
    {
        $cashflow->load('party');
        return response()->json(['data' => $cashflow]);
    }

    public function update(Request $request, CashFlow $cashflow): JsonResponse
    {
        $validated = $request->validate([
            'party_id'       => 'required|exists:parties,id',
            'type'           => 'required|in:credit,debit',
            'amount'         => 'required|numeric|min:0.01',
            'date'           => 'required|date',
            'payment_method' => 'required|in:cash,bank,cheque,online',
            'status'         => 'required|in:paid,pending,partial,unpaid',
        ]);

        $cashflow->update($validated);
        return response()->json(['message' => 'Transaction updated', 'data' => $cashflow]);
    }

    public function destroy(CashFlow $cashflow): JsonResponse
    {
        $cashflow->delete();
        return response()->json(['message' => 'Transaction deleted']);
    }
}
