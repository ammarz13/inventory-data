<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'contact', 'email', 'phone', 'address', 'status'];

    public function machineParts() { return $this->hasMany(MachinePart::class); }
    public function products()     { return $this->hasMany(Product::class); }
}
