<?php

namespace App\Validators;

use Illuminate\Validation\Validator;
use Carbon\Carbon;
//use Illuminate\Routing\Router;
use Illuminate\Filesystem\Filesystem;

//use App\Route;

class CustomRules extends Validator
{
    private $router;
    private $files;
    private $config;

    //public function __construct(Router $router, Filesystem $files, Repository $config)
    //{
        //$this->router = $router;
      //  $this->files = $files;
        //$this->config = $config;
    //}
    


    public function validateDobValidValidation($attribute, $value, $parameters)
    {
        if (!array_key_exists('dob', $this->data))
        {
            //throw new \Exception("no input value: dob");
            return false;
        }

        $e = explode('-', $this->data['dob']);

        if (count($e) !== 3 || (int)$e[0] == 0 || (int)$e[2] == 0){
            return false;
        }

        $e[1] = (strlen($e[1]) === 1) ? '0'.$e[1] : $e[1];
        $e[2] = (strlen($e[2]) === 1) ? '0'.$e[2] : $e[2];
        $new_date = $e[0].'-'.$e[1].'-'.$e[2];


        $d = Carbon::parse($this->data['dob']);

        return ($new_date === $d->toDateString());
    }

    public function validateDobMinValidation($attribute, $value, $parameters)
    {
        $minAge = ( ! empty($parameters)) ? (int) $parameters[0] : 18;
        $e = explode('-', $this->data['dob']);
        if (count($e) !== 3 || (int)$e[0] == 0 || (int)$e[2] == 0){
            return false;
        }
        $y = (int) $e[0];
        $m = (int) $e[1];
        $d = (int) $e[2];
        $age = Carbon::createFromDate($y, $m, $d)->age;
        return ($age < $minAge) ? false : true;
    }

    public function validateCountryValidation($attribute, $value, $parameters)
    {
        return ($this->data['country'] == '0') ? false : true;
    }


    public function validateReserved($attribute, $username)
    {
        $username = trim(strtolower($username));

        if ($this->isReservedUsername($username)) {
            return false;
        }

        if ($this->matchesRoute($username)) {
            return false;
        }

        if ($this->matchesPublicFileOrDirectory($username)) {
            return false;
        }

        return true;
    }

    private function isReservedUsername($username)
    {
        return in_array($username, config('auth.reserved_usernames'));
    }

    private function matchesRoute($username)
    {
        $router = \Route::getRoutes();

        foreach ($router->getRoutes() as $route) {
            if (strtolower($route->uri) === $username) {
                return true;
            }
        }

        return false;
    }

    private function matchesPublicFileOrDirectory($username)
    {
        foreach (\File::glob(public_path().'/*') as $path) {
            if (strtolower(basename($path)) === $username) {
                return true;
            }
        }

        return false;
    }
}
