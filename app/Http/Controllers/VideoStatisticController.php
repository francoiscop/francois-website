<?php

namespace App\Http\Controllers;

use App\VideoStatistic;
use Illuminate\Http\Request;
use Tracker;

class VideoStatisticController extends Controller
{

    public function __construct()
    {
        $this->middleware('auth:admin')->except('store');
    }


    public function index()
    {
        $statistics = VideoStatistic::orderBy('created_at', 'DESC')->paginate(50);

        //return $statistics;

        return view('admin.statistics', [
            
            'statistics' => $statistics
        
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store($id, Request $request)
    {
        $visitor = Tracker::currentSession();

        /*
        var_dump($visitor->device->is_mobile);
        var_dump($visitor->device->platform); //Mac os x
        var_dump($visitor->device->platform_version); //10.6
        var_dump($visitor->device->model); //mac
        var_dump($visitor->device->kind); //computer

        var_dump($visitor->agent->browser); //chrome
        var_dump($visitor->agent->browser_version); //62.10.

        var_dump($visitor->geoIp->city);
        var_dump($visitor->geoIp->country_name);
        var_dump($visitor->geoIp->postal_code);

        var_dump($visitor->client_ip);
        var_dump($visitor->referer_id);
        */
        
        $stat = VideoStatistic::create([
            'video_id' => ($id === 'reel') ? 1 : $id,
            'title' => $request->title,
            'event' => $request->event,
            'time' => $request->time,
            'ip' => $request->ip(),
            'kind' => $visitor->device->kind,
            'platform' => $visitor->device->platform,
            'is_mobile' => $visitor->device->is_mobile,
            'browser' => $visitor->agent->browser,
            'city' =>  (!is_null($visitor->geoIp)) ? $visitor->geoIp->city : null,
            'country' => (!is_null($visitor->geoIp)) ?$visitor->geoIp->country_name : null
        ]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\VideoStatistic  $videoStatistic
     * @return \Illuminate\Http\Response
     */
    public function show(VideoStatistic $videoStatistic)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\VideoStatistic  $videoStatistic
     * @return \Illuminate\Http\Response
     */
    public function edit(VideoStatistic $videoStatistic)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\VideoStatistic  $videoStatistic
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, VideoStatistic $videoStatistic)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\VideoStatistic  $videoStatistic
     * @return \Illuminate\Http\Response
     */
    public function destroy(VideoStatistic $videoStatistic)
    {
        //
    }
}
