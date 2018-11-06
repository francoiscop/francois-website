<?php

namespace App\Traits;


trait AllowNewTrait{

	private static $allowNewNot = [
		
		//'tags',
	
	];


    private static function isAllowNew($key)
    {
        return !in_array($key, self::$allowNewNot);
    }

}