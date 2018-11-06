<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ProductionVideo extends Model
{
    protected $table = 'production_video';
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'production_id', 'video_id',
    ];
}
