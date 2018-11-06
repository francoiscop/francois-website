<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Video;
use Cache;

class HomeController extends Controller
{
    public function __construct()
    {
    }

    
    public function home()
    {
        Cache::forget('reel');
        Cache::forget('selection');

        $reel = Cache::remember('reel', 1000*60, function () {
            return Video::where('slug', 'reel')->firstOrFail();
        });

        $selection = Cache::remember('selection', 1000*60, function () {
            return Video::selection()->orderBy('created_at', 'DESC')->get();
        });

        return view('home',[

            'reel' => $reel,
            'selection' => $selection,
            'is_brand' => false,
            'is_scroll' => false
        
        ]);
    }
}
