<?php

namespace App\Traits;

//use Auth;
//use Illuminate\Http\Request;

use App\Classes\Utils;


trait Filters{

	private static $perPage = 6;

	private static $filters_map = [

		'user' => [
			'country' => [
				'values' => 'jsCountry',
				'value' => [],
				'type' => 'select'
			],
			'gender' => [
				'values' => ['female', 'male', 'transgender'],
				'value' => [],
				'type' => 'switch'

			]
		],

		'video' => [
			'genre' => [
				'values' => 'jsGenre',
				'value' => [],
				'type' => 'select'
			]
		],

		'album' => []
	];

	private static $isPivot = ['video'];


	private static function response($filters, $className, $perPage = null, $user = null)
	{
		$key = ($className === 'friend') ? 'user' : $className;

		return [
            'items' => self::applyFilters($filters, $className, $perPage, $user),
            'filters' => self::$filters_map[$key],
            'type' => ($className === 'user') ? 'members' : $className.'s',
            'url' => self::getURL($filters, $className),
            'columns' => [
                'left' => 1,
                'middle' => 10,
                'right' => 1
            ]
        ];
	}

	private static function applyFilters($filters, $className, $perPage = null, $user = null)
	{
		$class = 'App\\'.ucfirst($className);

		$builder = $class::query();

		$parameters = $filters->route()->parameters();

		$isPivot = self::isPivot($className);

		if ($className === 'friend'){

			$builder = $user->friends();

			unset($parameters['username']);

		}


		foreach ($parameters as $key => $value) {

			if ($value === 'all') continue;
			
			$values = explode(',', str_replace('-', ' ', $value));

			$loop = 0;

			if ($isPivot){

				$_class = 'App\\'.ucfirst($key);
				$_id = $_class::where('name', $parameters[$key])->select('id')->firstOrFail()->toArray();
				$_id = $_id['id'];

				$pivotClass = 'App\\'.ucfirst($key).ucfirst($className);

				$relation = $key.'s';

				$builder->with([$relation => function($query) use($_id, $relation){

					$query->where($relation.'.id', $_id);

				}]);

				self::appendFiltersMap($className, $key, $value);

				continue;
			}

			$in = array_map(function($param) use($className, $key){

				$trim = ($key === 'gender') ? $param[0] : $param;

				self::appendFiltersMap($className, $key, $param);

				return $trim;

			}, $values);

			//var_dump($in);die();

			$builder->whereIn($key, $in);

			//var_dump($values);die();

			/*
			$builder->Where(function($query) use($key, $values, $className){

				$_val = ($key === 'gender') ? $values[0][0] : $values[0];

				$query->where($key, $_val);

				self::appendFiltersMap($className, $key, $values[0]);

				for ($i = 1; $i < count($values); $i++){

					$_val = ($key === 'gender') ? $values[$i][0] : $values[$i];

					$query->orWhere($key, $_val);

					self::appendFiltersMap($className, $key, $values[$i]);

				}

			});
			*/

		}

		if ($className === 'video'){

			$builder->select(['id', 'uid', 'title', 'slug']);
		}

		self::getFiltersMapDatas($className);

		$pp = (is_null($perPage)) ? self::$perPage : $perPage;


		return $builder->paginate($pp);

	}

	private static function appendFiltersMap($className, $key, $value)
	{
		$_key = ($className === 'friend') ? 'user' : $className;

		array_push(self::$filters_map[$_key][$key]['value'], $value);
	}

	private static function getFiltersMapDatas($className)
	{
		if (in_array($className, ['user', 'friend'])) $key = 'country';
		if ($className === 'video') $key = 'genre';

		$_key = ($className === 'friend') ? 'user' : $className;

		$func = self::$filters_map[$_key][$key]['values'];

		if (is_null($func)) return;

		self::$filters_map[$_key][$key]['values'] = Utils::$func($available = true);

	}

	private  static function isPivot($className)
	{
		return in_array($className, self::$isPivot);
	}

	private  static function getURL($filters, $className)
	{
		$path = $filters->path();
		
		$explode = explode('/', $path);
		
		$url = '/'.$explode[0];
		
		if ($className === 'friend') $url .= '/'.$explode[1]; 
		
		return $url;
	}



}