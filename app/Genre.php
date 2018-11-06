<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Genre extends Model
{
    
    protected $fillable = [
        'name',
    ];

    protected $hidden = [
        'created_at', 'updated_at', 'deleted_at'
    ];

    protected $appends = ['link'];



    public function getLinkAttribute()
    {
        return '/videos/' . strtolower($this->name);
    }


    public function videos()
    {
        return $this->belongsToMany(Video::class);
    }
}
