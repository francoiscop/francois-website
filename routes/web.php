<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Auth::routes(['register' => false]);


/*
|
| TESTING
|
*/
// MAIL:
Route::get('/mailable', function () {
    
    $user = App\User::where('id', 5)->withoutGlobalScopes()->first();

    return new App\Mail\ActivateUser($user);
});

/*
|
| HOME
|
*/
Route::get('/', 'HomeController@home');

/*
|
| VIDEOS
|
*/
Route::get('/videos/{slug}', 'VideoController@index');

/*
|
| WATCH
|
*/
Route::get('/watch/{slug}', 'VideoController@watch');

/*
|
| STATISTICS AJAX
|
*/
Route::post('/rest/watch/{id}', 'VideoStatisticController@store');

/*
|
| SCREENCAPS AJAX
|
*/
Route::get('/rest/screencaps/{id}', 'VideoController@screencaps');

/*
|
| SEARCH AJAX
|
*/
Route::get('/rest/search/{model?}/{id?}', 'searchController@ajax');
Route::get('/rest/tags', 'TagController@search');



/*
|
| ADMIN
|
*/
Route::prefix('admin')->group(function(){

    /* index */
    Route::get('/', 'AdminController@index')->name('admin.dashboard');

    /* reset */
    Route::get('/reset', 'adminController@reset');

    /* login */
    Route::get('/login', 'Auth\AdminLoginController@showLoginForm')->name('admin.login');
    Route::post('/login', 'Auth\AdminLoginController@login')->name('admin.login.submit');
    Route::post('/logout','Auth\AdminLoginController@logout')->name('admin.logout');

    /* create video */
    Route::get('/video/create', 'VideoController@create')->middleware('auth:admin');
    Route::post('/video/store', 'VideoController@store')->middleware('auth:admin');

    /* edit video */
    Route::get('/video/edit', 'VideoController@editIndex')->middleware('auth:admin');
    Route::get('/video/edit/{slug}', 'VideoController@edit')->middleware('auth:admin');
    Route::post('/rest/video/update/{id}', 'VideoController@update')->middleware('auth:admin');
    Route::post('/rest/video/image/{id}', 'VideoController@image')->middleware('auth:admin');

    /* order videos */
    Route::post('/rest/videos/order', 'VideoController@order')->middleware('auth:admin');

    /* resize thumbs */
    Route::get('/resize', 'AdminController@resizeThumbs')->middleware('auth:admin');

    /* rename thumbs */
    Route::get('/rename', 'AdminController@renameThumbs')->middleware('auth:admin');

    /* reset videoStat */
    Route::get('/reset', 'AdminController@reset')->middleware('auth:admin');

    /* resize screencaps */
    Route::get('/screencaps/{id}', 'AdminController@resizeScreencaps')->middleware('auth:admin');

});
