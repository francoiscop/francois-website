<?php
namespace App\Providers;

use App\Menu;
use App\Store;
use Cache;
use Illuminate\Support\ServiceProvider;

class MenuServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        
        Cache::forget('menu'); 

        if (Cache::has('menu')){
           
            $menu = Cache::get('menu');
        
        } else {

            $menus = Menu::all();

            $stores = Store::all();

            $work = $menus->filter(function($value, $key){

                if ($value->name === 'work') return $key;

            });

            $index = (int)($work->keys()->implode(''));

            $menus = $menus->toArray();

            array_splice($menus, $index, 0, $stores->toArray());

            $menu = collect($menus)->map(function($value){

                return (object)$value;
            
            })->forget($index + $stores->count())->values();

            //dd($menu);

            Cache::put('menu', $menu, 22*60);
        }

        view()->share(['menu' => $menu]);
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
