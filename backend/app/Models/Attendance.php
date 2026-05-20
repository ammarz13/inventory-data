<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = ['employee_id', 'date', 'check_in', 'check_out', 'status', 'notes'];

    protected $casts = ['date' => 'date'];

    public function employee() { return $this->belongsTo(Employee::class); }

    public function getHoursAttribute(): float
    {
        if (!$this->check_in || !$this->check_out) return 0;
        $in  = strtotime($this->check_in);
        $out = strtotime($this->check_out);
        return round(($out - $in) / 3600, 2);
    }
}
