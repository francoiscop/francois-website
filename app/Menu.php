<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{

    protected $fillable = [
        'name', 'slug', 'link', 'bg_class', 'bg_color', 'bg_image'
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

    	if (!is_null($this->slug)) return $this->slug;

    	return null;
    }


}
