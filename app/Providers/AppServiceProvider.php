<?php

namespace App\Providers;

use Validator;
use Blade;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Validators\CustomRules;
use Illuminate\Support\Facades\Schema;
use Jenssegers\Agent\Agent;


class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Schema::defaultStringLength(191);

        $agent = new Agent();

        view()->share(['is_scroll' => true]);
        view()->share(['is_menu' => true]);
        view()->share(['is_loader' => true]);
        view()->share(['is_brand' => true]);
        View()->share('agent', $agent);
        view()->share([
            'columns' => [
                'left' => 1,
                'middle' => 10,
                'right' => 1
            ]
        ]);

        /** for BLADE DIRECTIVE:
        */
        // Add @set for Variable Assignment
        Blade::directive('set', function($expression)
        {
            // Strip Open and Close Parenthesis
            if(Str::startsWith($expression, '('))
                $expression = substr($expression, 1, -1);
                // Break the Expression into Pieces
                $segments = explode(',', $expression, 2);
                // Return the Conversion
                return "<?php " . $segments[0] . " = " . $segments[1] . "; ?>";
        });


        /**
         * Paginate a standard Laravel Collection.
         *
         * @param int $perPage
         * @param int $total
         * @param int $page
         * @param string $pageName
         * @return array
         */
        Collection::macro('paginate', function($perPage, $total = null, $page = null, $pageName = 'page') {
            $page = $page ?: LengthAwarePaginator::resolveCurrentPage($pageName);
            return new LengthAwarePaginator(
                $this->forPage($page, $perPage),
                $total ?: $this->count(),
                $perPage,
                $page,
                [
                    'path' => LengthAwarePaginator::resolveCurrentPath(),
                    'pageName' => $pageName,
                ]
            );
        });

    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        require_once __DIR__ . '/../Helpers/Helper.php';
    }
}
