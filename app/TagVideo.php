<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class TagVideo extends Model
{
	protected $table = 'tag_video';
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'tag_id', 'video_id',
    ];
}
