<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Party extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'type', 'phone', 'email', 'address',
        'opening_balance', 'balance_type',
    ];

    public function cashflows()  { return $this->hasMany(CashFlow::class); }
    public function invoices()   { return $this->hasMany(Invoice::class); }

    public function getBalanceAttribute()
    {
        $credit = $this->cashflows()->where('type', 'credit')->sum('amount');
        $debit  = $this->cashflows()->where('type', 'debit')->sum('amount');
        return ($this->balance_type === 'credit' ? $this->opening_balance : 0)
             + $credit - $debit
             - ($this->balance_type === 'debit' ? $this->opening_balance : 0);
    }

    public function scopeSearch($q, $s) { return $q->where('name','like',"%$s%")->orWhere('phone','like',"%$s%"); }
}
