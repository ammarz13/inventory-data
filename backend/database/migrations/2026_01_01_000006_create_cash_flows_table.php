<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cash_flows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('party_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['credit', 'debit']);
            $table->decimal('amount', 12, 2);
            $table->date('date');
            $table->text('description')->nullable();
            $table->enum('payment_method', ['cash', 'bank', 'cheque', 'online'])->default('cash');
            $table->enum('status', ['paid', 'pending', 'partial', 'unpaid'])->default('paid');
            $table->string('reference_no', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('cash_flows'); }
};
