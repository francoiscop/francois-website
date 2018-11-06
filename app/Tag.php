<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
    ];

    protected $appends = ['link'];


    public function getLinkAttribute()
    {
        return '/films/page/1?tags=' . $this->name;
    }

    public function videos()
    {
        return $this->belongsToMany(Video::class, 'tag_video');
    }

    public function extracts()
    {
        return $this->belongsToMany(Extract::class, 'tag_extract');
    }

    public function shorts()
    {
        return $this->belongsToMany(Short::class, 'tag_short');
    }

    public function albums()
    {
        return $this->belongsToMany(Album::class, 'tag_album');
    }
}
