<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('retail_sales', function (Blueprint $table) {
            $table->id();
            $table->string('sale_no', 50)->unique();
            $table->string('customer')->default('Walk-in Customer');
            $table->foreignId('party_id')->nullable()->constrained()->nullOnDelete();
            $table->date('date');
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            $table->enum('payment_method', ['cash', 'bank', 'cheque', 'online'])->default('cash');
            $table->enum('status', ['paid', 'partial', 'unpaid'])->default('paid');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('retail_sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('retail_sale_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retail_sale_items');
        Schema::dropIfExists('retail_sales');
    }
};
