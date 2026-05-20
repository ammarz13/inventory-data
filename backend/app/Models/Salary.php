<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Salary extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id', 'month', 'year', 'basic',
        'bonus', 'advance', 'deductions', 'net',
        'status', 'paid_date', 'notes',
    ];

    protected $casts = ['paid_date' => 'date', 'basic' => 'decimal:2', 'net' => 'decimal:2'];

    public function employee() { return $this->belongsTo(Employee::class); }

    protected static function booted()
    {
        static::saving(function ($salary) {
            $salary->net = $salary->basic + $salary->bonus - $salary->deductions - $salary->advance;
        });
    }
}
