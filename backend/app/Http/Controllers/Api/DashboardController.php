<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Machine, MachinePart, CashFlow, Employee, Expense, RetailSale, Salary};
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $now   = Carbon::now();
        $month = $now->month;
        $year  = $now->year;

        $totalCredit  = CashFlow::where('type','credit')->whereYear('date',$year)->whereMonth('date',$month)->sum('amount');
        $totalDebit   = CashFlow::where('type','debit')->whereYear('date',$year)->whereMonth('date',$month)->sum('amount');
        $totalExpenses = Expense::whereYear('date',$year)->whereMonth('date',$month)->sum('amount');

        $revenueChart = collect(range(1, 6))->map(function($monthOffset) use ($now) {
            $date = $now->copy()->subMonths(5 - $monthOffset);
            $rev  = CashFlow::where('type','credit')->whereYear('date',$date->year)->whereMonth('date',$date->month)->sum('amount');
            $exp  = Expense::whereYear('date',$date->year)->whereMonth('date',$date->month)->sum('amount');
            return ['month' => $date->format('M'), 'revenue' => $rev, 'expenses' => $exp];
        });

        $lowStock    = MachinePart::lowStock()->count();
        $pendingPay  = CashFlow::where('status','pending')->count();

        $inventoryPie = [
            ['name' => 'In Stock',      'value' => MachinePart::whereRaw('quantity > min_quantity')->count(), 'color' => '#10b981'],
            ['name' => 'Low Stock',     'value' => MachinePart::lowStock()->count(),                          'color' => '#f59e0b'],
            ['name' => 'Out of Stock',  'value' => MachinePart::where('quantity','<=',0)->count(),             'color' => '#ef4444'],
        ];

        $recentTransactions = CashFlow::with('party')->latest('date')->take(5)->get()->map(fn($t) => [
            'id'     => $t->id,
            'party'  => $t->party?->name ?? 'Unknown',
            'type'   => $t->type,
            'amount' => $t->amount,
            'date'   => $t->date,
            'status' => $t->status,
        ]);

        $lowStockItems = MachinePart::lowStock()->take(5)->get(['id','name','sku','quantity','min_quantity']);

        return response()->json([
            'data' => [
                'stats' => [
                    'total_machines'   => Machine::count(),
                    'machines_trend'   => 5,
                    'total_parts'      => MachinePart::count(),
                    'parts_trend'      => 12,
                    'monthly_revenue'  => $totalCredit,
                    'revenue_trend'    => 8.4,
                    'monthly_expenses' => $totalExpenses,
                    'expenses_trend'   => -3.2,
                    'cash_in'          => $totalCredit,
                    'cash_out'         => $totalDebit,
                    'total_employees'  => Employee::active()->count(),
                    'employees_trend'  => 0,
                    'low_stock_count'  => $lowStock,
                    'pending_payments' => $pendingPay,
                ],
                'revenueChart'         => $revenueChart,
                'inventoryPie'         => $inventoryPie,
                'recentTransactions'   => $recentTransactions,
                'lowStockItems'        => $lowStockItems,
            ],
        ]);
    }
}
