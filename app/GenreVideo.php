<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class GenreVideo extends Model
{
	protected $table = 'genre_video';
    
    protected $fillable = [
        'genre_id', 'video_id',
    ];

    protected $hidden = [
    	'created_at', 'updated_at', 'deleted_at'
    ];


    public function genres()
    {
        return $this->hasOne(Genre::class, 'id', 'genre_id');
        //return $this->hasOne(Genre::class, 'id');
    }
}
