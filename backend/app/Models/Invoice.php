<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'party_id', 'invoice_no', 'date', 'due_date',
        'amount', 'paid', 'status', 'notes',
    ];

    protected $casts = [
        'date'     => 'date',
        'due_date' => 'date',
        'amount'   => 'decimal:2',
        'paid'     => 'decimal:2',
    ];

    public function party() { return $this->belongsTo(Party::class); }
}
