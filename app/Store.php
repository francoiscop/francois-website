<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Store extends Model
{

    protected $fillable = [
        'name', 'slug', 'link'
    ];

    protected $hidden = [
        'id', 'created_at', 'updated_at', 'deleted_at'
    ];

    /*
    |
    |
    | ACCESSORS
    |
    |
    */
    public function getLinkAttribute($value)
    {
        if (!is_null($value)) return $value;

        if (!is_null($this->slug)) return '/videos/' . $this->slug;

        return null;
    }


    /*
    |
    |
    | RELATIONSHIP
    |
    |
    */
    public function videos()
    {
        return $this->hasMany(Video::class);
    }
}
