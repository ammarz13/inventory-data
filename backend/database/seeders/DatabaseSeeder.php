<?php

namespace Database\Seeders;

use App\Models\{User, Category, Supplier, Machine, MachinePart, Party, CashFlow, Product, Employee, Salary, Expense};
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Roles ────────────────────────────────────────────────────────────
        $roles = ['admin', 'manager', 'employee'];
        foreach ($roles as $r) Role::firstOrCreate(['name' => $r, 'guard_name' => 'web']);

        // ── Users ────────────────────────────────────────────────────────────
        $admin = User::firstOrCreate(['email' => 'admin@invenpro.com'], [
            'name' => 'Admin User', 'password' => Hash::make('password'), 'status' => 'active',
        ]);
        $admin->assignRole('admin');

        $manager = User::firstOrCreate(['email' => 'manager@invenpro.com'], [
            'name' => 'Manager User', 'password' => Hash::make('password'), 'status' => 'active',
        ]);
        $manager->assignRole('manager');

        $emp = User::firstOrCreate(['email' => 'employee@invenpro.com'], [
            'name' => 'Employee User', 'password' => Hash::make('password'), 'status' => 'active',
        ]);
        $emp->assignRole('employee');

        // ── Categories ───────────────────────────────────────────────────────
        $machCats = ['CNC Machines', 'Hydraulic Equipment', 'Welding Equipment', 'Compressors', 'Drilling Machines'];
        $partCats = ['Bearings', 'Seals & Gaskets', 'Belts & Chains', 'Consumables', 'Tools'];
        $prodCats = ['Lubricants', 'Safety Equipment', 'Electrical', 'Fittings', 'Hand Tools'];
        $expCats  = ['Utilities', 'Rent', 'Transport', 'Office Supplies', 'Maintenance', 'Salary', 'Other'];

        foreach ($machCats as $n) Category::firstOrCreate(['name' => $n], ['type' => 'machine']);
        foreach ($partCats as $n) Category::firstOrCreate(['name' => $n], ['type' => 'part']);
        foreach ($prodCats as $n) Category::firstOrCreate(['name' => $n], ['type' => 'product']);
        foreach ($expCats  as $n) Category::firstOrCreate(['name' => $n], ['type' => 'expense']);

        // ── Suppliers ────────────────────────────────────────────────────────
        $supplierData = [
            ['name' => 'Al-Falah Bearings Co.', 'phone' => '0300-1234567', 'email' => 'info@alfalah.pk', 'address' => 'Lahore, Punjab'],
            ['name' => 'Metro Industrial Supply', 'phone' => '0321-9876543', 'email' => 'sales@metro.pk', 'address' => 'Karachi, Sindh'],
            ['name' => 'TechParts Pakistan', 'phone' => '0333-5554444', 'email' => 'tech@techparts.pk', 'address' => 'Islamabad'],
        ];
        foreach ($supplierData as $s) Supplier::firstOrCreate(['name' => $s['name']], array_merge($s, ['status' => 'active']));

        $cat1  = Category::where('type', 'machine')->first();
        $cat2  = Category::where('type', 'part')->first();
        $cat3  = Category::where('type', 'product')->first();
        $cat4  = Category::where('type', 'expense')->where('name', 'Utilities')->first();
        $sup1  = Supplier::first();

        // ── Machines ─────────────────────────────────────────────────────────
        $machines = [
            ['name' => 'CNC Lathe Machine', 'model_no' => 'CNC-LT-2000', 'sku' => 'MCH-001', 'status' => 'active'],
            ['name' => 'Hydraulic Press 50T', 'model_no' => 'HP-50T', 'sku' => 'MCH-002', 'status' => 'maintenance'],
            ['name' => 'MIG Welder Pro', 'model_no' => 'MW-500P', 'sku' => 'MCH-003', 'status' => 'active'],
        ];
        foreach ($machines as $m) Machine::firstOrCreate(['sku' => $m['sku']], array_merge($m, ['category_id' => $cat1->id, 'supplier_id' => $sup1->id, 'location' => 'Floor A']));

        $machine1 = Machine::first();

        // ── Machine Parts ────────────────────────────────────────────────────
        $parts = [
            ['name' => 'Motor Bearing 6205', 'sku' => 'MB-6205', 'quantity' => 3, 'min_quantity' => 10, 'unit_price' => 850],
            ['name' => 'Hydraulic Seal Kit', 'sku' => 'HSK-001', 'quantity' => 1, 'min_quantity' => 5, 'unit_price' => 2400],
            ['name' => 'V-Belt A50', 'sku' => 'VB-A50', 'quantity' => 8, 'min_quantity' => 20, 'unit_price' => 320],
            ['name' => 'Welding Wire 1.2mm', 'sku' => 'WW-12', 'quantity' => 45, 'min_quantity' => 20, 'unit_price' => 180],
        ];
        foreach ($parts as $p) MachinePart::firstOrCreate(['sku' => $p['sku']], array_merge($p, ['machine_id' => $machine1->id, 'category_id' => $cat2->id, 'supplier_id' => $sup1->id]));

        // ── Parties ──────────────────────────────────────────────────────────
        $parties = [
            ['name' => 'Al-Falah Traders', 'type' => 'client', 'phone' => '0300-1234567', 'opening_balance' => 50000, 'balance_type' => 'credit'],
            ['name' => 'Metro Supplies', 'type' => 'vendor', 'phone' => '0321-9876543', 'opening_balance' => 0, 'balance_type' => 'credit'],
            ['name' => 'TechParts Ltd', 'type' => 'both', 'phone' => '0333-5554444', 'opening_balance' => 25000, 'balance_type' => 'credit'],
        ];
        foreach ($parties as $p) Party::firstOrCreate(['name' => $p['name']], $p);
        $party1 = Party::first();

        // ── Cash Flows ───────────────────────────────────────────────────────
        for ($i = 0; $i < 5; $i++) {
            CashFlow::create([
                'party_id' => $party1->id,
                'type'     => $i % 2 === 0 ? 'credit' : 'debit',
                'amount'   => rand(5000, 80000),
                'date'     => Carbon::now()->subDays($i)->toDateString(),
                'payment_method' => 'cash',
                'status'   => 'paid',
                'description' => 'Demo transaction',
            ]);
        }

        // ── Products ─────────────────────────────────────────────────────────
        $products = [
            ['name' => 'Motor Oil 15W-40 (4L)', 'sku' => 'PRD-001', 'purchase_price' => 850, 'sale_price' => 1100, 'stock' => 45, 'min_stock' => 10, 'unit' => 'can'],
            ['name' => 'Safety Gloves L', 'sku' => 'PRD-003', 'purchase_price' => 120, 'sale_price' => 200, 'stock' => 200, 'min_stock' => 50, 'unit' => 'pair'],
        ];
        foreach ($products as $p) Product::firstOrCreate(['sku' => $p['sku']], array_merge($p, ['category_id' => $cat3->id, 'supplier_id' => $sup1->id]));

        // ── Employees ────────────────────────────────────────────────────────
        $employees = [
            ['name' => 'Muhammad Bilal', 'position' => 'Senior Technician', 'department' => 'Maintenance', 'salary' => 55000, 'join_date' => '2022-03-15', 'status' => 'active'],
            ['name' => 'Fatima Zahra', 'position' => 'Accountant', 'department' => 'Finance', 'salary' => 45000, 'join_date' => '2023-01-10', 'status' => 'active'],
            ['name' => 'Ahmed Raza', 'position' => 'Warehouse Manager', 'department' => 'Operations', 'salary' => 60000, 'join_date' => '2021-07-01', 'status' => 'active'],
        ];
        foreach ($employees as $e) Employee::firstOrCreate(['name' => $e['name']], $e);
        $employee1 = Employee::first();

        // ── Salaries ─────────────────────────────────────────────────────────
        $now = Carbon::now();
        Salary::firstOrCreate(['employee_id' => $employee1->id, 'month' => $now->month, 'year' => $now->year], [
            'basic' => 55000, 'bonus' => 5000, 'advance' => 0, 'deductions' => 0,
            'net' => 60000, 'status' => 'paid', 'paid_date' => $now->toDateString(),
        ]);

        // ── Expenses ─────────────────────────────────────────────────────────
        $expenseData = [
            ['title' => 'Electricity Bill', 'amount' => 18500, 'payment_method' => 'bank'],
            ['title' => 'Internet & Phone', 'amount' => 4200, 'payment_method' => 'bank'],
            ['title' => 'Office Stationery', 'amount' => 2800, 'payment_method' => 'cash'],
        ];
        foreach ($expenseData as $e) {
            Expense::create(array_merge($e, [
                'category_id' => $cat4->id,
                'date'        => Carbon::now()->toDateString(),
                'added_by'    => $admin->id,
            ]));
        }

        $this->command->info('✅ Database seeded with demo data.');
    }
}
