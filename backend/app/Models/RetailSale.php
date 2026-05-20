<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RetailSale extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_no', 'customer', 'party_id', 'date',
        'subtotal', 'discount', 'tax', 'total',
        'payment_method', 'status', 'notes',
    ];

    protected $casts = ['date' => 'date'];

    public function items()  { return $this->hasMany(RetailSaleItem::class); }
    public function party()  { return $this->belongsTo(Party::class); }

    public function getProfitAttribute()
    {
        return $this->items->sum(fn($item) => ($item->unit_price - $item->product->purchase_price) * $item->quantity);
    }
}
