<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('salaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('month');
            $table->unsignedSmallInteger('year');
            $table->decimal('basic', 12, 2);
            $table->decimal('bonus', 12, 2)->default(0);
            $table->decimal('advance', 12, 2)->default(0);
            $table->decimal('deductions', 12, 2)->default(0);
            $table->decimal('net', 12, 2);
            $table->enum('status', ['paid', 'pending'])->default('pending');
            $table->date('paid_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['employee_id', 'month', 'year']);
        });
    }

    public function down(): void { Schema::dropIfExists('salaries'); }
};
