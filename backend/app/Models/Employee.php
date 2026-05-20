<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'email', 'phone', 'cnic', 'address',
        'position', 'department', 'salary', 'join_date', 'status',
    ];

    protected $casts = ['join_date' => 'date', 'salary' => 'decimal:2'];

    public function salaries()    { return $this->hasMany(Salary::class); }
    public function attendances() { return $this->hasMany(Attendance::class); }

    public function scopeActive($q) { return $q->where('status', 'active'); }
    public function scopeSearch($q, $s) { return $q->where('name','like',"%$s%")->orWhere('phone','like',"%$s%"); }
}
