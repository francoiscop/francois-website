<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Support\Facades\Storage;

class Panel extends Model
{
    protected $fillable = [
        'title', 'link', 'text', 'bg_color', 'bg_image'
    ];

    //protected $appends = [];

    /*
    |
    |
    | ACCESSORS
    |
    |
    */

    public function getBgImageAttribute($value)
    {
    	if (is_null($value) || !Storage::disk('public')->exists('panels/' . $value)) return null;

    	return Storage::url('panels/' . $value);
    }

    public function getLinkAttribute($value)
    {
    	if (is_null($value)) return null;

    	return json_decode($value);
    }
}
