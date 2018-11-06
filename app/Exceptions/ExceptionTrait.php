<?php

namespace App\Exceptions;

trait ExceptionTrait{

	public function apiException($request, $e)
	{
		var_dump($request->expectsJson());
		var_dump($request->ajax());
		echo '<pre>';
		//print_r($e);
		var_dump($e->getMessage());
		var_dump(get_class($e));
		var_dump(class_parents($e));
		var_dump(get_parent_class($e));
		die();
		var_dump( (new \ReflectionClass($e))->getParentClass()->getName() );
		die();
		//var_dump($e);
	}

}