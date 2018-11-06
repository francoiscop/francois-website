<?php
namespace App\Providers;

use App\Setting;
use Cache;
use Illuminate\Support\ServiceProvider;

class ConfigServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        
        Cache::forget('settings'); 

        if (Cache::has('settings'))
        {
            $metas = Cache::get('settings');
            config(['app.settings' => Cache::get('settings')]);
        
        } else {

             $settings = Setting::all()->toArray();
             $settings = Setting::format($settings);
             config(['app.settings' => $settings]);
             Cache::put('settings', $settings, 22*60);
        }
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
