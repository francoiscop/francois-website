<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

use Cviebrock\EloquentSluggable\Sluggable;

class Director extends Model
{
    use Sluggable;
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'slug', 'first_name', 'last_name', 'country', 'year_start', 'year_end', 'description',
    ];

    protected $appends = ['link', 'name'];


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
    
    public function getNameAttribute()
    {
        return ucfirst($this->first_name) . ' ' . ucfirst($this->last_name);
    }


    public function getLinkAttribute()
    {
        return '/director/'.$this->slug;
    }

    /*
    |
    |
    | MUTATORS
    |
    |
    */

    public function setFirstNameAttribute($value)
    {
        $this->attributes['first_name'] = strtolower(str_replace('_', ' ',$value));
    }

    public function setLasttNameAttribute($value)
    {
        $this->attributes['last_name'] = strtolower(str_replace('_', ' ',$value));
    }
}
