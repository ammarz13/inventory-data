<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'sku', 'barcode', 'category_id', 'supplier_id',
        'purchase_price', 'sale_price', 'stock', 'min_stock', 'unit',
    ];

    protected $casts = ['purchase_price' => 'decimal:2', 'sale_price' => 'decimal:2'];

    public function category() { return $this->belongsTo(Category::class); }
    public function supplier() { return $this->belongsTo(Supplier::class); }

    public function getProfitAttribute()    { return $this->sale_price - $this->purchase_price; }
    public function getProfitPctAttribute() { return $this->purchase_price > 0 ? round(($this->profit / $this->purchase_price) * 100, 2) : 0; }
    public function getStockStatusAttribute(): string
    {
        if ($this->stock <= 0)           return 'out_of_stock';
        if ($this->stock <= $this->min_stock) return 'low_stock';
        return 'in_stock';
    }

    public function scopeSearch($q, $s) { return $q->where('name','like',"%$s%")->orWhere('sku','like',"%$s%")->orWhere('barcode','like',"%$s%"); }
}
