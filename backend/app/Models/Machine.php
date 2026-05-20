<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Machine extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'model_no', 'sku', 'category_id', 'supplier_id',
        'location', 'status', 'description', 'purchase_date', 'purchase_price',
    ];

    protected $casts = ['purchase_date' => 'date'];

    public function category()    { return $this->belongsTo(Category::class); }
    public function supplier()    { return $this->belongsTo(Supplier::class); }
    public function machineParts(){ return $this->hasMany(MachinePart::class); }

    public function scopeActive($query)      { return $query->where('status', 'active'); }
    public function scopeSearch($query, $s)  { return $query->where('name', 'like', "%$s%")->orWhere('sku', 'like', "%$s%")->orWhere('model_no', 'like', "%$s%"); }
}
