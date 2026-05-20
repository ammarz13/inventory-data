<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('machine_parts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sku', 100)->unique();
            $table->string('barcode', 100)->nullable();
            $table->foreignId('machine_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('quantity')->default(0);
            $table->unsignedInteger('min_quantity')->default(0);
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->string('unit', 20)->nullable()->default('pcs');
            $table->text('description')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('machine_parts'); }
};
