<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'type', 'description'];

    public function machines()    { return $this->hasMany(Machine::class); }
    public function machineParts(){ return $this->hasMany(MachinePart::class); }
    public function products()    { return $this->hasMany(Product::class); }
    public function expenses()    { return $this->hasMany(Expense::class); }
}
