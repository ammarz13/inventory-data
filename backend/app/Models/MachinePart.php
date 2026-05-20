<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MachinePart extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'sku', 'machine_id', 'category_id', 'supplier_id',
        'quantity', 'min_quantity', 'unit_price', 'unit', 'barcode', 'description',
    ];

    public function machine()  { return $this->belongsTo(Machine::class); }
    public function category() { return $this->belongsTo(Category::class); }
    public function supplier() { return $this->belongsTo(Supplier::class); }

    public function getStockStatusAttribute(): string
    {
        if ($this->quantity <= 0) return 'out_of_stock';
        if ($this->quantity <= $this->min_quantity) return 'low_stock';
        return 'in_stock';
    }

    public function scopeLowStock($q)  { return $q->whereRaw('quantity <= min_quantity'); }
    public function scopeSearch($q, $s){ return $q->where('name','like',"%$s%")->orWhere('sku','like',"%$s%"); }
}
