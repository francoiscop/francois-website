<?php

namespace App\Traits;

use Auth;


trait FormatFeed{


    /*
    |
    | HELPERS
    |
    */

    private static function getClass($name)
    {
        return 'App\\'.ucfirst($name);
    }

    private static function getType($type)
    {
        $type = strtolower(class_basename($type));
        
        return $type;
    }

    private static function debug($object, $isCollection = true, $isDie = true)
    {
        echo '<pre>';
        $clone = clone $object;
        $_object = ($isCollection) ? $clone->toArray() : $clone;
        print_r($_object);
        if ($isDie) die('--DEBUG--');
    }


    private static function getPage($request)
    {
        if (isset($request->page) && is_numeric($request->page)){

            return $request->page;
        }

        return 1;
    }

    private static function isCollection($object)
    {
        return $object instanceof \Illuminate\Support\Collection;
    }

    

    /*
    |
    | FEED V.2
    |
    */

    private static function formatFeed($feed)
    {

    }

    private static function formatPostAsFeed($post)
    {
        /*
        id : 
        feed_id : []
        date : formatted
        rank : 
        action : published
        name : post
        type : post
        feed_type : post
        child : null,
        aggregates : [],

        user : {}

        object : {
            id :
            body : 
            image: []
            likes_count : 0
            cooments_count : 0
            stats : {

                likes:
                dislikes
                comments
                retweets

            }
        }
        */

        $feed = collect();
        $object = collect();

        $object->put('id', $post->id);
        $object->put('body', $post->body);
        $object->put('image', $post->image);
        //$object->put('statistics', self::formatStat($post));

        $feed->put('id', null);
        $feed->put('child', null);
        $feed->put('aggregates', []);
        $feed->put('action', 'published');
        $feed->put('name', 'post');
        $feed->put('type', 'post');
        $feed->put('date', $post->created_at->diffForHumans());
        $feed->put('user', $post->user);
        $feed->put('object', $object);

        //echo '<pre>';
        //print_r($feed->toArray());
        //die('test');

        return $feed;

    }


    /*
    |
    | FEED V.1
    |
    */
    private static function formatObject($object, $type)
    {
        $export = collect();

        $export->put('object', clone $object);

        $export->put('user', $object->user);

        $export->put('id', $object->id);

        return $export;
        
    }

    private static function formatObject_xxxxxxxxxx($object, $type, $isUser = true, $isDelete = false, $commentType = null)
    {

        $isDelete = self::isDelete($object);


        $formatted = collect();

        if ($isUser){
            
            $formatted->put('object', collect());
            
            $_formatted = $formatted['object'];

        } else {

            $_formatted = $formatted;
        }
        
        $_formatted->put('id', $object->id);

        $_formatted->put('user_id', $object->user_id);

        $_formatted->put('type', $type);
        $_formatted->put('parent', ($type === 'comment') ? $commentType : null);
        $_formatted->put('date', $object->created_at->diffForHumans());

        if ($object->rating && $type !== 'review'){
            
            $_formatted->put('rating', $object->rating);

            return $_formatted;

        }
        
        $_formatted->put('edited', ($object->updated_at === null || $object->created_at == $object->updated_at) ? null : $object->updated_at->diffForHumans());
        $_formatted->put('title', $object->title);
        $_formatted->put('body', ($type === 'comment') ? $object->comment : $object->body);
        $_formatted->put('image', $object->image);

        if ($type === 'review'){
            
            $_formatted->put('rating', $object->rating);
            $_formatted->put('video', $object->video);

        }

        $_formatted->put('deletable', $object->deletable);
        
        //$_formatted->put('stats', self::formatStat($object));


        if ($isUser) $formatted->put('user', $object->user);
            
        return $formatted;

    }

}