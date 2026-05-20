<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RetailSaleItem extends Model
{
    protected $fillable = ['retail_sale_id', 'product_id', 'quantity', 'unit_price', 'discount', 'total'];

    public function sale()    { return $this->belongsTo(RetailSale::class); }
    public function product() { return $this->belongsTo(Product::class); }
}
