<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Response;


class TestController extends Controller
{


    public function Encode()
    {
        $file_test = storage_path('app/uploads/') . 'test.mp4';

        $video_upload = new \stdClass();
        $video_upload->id = 'test_id';
        $video_upload->user_id = 'test_user_id';
        $video_upload->web = true;
        $video_upload->file_name = 'test_name';

        try {
        
            $file = \App\Classes\Encode\MediaInfo::get($file_test);

            $file->full_path = $file_test;

            $file->file_name = 'test_name';

            $file->extension = 'mp4';
    
        } catch (Exception $e){

            var_dump($e);
        }

        try {
        
            $encode = new \App\Classes\Encode\Encode($file, $video_upload, $resolution = false, $create = true);

        } catch (Exception $e){

            var_dump($e);
        }
    }

    
}
