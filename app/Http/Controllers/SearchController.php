<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\SearchRequest;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Response;
use Redirect;
use App\Classes\Utils;

class SearchController extends Controller
{
    private static $select_map = [
        'video' => ['title', 'id', 'uid', 'slug', 'web', 'user_id', 'thumb'],
        'extract' => ['title', 'id', 'uid', 'slug', 'user_id'],
        'album' => ['title', 'id', 'uid', 'slug', 'web', 'user_id'],
        'product' => ['title', 'id', 'uid', 'slug', 'user_id', 'category', 'images'],
        'user' => ['username', 'id', 'uid', 'gender', 'country', 'dob', 'avatar'],
    ];

    private static $views_map = [
        'video' => [
            'view' => 'films',
            'path' => '',
            'columns' => [0, 12, 0]
        ],
        'extract' => ['title', 'id', 'uid', 'slug', 'user_id'],
        'album' => ['title', 'id', 'uid', 'slug', 'web', 'user_id'],
        'product' => ['title', 'id', 'uid', 'slug', 'user_id', 'category', 'images'],
        'user' => ['username', 'id', 'uid', 'gender', 'country', 'dob', 'avatar'],
    ];

    private $keys_default = 'name';
    private $keys_title = [

        'video', 'product', 'extract'
    ];
    private $keys_username = [

        'user'
    ];

    protected $is_fullwidth = false;

    public function getKey($model)
    {
        if (in_array($model, $this->keys_title)) return 'title';

        if (in_array($model, $this->keys_username)) return 'username';

        return $this->keys_default;
    }





    public function main($models, SearchRequest $request)
    {
        if (!$request->has('q') || $request->q === '') return Redirect::back();

        $q = $request->q;

        $model = trim($models, 's');

        if ($model === 'member') $model = 'user';

        $class = '\App\\'.ucfirst($model);

        $key = self::getKey($model);

        $objects_exact = $class::where($key, $q)->get();

        $objects_like = $class::where($key, 'like', "%$q%")->get();

        $objects = $objects_exact->merge($objects_like);

        $path = $model === 'video' ? 'films' : $models;

        //$Pagination = new LengthAwarePaginator($objects, count($objects), $perPage = 5, $currentPage = 1);
        $datas = new Paginator($objects, $perPage = 5, $currentPage = 1, ['path' => $path . '/page/' . $currentPage]);

        //return $Pagination;

        //return $objects->forPage($page = 1, $perPage = 5);

        if (method_exists($class, 'tags')){
                $tags = '\App\\Tag'::where('name', 'like', '%'.$request->q.'%')->whereHas($model.'s')->select('name')->get();
        }

        return view($models . '.index', [
            'datas' => $datas,
            'genre' => null,
            'tags' => [],
            'friends' => false,
            'countries' => Utils::jsCountry(true)->toArray(),
            'selected' => '',
            'genders' => [],
            'order' => null,
            'last' => count($datas->items()) === 0,
            'is_fullwidth' => $this->is_fullwidth,
            'columns' => [
                'left' => 0,
                'middle' => 12,
                'right' => 0
            ]
        ]);


    }

    public function simplePaginate($perPage = null, $columns = ['*'], $pageName = 'page', $page = null)
    {
        $page = $page ?: Paginator::resolveCurrentPage($pageName);

        $perPage = $perPage ?: $this->model->getPerPage();

        // Next we will set the limit and offset for this query so that when we get the
        // results we get the proper section of results. Then, we'll create the full
        // paginator instances for these results with the given page and per page.
        $this->skip(($page - 1) * $perPage)->take($perPage + 1);

        return $this->simplePaginator($this->get($columns), $perPage, $page, [
            'path' => Paginator::resolveCurrentPath(),
            'pageName' => $pageName,
        ]);
    }


    public function ajax($model = null, $id = null, Request $request)
    {
        if ($model === 'member') $model = "user";

        $models = $model . 's';

        if (self::isRequest('s', $request)){

            $tags = self::getTags($models, $request->s);

            $titles = self::getTitle($model, $request->s);

            return Response::json(['result' => $tags->merge($titles)], 200);
        }


        if (self::isRequest('tags', $request)){

            return Response::json(['result' => self::getTags($models, $request->tags)], 200);

        }

        if (self::isRequest('q', $request) && in_array($model, ['dop', 'director', 'cast'])){

            $class = '\App\\'.ucfirst($model);

            $responses = $class::where('first_name', 'like', '%'.$request->q.'%')->orWhere('last_name', 'like', '%'.$request->q.'%')->select(['first_name', 'last_name'])->get();

            return Response::json(['result' => collect($responses)->pluck('name')], 200);

        }

        if (self::isRequest('q', $request) && in_array($model, ['production'])){

            $class = '\App\\'.ucfirst($model);

            $responses = $class::where('name', 'like', '%'.$request->q.'%')->select('name')->get();

            return Response::json(['result' => collect($responses)->pluck('name')], 200);

        }

        if (self::isRequest('q', $request)){

            return Response::json(['result' => self::getTags($models, $request->q, true)], 200);

        }

        if (self::isRequest('title', $request)){

            return Response::json(['result' => self::getTitle($model, $request->title)], 200);

        }

        if (self::isRequest('name', $request)){

            return Response::json(['result' => self::getTitle($model, $request->name, 'username')], 200);

        }

    }


    private static function getTags($models, $request, $direct = false)
    {
        $builder = '\App\\Tag'::query();

        $builder->where('name', 'like', '%'.$request.'%');

        if (!$direct){

            $class = self::getClass(trim($models, 's'));

            if (!method_exists($class, 'tags')) return collect();

            $builder->whereHas($models);

        }

        $builder->select('name');

        return $builder->get()->map(function($tag){

                return $tag->name;

        });

    }

    private static function getTitle($model, $request, $key = 'title')
    {
        return self::getClass($model)::where($key, 'like', '%'.$request.'%')->select(self::$select_map[$model])->get();
    }

    private static function getClass($model)
    {
        return '\App\\'.ucfirst($model);
    }


    private static function isRequest($key, $request)
    {
        return ($request->has($key) && $request->$key !== '');
    }










    public function ajax_old_xxxxxx($model = null, $id = null, Request $request)
    {
        if ($model === 'member') $model = "user";

        $models = $model . 's';

        if (self::isRequest('s', $request)){

            $tags = self::getTags($models, $request->s);

            $titles = self::getTitle($model, $request->s);

            return Response::json(['result' => $tags->merge($titles)], 200);
        }

        
        die('test');





        if ($request->has('tags') && $request->tags !== ''){

            $name = $request->tags;

            $tags = '\App\\Tag'::where('name', 'like', '%'.$name.'%')->whereHas($model.'s')->select('name')->get();


            $tags = $tags->map(function($tag){

                return $tag->name;

            });

            //die('test');

            return Response::json(['result' => $tags], 200);

        }

        if ($request->has('q') && $request->q !== ''){

            $tags = '\App\\Tag'::where('name', 'like', '%'.$request->q.'%')->select('id', 'name')->get();

            return Response::json(['result' => $tags], 200);

        }

        if ($request->has('title') && $request->title !== ''){

            $datas = $class::where('title', 'like', '%'.$request->title.'%')->select($this->select_map[$model])->get();

            return Response::json(['result' => $datas], 200);

        }

        if ($request->has('name') && $request->name !== ''){

            $datas = $class::where('username', 'like', '%'.$request->name.'%')->select($this->select_map[$model])->get();

            return Response::json(['result' => $datas], 200);

        }
    }


    public function ajax_RARE_XXXXXX($model = null, $id = null, Request $request)
    {
        $class = '\App\\'.ucfirst($model);

        if ($model === 'friend'){

            $user = \App\User::where('id', $id)->firstOrFail();

            $friends = $user->friendsAll();

            $result = $friends->filter(function ($item) use ($request) {

                //return false !== stristr($item->username, $request->q);
                return (strpos($item->username, $request->q) !== false);
            
            });

            //echo '<pre>';
            //print_r($result->toArray());
            //die();


            return Response::json([
                'result' => $result
            ]);

        }

        if ($model === 'tag'){

            $tags = \App\Tag::where('name', 'like', '%' . $request->q . '%')->select(['id', 'name'])->get();

            $tags_imdb = \App\Tagimdb::where('name', 'like', '%' . $request->q . '%')->select(['name'])->get();

            $result = $tags_imdb->merge($tags)->unique();

            return Response::json([
                //'result' => array_merge($tags, $tags_imdb)
                'result' => $result
            ]);

        }

        $key = $this->getKey($model);

        $builder = $class::query();

        $builder->where($key, 'like', '%' . $request->q . '%');

        if ($model === 'video'){

            $builder->select('id','uid','title','slug');
        
        } else if ($model === 'user') {

            $builder->select('id', $key, 'uid', 'dob', 'gender', 'country', 'avatar');

        } else {

            $builder->select('id',$key);

        }

        return Response::json([
            'result' => $builder->get()
        ]);
        
    }

    
}
