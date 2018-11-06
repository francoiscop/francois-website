<?php
namespace App\Classes;

use Carbon\Carbon;
use App\Settings;
use App\Watch;
use Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
 
class Medias
{

    
    protected static $disk = 'local';

    protected static $directories_map = [

        'video' => [
            'poster' => 'public/videos/posters/{slug}',
            'thumb' => 'public/videos/thumbs/{slug}',
            'hero' => 'public/videos/heros/{slug}',
        ],

        'admin' => 'public/admin',

        'thumbs' => 'public/videos/thumbs',

        'screencaps' => 'public/videos/screencaps/{id}'

    ];


    public static function video($video = null, $get = true)
    {

        return array_map(function($value) use ($video, $get){

            $d = str_replace(['{id}', '{slug}'], [$video->id, $video->slug], $value);

            if (!$get && !Storage::disk(self::$disk)->exists($d)) Storage::disk(self::$disk)->makeDirectory($d, 0775, true);

            return $d;

        }, self::$directories_map['video']);
    }


    public static function screencaps($video)
    {
        return str_replace(['{id}'], [$video->id], self::$directories_map['screencaps']);
    }


    public static function admin($video = null)
    {
        $d = self::$directories_map['admin'];

        $images = [];

        foreach (Storage::files($d) as $image) {

            $temp = explode('/', $image);

            $name = strtolower(end($temp));

            foreach (explode('-', $video->slug) as $part) {
                
                if (strlen($part) > 2 && strpos($name, $part) !== false) array_push($images, Storage::url($image));
            }

        }

        return $images;
    }


    public static function thumbs()
    {
        $d = self::$directories_map['thumbs'];

        $thumbs = [];

        foreach (Storage::files($d) as $thumb) {

            if (strpos($thumb, '.jpg') !== false) array_push($thumbs, storage_path('app/') . $thumb);

        }

        return $thumbs;
    }


    /*
    protected static $directories_map = [

        'videos' => [
            'original' => 'medias/videos/{id}/original',
            'hls' => 'medias/videos/{id}/hls',
            'dash' => 'medias/videos/{id}/dash',
            'mp4' => 'medias/videos/{id}/mp4',
            'log' => 'medias/videos/{id}/log',
            'preview' => 'medias/videos/{id}/preview',
        ],

        'video_public' => [
            'cover' => 'public/videos/covers',
            'poster' => 'public/videos/posters',
            'hero' => 'public/videos/heros',
            'preview' => 'public/videos/previews',
            //'extract' => 'public/videos/extracts',
            'thumb' => 'public/videos/thumbs/{id}',
            //'short' => 'public/shorts/{id}',
        ],

        'extracts' => [
            'original' => 'medias/extracts/{id}/original',
            'hls' => 'medias/extracts/{id}/hls',
            'mp4' => 'medias/extracts/{id}/mp4',
            'log' => 'medias/extracts/{id}/log',
        ],

        'extract_public' => [
            'poster' => 'public/extracts/posters',
        ],

        'shorts' => [
            'original' => 'medias/shorts/{id}/original',
            'hls' => 'medias/shorts/{id}/hls',
            'mp4' => 'medias/shorts/{id}/mp4',
            'log' => 'medias/shorts/{id}/log',
        ],

        'short_public' => [
            'hero' => 'public/shorts/heros',
            'thumb' => 'public/shorts/thumbs/{id}',
        ],

        //'thumbs' => 'public/videos/thumbs/{id}',

        'casts' => 'casts',

        'album' => [
            'low' => 'public/albums/{user_id}/{type}/low',
            'full' => 'public/albums/{user_id}/{type}/full'
        ],

        'product' => 'public/products/{user_id}/{product_id}',

        'user_public' => [
            'avatar' => 'public/users/avatars',
            'hero' => 'public/users/heros'
        ],

        'user' => [
            'avatar' => 'public/users/avatars/',
            'cover' => 'public/users/covers/'
        ],

        'post' => 'public/users/posts/{user_id}',

        'imdb' => [
            'posters' => 'public/imdb/posters',
            'images' => 'public/imdb/images/{id}',
            'logs' => 'public/imdb/logs',
            'caches' => 'imdb_caches'
        ],

        'zip' => 'uploads/zip/{user_id}/{id}'      
    ];


    protected static $switch = [

        'user' => '{switch}-{username}-{uid}',
        
        'video' => '{switch}_{file_name}',
        
        'short' => '{switch}_{file_name}',

        'extract' => '{switch}_{file_name}'
    ];


    private static function getType($object)
    {
        return ($object->web) ? 'web' : 'produced';

    }

    public static function video($video, $get = false)
    {
        return array_map(function($value) use($video, $get){

            $d = str_replace(['{id}'], [$video->id], $value);

            if (!$get && !Storage::disk(self::$disk)->exists($d)) Storage::disk(self::$disk)->makeDirectory($d, 0775, true);

            return $d;

        }, self::$directories_map['videos']);
    }

    public static function video_public($video = null, $get = true)
    {
        if (is_null($video)) return self::$directories_map['video_public'];

        return array_map(function($value) use($video, $get){

            $d = str_replace(['{id}'], [$video->id], $value);

            if (!$get && !Storage::disk(self::$disk)->exists($d)) Storage::disk(self::$disk)->makeDirectory($d, 0775, true);

            return $d;

        }, self::$directories_map['video_public']);
    }

    public static function extract_public($extract = null, $get = true)
    {
        if (is_null($extract)) return self::$directories_map['extract_public'];

        return array_map(function($value) use($extract, $get){

            $d = str_replace(['{id}'], [$extract->id], $value);

            if (!$get && !Storage::disk(self::$disk)->exists($d)) Storage::disk(self::$disk)->makeDirectory($d, 0775, true);

            return $d;

        }, self::$directories_map['extract_public']);
    }

    public static function short_public($short = null, $get = true)
    {
        if (is_null($short)) return self::$directories_map['short_public'];

        return array_map(function($value) use($short, $get){

            $d = str_replace(['{id}'], [$short->id], $value);

            if (!$get && !Storage::disk(self::$disk)->exists($d)) Storage::disk(self::$disk)->makeDirectory($d, 0775, true);

            return $d;

        }, self::$directories_map['short_public']);
    }


    public static function extract($extract, $get = false)
    {
        return array_map(function($value) use($extract, $get){

            $d = str_replace(['{id}'], [$extract->id], $value);

            if (!$get && !Storage::disk(self::$disk)->exists($d)) Storage::disk(self::$disk)->makeDirectory($d, 0775, true);

            return $d;

        }, self::$directories_map['extracts']);

    }

    public static function short($short, $get = false)
    {
        return array_map(function($value) use($short, $get){

            $d = str_replace(['{id}'], [$short->id], $value);

            if (!$get && !Storage::disk(self::$disk)->exists($d)) Storage::disk(self::$disk)->makeDirectory($d, 0775, true);

            return $d;

        }, self::$directories_map['shorts']);

    }


    public static function album($album, $get = false)
    {
        return array_map(function($value) use($album, $get){

            $d = str_replace(['{user_id}', '{type}'], [$album->user_id, self::getType($album)], $value);

            if (!$get && !Storage::disk('albums')->exists($d)) Storage::disk('albums')->makeDirectory($d, 0775, true);

            return $d;

            //if ($get) return $d;

            //if (!Storage::exists($d)) Storage::makeDirectory($d, 0775, true);

            //return storage_path('app/').$d;

        }, self::$directories_map['album']);
    }


    public static function product($product, $get = false)
    {
        $d = str_replace(['{user_id}', '{product_id}'], [$product->user_id, $product->id], self::$directories_map['product']);

        if (!$get && !Storage::disk('products')->exists($d)) Storage::disk('products')->makeDirectory($d, 0775, true);

        return $d;

        //if ($get) return $d;

        //if (!Storage::exists($d)) Storage::makeDirectory($d, 0775, true);

        //return storage_path('app/').$d;
    }

    public static function user_public()
    {
        return self::$directories_map['user_public'];
    }

    public static function user($switch, $get = false)
    {

        $d = self::$directories_map['user'][$switch];

        if ($get) return $d;

        if (!Storage::exists($d)) Storage::makeDirectory($d, 0775, true);

        return storage_path('app/').$d;
    }

    */

}
