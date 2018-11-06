<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class ClassExist implements Rule
{
    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     */
    public function passes($attribute, $value)
    {
        $class = 'App\\'.ucfirst(camel_case($value));
        var_dump($class);die();
        return class_exists($class);
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return 'The Class doent exist';
    }
}
