<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Cviebrock\EloquentSluggable\Sluggable;

class Production extends Model
{
    use Sluggable;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'slug', 'name', 'country', 'description',
    ];


    public function videos()
    {
        return $this->belongsToMany(Video::class);
    }


    public function sluggable()
    {
        return [
            'slug' => [
                'source' => ['name', 'id'],
                'separator' => '-'
            ]
        ];
    }

    /*
    |
    |
    |ACCESSORS
    |
    |
    */
    
 

    /*
    |
    |
    | MUTATORS
    |
    |
    */

    public function setNameAttribute($value)
    {
        $this->attributes['name'] = strtolower(str_replace(['_','-'], [' ', ' '],$value));
    }

}
