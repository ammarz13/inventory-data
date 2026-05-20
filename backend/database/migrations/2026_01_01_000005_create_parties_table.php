<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('parties', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['client', 'vendor', 'both'])->default('client');
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->decimal('opening_balance', 12, 2)->default(0);
            $table->enum('balance_type', ['credit', 'debit'])->default('credit');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('parties'); }
};
