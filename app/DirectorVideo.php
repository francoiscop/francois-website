<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class DirectorVideo extends Model
{
	protected $table = 'director_video';
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'director_id', 'video_id',
    ];
}
