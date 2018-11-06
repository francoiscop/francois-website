<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Auth;
use Response;
use App\Feed;
use App\Classes\Medias;
use Illuminate\Support\Facades\Storage;

class DeleteController extends Controller
{

    public function destroy($model, $id)
    {
        $class = 'App\\' . ucfirst($model);

        if (!class_exists($class)) abort(404);

        $object = $class::where('id', $id)->firstOrFail();

        if ($object->user_id !== Auth::user()->id) abort(404);

        //self::deleteFeed($object, $class);

        if (self::isUpdateStatistic($model)) self::updateStatistic($object, $model);

        if ($model === 'post') self::deleteImagePost($object);

        //$object->delete();

        return Response::json(['message' => 'Deleted'], 200);
    }




    public static function deleteFeed($object, $class)
    {
        $feed = Feed::where(['feedable_id' => $object->id, 'feedable_type' => $class]);

        if (is_null($feed)) return;

        $feed->delete();

    }

    public static function updateStatistic($object, $model)
    {
        $statistic = $object->modelable->statistic;

        $key = '_' . $model . 's';

        $statistic->decrement($key);

        echo '<pre>';
        var_dump($key);
        print_r($statistic->$key);
        die();

    }

    public static function isUpdateStatistic($model)
    {

        if (in_array($model, ['post', 'review', 'extract'])) return false;

        return true;

    }

    public static function deleteImagePost($post)
    {
        $directory = Medias::post($post);

        foreach ($post->image as $img) {

            $temp = explode('/', $img);

            $file = $directory . '/' .end($temp);

            if (Storage::exists($file)) Storage::delete($file);
        }
    }
}
