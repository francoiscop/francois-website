<?php

namespace App\Http\Controllers;

use App\Tag;
use App\Tagimdb;
use Illuminate\Http\Request;

use Response;

class TagController extends Controller
{
   
    protected $is_imdb_tags = false;


    public function search(Request $request)
    {
        $tags = collect();
        
        $tags = Tag::where('name', 'like', '%' . $request->q . '%')->select('name')->get();

        $tags = collect($tags)->pluck('name');

        if ($this->is_imdb_tags){

            $tags_imdb = Tagimdb::where('name', 'like', '%' . $request->q . '%')->select('name')->get();

            $tags_imdb = collect($tags_imdb)->pluck('name');

            $tags = $tags_imdb->merge($tags);

        }
       
         return Response::json(['result' => $tags], 200);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
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
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Tag  $tag
     * @return \Illuminate\Http\Response
     */
    public function show(Tag $tag)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Tag  $tag
     * @return \Illuminate\Http\Response
     */
    public function edit(Tag $tag)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Tag  $tag
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Tag $tag)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Tag  $tag
     * @return \Illuminate\Http\Response
     */
    public function destroy(Tag $tag)
    {
        //
    }
}
