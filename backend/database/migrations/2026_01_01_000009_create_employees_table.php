<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->nullable()->unique();
            $table->string('phone', 20)->nullable();
            $table->string('cnic', 20)->nullable();
            $table->text('address')->nullable();
            $table->string('position');
            $table->string('department')->nullable();
            $table->decimal('salary', 12, 2)->default(0);
            $table->date('join_date');
            $table->enum('status', ['active', 'inactive', 'on_leave'])->default('active');
            $table->string('avatar')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void { Schema::dropIfExists('employees'); }
};
