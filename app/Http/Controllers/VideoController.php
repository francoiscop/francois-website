<?php

namespace App\Http\Controllers;

/*
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use App\VideoSystem;
use App\VideoStatistic;
use App\Genre;
use App\GenreVideo;
use Cache;
use Auth;
use App\Classes\IMDBConnect;
use Image;
*/





use App\Video;
use App\Store;
use Cache;
use Illuminate\Http\Request;
use App\Classes\Utils;
use App\Traits\EditTrait;
use App\Traits\FormTrait;
use Illuminate\Support\Facades\Validator;
use Response;
use App\Classes\Medias;
use Image;


class VideoController extends Controller
{
    use EditTrait;

    use FormTrait;


    protected $perPage = 400;

    protected static $edit_remove = ['id', 'uid', 'user_id', 'web', 'slug', 'original_title', 'pictures_count', 'is_infos', 'is_licenced', 'is_flag', 'copyrights_holder', 'created_at', 'updated_at', 'deleted_at'];



    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index($slug)
    {
        //Cache::forget($slug); 

        if (Cache::has($slug)) $videos = Cache::get($slug);
        
        else {

            $store = Store::where('slug', $slug)->with(['videos' => function($query){

                $query->orderBy('created_at', 'DESC');

            }])->get();

            if (is_null($store) || $store->count() === 0) abort(404);

            $videos = $store[0]['videos'];

            if (is_null($videos) || $videos->count() === 0) abort(404);

            Cache::put($slug, $videos, 22*60);
        }

        return view('videos.index', [

            'videos' => $videos,
            'is_loader' => false

        ]);

    }



    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function watch($slug)
    {
        $video = Video::where('slug', $slug)->firstOrFail();

        $key = $video->store->slug;

        //Cache::forget($key); 

        if (Cache::has($key)) $videos = Cache::get($key);
        
        else {

            $store = Store::where('slug', $key)->with(['videos' => function($query){

                $query->orderBy('created_at', 'DESC');

            }])->get();

            $videos = $store[0]['videos'];

            Cache::put($key, $videos, 22*60);
        }

        $videos = $videos->reject(function($v) use($video) {
                return $v->id === $video->id;
        });

        return view('videos.watch', [

            'videos' => $videos,
            'video' => $video,
            'is_loader' => false

        ]);

    }


    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function ajax()
    {
        $videos = Video::orderBy('created_at', 'DESC')->get()->groupBy('genre');

        return Response::json([
            
            'items' => $videos
        
        ], 200); 
    }


    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {        
        return view('admin.videos.create', [

            'form' => ['form' => self::getForm('video')]

        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $this->validator($request->all())->validate();

        $video = Video::create([

            'uid' => utils::uid(),
            'title' => $request->title,
            'client' => $request->client,
            'store_id' => utils::storeId($request->store),
            'provider' => $request->provider,
            'url' => $request->url,
            'country' => $request->country,
            'produced_at' => utils::producedAt($request->date_production),
            'description' => $request->description,
            'format' => $request->format,
            'aspect_ratio' => $request->aspect_ratio,
            'camera' => $request->camera,
            'is_screencaps' => $request->screencaps,
            'is_selection' => (is_null($request->selection)) ? false : $request->selection

        ]);

        $genre = \App\Genre::where('name', $request->genre)->first();

        if (!is_null($genre)) $video->genres()->sync($genre->id);

        self::syncRelationship($video, $request, 'directors', true);

        self::syncRelationship($video, $request, 'dop', true);

        self::syncRelationship($video, $request, 'productions');

        self::syncRelationship($video, $request, 'tags');

        return Response::json([
            
            'hide' => false,
            'message' => 'created'
        
        ], 200);
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
        return Validator::make($data, self::setRules('video'), self::setMessages('video'));
    }

    protected static function syncRelationship($video, $request, $relation, $isNameArray = false)
    {
        if (is_array($request->$relation)){

            $class = '\App\\' . ucfirst(trim($relation, 's'));

            $to_sync = [];

            foreach ($request->$relation as $name) {

                if (!$isNameArray){

                    $name = str_replace(['"','-'], ['', ' '], $name);

                    $create = ['name' => $name];

                } else {

                    $names = explode('-', $name);

                    if (count($names) === 1) $names = explode(' ', $name);

                    if (count($names) < 2) $names = [null, $names[0]];

                    if (count($names) === 3) $names = [$names[0].' '.$names[1], $names[2]];

                    $create = [
                        'first_name' => $names[0],
                        'last_name' => $names[1]
                    ];
                }       

                $model = $class::firstOrCreate($create);

                array_push($to_sync, $model->id);
            }

            $relationship = trim($relation, 's') . 's';

            $video->$relationship()->sync($to_sync);
        }

    }


    public function screencaps($id, Request $request)
    {
        $video = Video::where('id', $id)->firstOrFail();
        
        $screencaps = $video->screencaps();
        
        if (count($screencaps['images']) === 0) return Response::json(['error' => 'images not found'], 422);

        return Response::json([
            
            'images' => $screencaps['images'],
            'aspect' => $screencaps['aspect']

        ], 200);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Dop  $dop
     * @return \Illuminate\Http\Response
     */
    public function show(Video $video)
    {
        //
    }



    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Dop  $dop
     * @return \Illuminate\Http\Response
     */
    public function editIndex(Video $video)
    {
        $videos = Video::orderBy('created_at', 'DESC')->get()->groupBy('store_id');

        return view('admin.videos.index', [
            
            'videos' => $videos

           
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Dop  $dop
     * @return \Illuminate\Http\Response
     */
    public function edit($slug, Video $video)
    {
        $video = Video::where('slug', $slug)->firstOrFail();

        self::$init = [
        
            'table' => 'videos',
            'required' => ['title'],
            'keys_to_remove' => self::$edit_remove,
            'keys_to_add' => []
    
        ];

        $edit = self::getEdit($video);

        //fix produced_at :: (type should be date_year_month) && value
        $edit['produced_at']['type'] = 'date_year_month';
        $edit['produced_at']['datas'] = Utils::jsDateYearMonth();

        //fix store_id :: (type should enum) && value
        $edit['store_id']['type'] = 'enum';
        $edit['store_id']['enum'] = Utils::jsStore();
        $edit['store_id']['value'] = (is_null($video->store)) ? null : $video->store->name;

        $edit = self::appendEditTags($edit, [

            'productions' => $video->productions,
            'directors' => $video->directors,
            'genre' => $video->genres,
            'tags' => $video->tags,
            
        ]);

        $form = [

            'url' => '/admin/rest/video/update/' . $video->id,

            'form' => $edit
        ];

        $images = Medias::admin($video);

        $settings = config('app.settings');

        $settings = [
                
                'url' => '/admin/rest/video/image/' . $video->id,
                'type' => 'video',
                'valid_file_upload' => $settings['upload']['valid_file_upload']['album'],
                'max_size_upload' => $settings['upload']['max_size_upload']['album'],
                'min_size_upload' => $settings['upload']['min_size_upload']['album'],
        
        ];

        return view('admin.videos.edit', [
            
            'video' => $video,
            'form' => $form,
            'upload' => [
                'images' => $images,
                'settings' => $settings
            ],
            'max_thumbs' => null,
        
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Dop  $dop
     * @return \Illuminate\Http\Response
     */
    public function update($id, Request $request, Video $video)
    {
        $video = Video::where('id',$id)->firstOrFail();

        //fix produced_at
        $request->merge(['produced_at' => utils::producedAt($request->produced_at)]);

        //fix store_id
        $request->merge(['store_id' => utils::storeId($request->store_id)]);

        $updated = self::updateProcess($video, $request);

        if ($updated) return Response::json([
            
            'hide' => false,
            'message' => 'updated !'
        
        ], 200);

        return Response::json(['error' => 'Error system'], 402);
    }


    public function order(Request $request, Video $video)
    {
        foreach($request->videos as $k => $id){
            
            Video::where('id', $id)->update(['created_at' => \Carbon\Carbon::now()->subDays($k + 1)]);      
        }

        return Response::json([], 200);
    }


    public function image($id, Request $request)
    {        
        $video = Video::where('id', $id)->firstOrFail();

        $file = \App\Http\Controllers\AdminController::processFile($request, null);

        $directories = Medias::video($video);

        $new_file = $directories['thumb'] . '-'  . $request->thumbId . '.jpg';

        $width = 500;

        if ($request->thumbId === 'hero'){

            $new_file = $directories['hero'] . '.jpg';

            $width = 800;

        }

        $image = Image::make($file->full_path);

        $cropped_value = $request->cropped_value;

        $cp_v = explode("," ,$cropped_value);
        
        $image->crop($cp_v[0],$cp_v[1],$cp_v[2],$cp_v[3])->resize($width, $height = null, function ($constraint) {

            $constraint->aspectRatio();

        })->save(storage_path('app/') . $new_file);

        unlink($file->full_path);

        return Response::json([], 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Dop  $dop
     * @return \Illuminate\Http\Response
     */
    public function destroy(Video $video)
    {
        //
    }


    /*
    public function home($genre = null, Request $request)
    {

        $q = '';
        $i = 0;
        
        foreach ($request->all() as $k => $v) {
           $sep = ($i === 0) ? '?' : '&';
           $q .= $sep.$k.'='.$v;
           $i ++;
        }

        $url = self::$route_videos;

        if (!is_null($genre)) $url = $url . '/' . $genre;

        return redirect($url . '/page/1' . $q);
    }


   
    public function index($page, Request $request)
    {

        $tags = [];

        $builder = Video::query();

        if ($request->has('tags') && !empty($request->tags)){

            $tags = explode(',', $request->tags);
            
            array_walk($tags, 'trim');

            $builder->whereHas('tags', function($query) use($tags) {
                
                $query->whereIn('name', $tags);
            
            });
        }

        $builder->with('tags')->orderByDesc('created_at');

        $datas = $builder->simplePaginate($this->perPage, ['*'], 'page', $page);

        //echo '<pre>';
        //print_r($datas->toArray());
        //die();
        //return $datas;

        return view('videos.index', [
            'datas' => $datas,
            'genre' => null,
            'tags' => $tags,
            'last' => count($datas->items()) === 0,
            'is_fullwidth' => $this->is_fullwidth,
            'columns' => [
                'left' => 0,
                'middle' => 12,
                'right' => 0
            ]
        ]);
    }

    public function indexGenre($genre, $page, Request $request)
    {
        $datas = Video::with('genres')->whereHas('genres', function($q) use($genre) {

            $q->where('name', $genre);
        
        })->orderByDesc('created_at')->simplePaginate($this->perPage, ['*'], 'page', $page);

        //return $datas;

        return view('videos.index', [
            'datas' => $datas,
            'genre' => $genre,
            'tags' => [],
            'last' => count($datas->items()) === 0,
            'is_fullwidth' => $this->is_fullwidth,
            'columns' => [
                'left' => 0,
                'middle' => 12,
                'right' => 0
            ]
        ]);
    }


    public function search(Request $request)
    {
        if ($request->has('tags')){

            $tags = explode(',', $request->tags);
            array_walk($tags, 'trim');

            $albums = Album::whereHas('tags', function($query) use($tags) { $query->whereIn('name', $tags); });

            echo '<pre>';
            print_r($albums->get()->toArray());
            die();

        }


        //$response = self::filter($request, 'album');
        $datas = Album::with('tags')->get()->paginate($this->perPage);

        echo '<pre>';
        print_r($request->all());
        print_r($request->tags);
        var_dump($request->has('tags'));
        print_r($request->route()->parameters());
        die();

        return view('albums.index', $datas);
    }



    public function show($slug)
    {
        $video = Video::where('slug', $slug)->with('tags', 'directors', 'casts')->firstOrFail();

        $hasLiked = false;

        if (Auth::check()){

            $hasLiked = Auth::user()->hasLiked($video->id, 'App\Video');

        }

        //return $video;
        //return $video->infos()->get('quality_mp4');


        return view('videos.fiche', [

            //'user' => $video->user,
            
            'video' => $video,
            'hasLiked' => $hasLiked,
            'infos' => $video->infos(),
            'columns' => [
                'left' => 3,
                'middle' => 8,
                'right' => 1
            ]
        
        ]);
    }






















   
  

    

    public function indexPoster(Request $request)
    {

        $response = self::response($request, 'video');

        return view('films.index', $response);
    }



    

    public static function createAfterEncoding($video)
    {
        VideoStatistic::create([
            'video_id' => $video->id
        ]);

        $create = collect($video->upload)->diffKeys([
            'id' => 1,
            'created_at' => 1,
            'converted_at' => 1,
            'updated_at' => 1,
            'deleted_at' => 1,
            'slug' => 1
        ]);

        $create->put('video_id', $video->id);

        $create_video_system = $create->intersectByKeys(array_flip(Utils::getColumnsArray('video_systems')));

        VideoSystem::create($create_video_system->toArray());     

        
        \App\Http\Controllers\UploadController::tags($video->upload->tags, $video->id, 'video');

        
        $genres_export = [];

            
            foreach ($video->upload->genres as $genre) {

                $inserted = Genre::firstOrCreate(['name' => str_replace('"', '', $genre)]);
            
                array_push($genres_export, $inserted->id);
            }
        

        foreach ($genres_export as $genre){

            GenreVideo::firstOrCreate([
                'video_id' => $video->id,
                'genre_id' => $genre
            ]);
        
        }

        $video->update([
            'is_encode' => true
        ]);

        return $video;
    }

    public static function createAfterEncoding_xxxxxxx($video)
    {

        $create = collect($videoUpload)->diffKeys([
            'id' => 1,
            'created_at' => 1,
            'converted_at' => 1,
            'updated_at' => 1,
            'deleted_at' => 1,
            'slug' => 1
        ]);

        $create->put('video_id', $video->id);

        $create_video_system = $create->intersectByKeys(array_flip(Utils::getColumnsArray('video_systems')));

        $create_video_statistic = $create->intersectByKeys(array_flip(Utils::getColumnsArray('video_statistics')));

        VideoSystem::create($create_video_system->toArray());

        VideoStatistic::create($create_video_statistic->toArray());

        
        \App\Http\Controllers\UploadController::tags(json_decode($videoUpload->tags), $video->id, 'video');

        
        $genres_export = [];

        if (!is_null($videoUpload->genres) && is_array(json_decode($videoUpload->genres))){
            
            foreach (json_decode($videoUpload->genres) as $genre) {

                $inserted = Genre::firstOrCreate(['name' => str_replace('"', '', $genre)]);
            
                array_push($genres_export, $inserted->id);
            }
        }

        foreach ($genres_export as $genre){

            GenreVideo::firstOrCreate([
                'video_id' => $video->id,
                'genre_id' => $genre
            ]);
        
        }

        $video->update([
            'is_encode' => true
        ]);

        return $video;
    }
    
    



    public function editIndex()
    {
        $videos = Video::select(['id', 'uid', 'title', 'slug'])->orderBy('created_at', 'DESC')->get();

        return view('admin.edit-index', [

            'videos' => $videos,
            'columns' => ['left' => 3, 'middle' => 9, 'right' => 0]

        ]);
    }



    public function edit($slug)
    {
        $video = Video::where('slug', $slug)->firstOrFail();

        self::$init = [
        
            'table' => 'videos',
            'required' => ['title'],
            'keys_to_remove' => ['id', 'uid', 'user_id', 'original_file', 'slug', 'created_at', 'updated_at', 'deleted_at', 'thumb', 'poster', 'web', 'price', 'tokens', 'discount'],
            'keys_to_add' => []
    
        ];

        $edit = self::getEdit($video);

        $edit = self::appendEditTags($edit, [

            'directors' => $video->directors,
            'genre' => $video->genres,
            'tags' => $video->tags,
            'tags_imdb' => $video->tagimdbs,
            'casts' => $video->casts
        ]);

        $imdbs = IMDBConnect::getImages($video);

        $thumbs = json_decode($video->getRotator());

        $images = array_merge($imdbs['images'], $imdbs['posters'], $thumbs);

        $settings = config('app.settings');

        $settings = [
                
                //'url' => '/admin/rest/edit/upload/' . $video->id,
                'url' => '/admin/rest/image/video/' . $video->id,
                'type' => 'video',
                'valid_file_upload' => $settings['upload']['valid_file_upload']['album'],
                'max_size_upload' => $settings['upload']['max_size_upload']['album'],
                'min_size_upload' => $settings['upload']['min_size_upload']['album'],
        
        ];

        return view('admin.edit', [
            
            'video' => $video,
            'edit' => $edit,
            'upload' => [
                'images' => $images,
                'settings' => $settings
            ],
            'max_thumbs' => null,
            'hasLiked' => true,
            'columns' => ['left' => 3, 'middle' => 8, 'right' => 1]
        
        ]);
    }

    public function update($id, Request $request)
    {
        $video = Video::where('id',$id)->firstOrFail();

        $updated = self::updateProcess($video, $request);

        if ($updated) return Response::json(['hide' => false], 200);

        return Response::json(['error' => 'Error system'], 402);
    }



    public function imageUpdate($id, Request $request)
    {

        $video = Video::where('id', $id)->firstOrFail();

        if ($request->hasFile('file')){

            $file_name = $request->name.'-'.$video->id.'-'.$video->uid.'.'.'jpg';

            self::crop($request->file('file'), $request->cropped_value, $file_name, 'app/public/videos/'.$request->name.'s/', null, null);

            return Response::json([], 200);
        }

        return Response::json(['error' => 'image not found'], 402);
    }





    public function destroy(Video $video)
    {
        //
    }

    public function create()
    {
        //
    }
    */

}
