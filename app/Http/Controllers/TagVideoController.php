<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\TagVideo;

class TagVideoController extends Controller
{
    public function destroy($vid, $id)
    {
        TagVideo::where(['video_id' => $vid, 'tag_id' => $id])->delete();
        return response()->json(['done']);
    }
}
