<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class VideoStatistic extends Model
{
    protected $fillable = [
        'video_id', 'event', 'time', 'is_mobile', 'platform', 'browser', 'kind', 'city', 'country', 'ip'
    ];


    public function video()
    {
        return $this->belongsTo(Video::class, 'video_id', 'id');
    }

}
