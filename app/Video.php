<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Auth;
use Cviebrock\EloquentSluggable\Sluggable;
use App\classes\Medias;
use Illuminate\Database\Eloquent\Builder;


class Video extends Model
{
    use Sluggable;
	
    protected $fillable = [
        'uid', 'title', 'client', 'slug', 'store_id', 'country', 'produced_at', 'description', 'provider', 'url', 'format', 'aspect_ratio', 'camera', 'is_active', 'is_screencaps', 'is_selection'
    ];

    protected $appends = ['link', 'poster', 'thumbs', 'hero', 'file_name', 'director', 'production', 'dop', 'genre', 'autoplay'];

    protected $hidden = ['is_active', 'updated_at', 'deleted_at', 'created_at', 'file_name', 'produced_at'];

    protected $dates =[
        'deleted_at','created_at','updated_at',
    ];


    public function sluggable()
    {
        return [
            'slug' => [
                //'source' => 'title'
                'source' => ['title'],
                'separator' => '-'
            ]
        ];
    }


    protected static function boot()
    {
        parent::boot();

        static::addGlobalScope('active', function (Builder $builder) {
            
            $builder->where('is_active', true);
        
        });
    }



    public function scopeSelection($query)
    {
        return $query->where('is_selection', true);
    }

    /*
    |
    |
    |ACCESSORS
    |
    |
    */
    public function getFileNameAttribute($value)
    {
        return $this->id.'_'.$this->uid;
    }

    public function getLinkAttribute()
    {
        return '/film/'.$this->slug;
    }

    public function getPosterAttribute()
    {
        return $this->poster();
    }

    public function getThumbsAttribute()
    {
        return $this->thumbs();
    }

    public function getHeroAttribute()
    {
        return $this->hero();
    }

    public function getCreatedAtAttribute($value)
    {
        return \Carbon\Carbon::parse($value)->diffForHumans();
    }

    public function getDirectorAttribute($value)
    {
        return collect($this->directors()->get())->implode('name', ',');
    }

    public function getProductionAttribute($value)
    {
        return collect($this->productions()->get())->implode('name', ',');
    }

    public function getDopAttribute($value)
    {
        return collect($this->dops()->get())->implode('name', ',');
    }
    
    public function getGenreAttribute($value)
    {
        return collect($this->genres()->get())->implode('name', ',');
    }

    public function getProducedAtAttribute($value)
    {
        return $value; 

        $temp = explode('-', $value);

        $date = \Carbon\Carbon::createFromDate($temp[0], $temp[1], 1);

        return $date->format('Y F');
    }

    public function getAutoplayAttribute()
    {
        return true;
    }

    /*
    |
    |
    |HELPERS
    |
    |
    */
    public function poster()
    {
        $directories = Medias::video($this);

        $file = $directories['poster'] . '.jpg';

        if (Storage::disk('local')->exists($file)) return Storage::url($file);

        return null;

    }

    public function thumbs()
    {
        $thumbs = [];

        $settings = config('app.settings');

        $max = $settings['display']['thumbs'];

        $directories = Medias::video($this);

        for ($i = 1; $i <= $max; $i ++){

            $thumbs[$i - 1] = null;

            $file = $directories['thumb'] . '-' . $i . '.jpg';

            if (Storage::disk('local')->exists($file)) $thumbs[$i - 1] = Storage::url($file);

        }

        return $thumbs;
    }

    public function hero()
    {
        $directories = Medias::video($this);

        $file = $directories['hero'] . '.jpg';

        if (Storage::disk('local')->exists($file)) return Storage::url($file);

        return null;

    }


    public function screencaps()
    {
        if (!$this->is_screencaps) return [];

        $images = [];

        $aspect = null;

        $d = Medias::screencaps($this);

        foreach (Storage::files($d) as $k => $image) {

            if ($aspect === null){

                list($width, $height) = getimagesize(storage_path('app/') . $image);

                if (is_null($height) || $height === 0 || $width === 0) continue;

                $aspect = round($width / $height, 2);
            }

            array_push($images, Storage::url($image));
        }

        return ['images' => $images, 'aspect' => $aspect];
    }


    /*
    |
    |
    |RELATIONSHIPS
    |
    |
    */
    public function tags()
    {
        return $this->belongsToMany(Tag::class)->select(['tags.id', 'name']);
    }

    public function directors()
    {
        return $this->belongsToMany(Director::class)->select(['directors.id', 'first_name', 'last_name', 'slug']);
    }

    public function productions()
    {
        return $this->belongsToMany(Production::class)->select(['productions.id', 'name', 'slug']);
    }

    public function dops()
    {
        return $this->belongsToMany(Dop::class)->select(['dops.id', 'first_name', 'last_name', 'slug']);
    }

    public function genres()
    {
        return $this->belongsToMany(Genre::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function statistics()
    {
        return $this->hasMany(VideoStatistic::class);
    }
}
