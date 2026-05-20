<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->date('date');
            $table->text('description')->nullable();
            $table->enum('payment_method', ['cash', 'bank', 'cheque'])->default('cash');
            $table->string('receipt_path')->nullable();
            $table->foreignId('added_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('expenses'); }
};
