<?php

namespace App\Http\Controllers;

use App\Admin;
use Illuminate\Http\Request;
use Response;
use App\CLasses\Medias;
use Image;
use App\Video;




use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Traits\EditTrait;

use App\Classes\Utils;
use Illuminate\Support\Facades\Storage;




class AdminController extends Controller
{
    use EditTrait;
    
    public function __construct()
    {
        $this->middleware('auth:admin');
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return view('admin.index');
    }



    public function reset()
    {

        $tables = [
            'video_statistics',
        ];

        \DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        foreach ($tables as $table) {

            $class = str_singular('\\App\\'.ucfirst(camel_case($table)));
            
            echo '*'.$class;
            
            $class::truncate();
        }

        \DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        echo '<pre>';
        print_r($tables);
    }


    public function renameThumbs()
    {
        ini_set('max_execution_time', 0);

        $d = 'public/videos/thumbs2';

        $videos = Video::all();

        $videos->map(function($video) use ($d){

            self::scanThumbs($video->slug);

            echo'<pre>';
            print_r($video->slug);
            echo'</pre>';

        });

    }

    public function resizeThumbs()
    {
        ini_set('max_execution_time', 0);

        die('test');

        $thumbs = Medias::thumbs();

        foreach ($thumbs as $thumb) {

            echo $thumb;
            
            self::resizeImage($thumb);

            die();
        }

        return $thumbs;

    }


    public function resizeScreencaps($id)
    {

        $d = 'public/videos/screencaps/' . $id;

        ini_set('max_execution_time', 0);

        foreach (Storage::files($d) as $image){

            var_dump($image);
            
        }

    }


    /*
    |
    | STATIC HELPERS
    |
    */
    public static function processFile($request, $media)
    {
        $f = $request->file('file');

        if (is_null($f)) abort(404);

        $file = new \stdClass();

        $file->name = $f->getClientOriginalName();
        
        $file->mimeType = $f->getMimeType();
        
        $file->size = $f->getClientSize();
        
        $file->extension = $f->getClientOriginalExtension();
        
        $file->path = $f->getPathName();
        
        $file->real_name = $f->getFileName();
        
        $file->error = ($f->getError() === 0) ? 
            (bool)$f->getError() : $f->getError();
        
        $file->id = Utils::uid('');
        
        $file->new_name = $file->id.'.'.$file->extension;

        $file->file_name = $file->id;
        
        $file->upload = $f->storeAs('', $file->new_name, 'uploads');

        $storagePath  = Storage::disk('uploads')->getDriver()->getAdapter()->getPathPrefix();
        
        $file->full_path = $storagePath . $file->upload;

        if (in_array($media, ['video', 'extract', 'short'])){

            try {

                $file = (object) array_merge((array) $file, (array) MediaInfo::get($file->full_path));

            } catch (Exception $e){

                return Response::json([], 403);
            }
        }

        return $file;
    }


    public static function resizeImage($image)
    {
        $img = Image::make($image)->resize($width = 500, $height = null, function ($constraint) {

            $constraint->aspectRatio();

        })->save();
    }

    public static function scanThumbs($slug)
    {
        $d = 'public/videos/thumbs4';

        $export = storage_path('app/') . 'public/videos/thumbs3';

        $thumbs = [];

        foreach (Storage::files($d) as $thumb) {

            //if (strpos($thumb, $slug) !== false) array_push($thumbs, $thumb);


            foreach (explode('-', $slug) as $part) {
                
                if (strlen($part) > 2 && strpos($thumb, $part) !== false) array_push($thumbs, $thumb);
            }
        }

        
        foreach ($thumbs as $index => $thumb) {

            $file = storage_path('app/') . $thumb;

            $img = Image::make($file)->resize($width = 500, $height = null, function ($constraint) {

                $constraint->aspectRatio();

            })->save($export . '/' . $slug . '-' . ($index + 1) . '.jpg');
        }
        

        echo "<pre>";
        if (count($thumbs) > 0) print_r($thumbs);
        echo "</pre>";
    }

}
