<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'category_id', 'amount', 'date',
        'description', 'payment_method', 'receipt_path', 'added_by',
    ];

    protected $casts = ['date' => 'date', 'amount' => 'decimal:2'];

    public function category() { return $this->belongsTo(Category::class); }
    public function addedBy()  { return $this->belongsTo(User::class, 'added_by'); }

    public function scopeForMonth($q, $year, $month) { return $q->whereYear('date', $year)->whereMonth('date', $month); }
    public function scopeSearch($q, $s) { return $q->where('title','like',"%$s%"); }
}
