<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashFlow extends Model
{
    use HasFactory;

    protected $fillable = [
        'party_id', 'type', 'amount', 'date',
        'description', 'payment_method', 'status', 'reference_no',
    ];

    protected $casts = ['date' => 'date', 'amount' => 'decimal:2'];

    public function party() { return $this->belongsTo(Party::class); }

    public function scopeCredit($q) { return $q->where('type', 'credit'); }
    public function scopeDebit($q)  { return $q->where('type', 'debit'); }
    public function scopeForMonth($q, $year, $month) { return $q->whereYear('date', $year)->whereMonth('date', $month); }
}
