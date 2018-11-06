<?php
namespace App\Traits;

use Illuminate\Support\Facades\Storage;
use Image;
use DB;
use App\Traits\AllowNewTrait;


trait EditTrait{

  use AllowNewTrait;

	private static $init = [
		
		'table' => null,
		'required' => [],
		'keys_to_remove' => [],
		'keys_to_add' => []
	
	];

    private static $first_names = [
        'directors', 'dop'
    ];

    private static $extraAttributes = [

        'tokens' => [
            //'type' => 'int',
            'icon' => 'label',
            'required' => true,
            'rules' => ['integer'],
            'helper' => 'in Token',
            'max' => 99,
            'min' => 0
        ],

        'discount' => [
            //'type' => 'int',
            'icon' => 'label',
            'rules' => ['integer'],
            'helper' => '%',
            'max' => 100,
            'min' => 0
        ],
    ];




	private static function getEdit($object)
	{
		$edit = [];

		foreach (self::columns() as $key => $value){
            
            if (!in_array($key, self::$init['keys_to_remove'])){
                
                $edit[$key] = $value;

                $edit[$key]['value'] = ($value['type'] === 'bool') ? (bool) $object->$key : $object->$key; 
            
            }

            if (in_array($key, self::$init['required'])) $edit[$key]['required'] = true;

            if (array_key_exists($key, self::$extraAttributes) && array_key_exists($key, $edit)){

                $edit[$key] = $edit[$key] + self::$extraAttributes[$key];
            }
        }

        return $edit;

	}

	private static function columns()
	{
		$columns = [];

		$table = self::$init['table'];

		$schemas = DB::select(DB::raw("SHOW COLUMNS FROM $table"));

		foreach($schemas as $column){

			$name = $column->Field;
        	$type = $column->Type;
        	$enum = null;

        	if (preg_match('/^int/', $column->Type, $matches)) $type = 'int';

        	if (preg_match('/^varchar/', $column->Type, $matches)) $type = 'string';

        	if (preg_match('/^tinyint\(1\)/', $column->Type, $matches)) $type = 'bool';

        	if (preg_match('/^enum\((.*)\)$/', $column->Type, $matches)){

        		$enum = [];

        		$type = 'enum';
          		
          		foreach( explode(',', $matches[1]) as $value ){

          			$v = trim( $value, "'" );
          			//$enum[$v] = $v;
          			array_push($enum, $v);
          		}
        	}

        	$columns[$name] = ['type' => $type, 'enum' => $enum]; 
		
		}

		return $columns;
	}

	private static function updateProcess($object, $request)
	{

        $update = [];

        $remove = ['_token'];

        $class = get_class($object);

        foreach ($request->all() as $key => $value){

          if (method_exists($class, $key) || method_exists($class, $key.'s')){

              self::updateProcessPivot($object, $class, $key, $value);

              continue;

          }

        	if (in_array($key, $remove) || is_null($value) || $value === '') continue;

        	if (in_array($value, ['true', 'false'])){

        		$update[$key] = filter_var($value, FILTER_VALIDATE_BOOLEAN);

        		continue;
        	}

        	$update[$key] = (is_array($value)) ? json_encode($value) : strtolower($value);
        }

        return $object->update($update);
	}

    private static function updateProcessPivot($object, $class, $key, $value)
    {
        self::syncRelationshipEdit($object, $value, $key);
    }

    //protected static function syncRelationship($video, $request, $relation, $isNameArray = false)
    protected static function syncRelationshipEdit($object, $values, $relation)
    {
        $isNameArray = self::isNameArray($relation);

        if (is_array($values)){

            $classRelation = '\App\\' . ucfirst(trim($relation, 's'));

            $to_sync = [];

            foreach ($values as $name) {

                if (!$isNameArray){

                    $name = str_replace(['"','-'], ['', ' '], $name);

                    $create = ['name' => $name];

                } else {

                    $names = explode('-', $name);

                    if (count($names) === 1) $names = explode(' ', $name);

                    if (count($names) < 2) $names = [null, $names[0]];

                    if (count($names) === 3) $names = [$names[0].' '.$names[1], $names[2]];

                    $create = [
                        'first_name' => $names[0],
                        'last_name' => $names[1]
                    ];
                }   

                $model = $classRelation::firstOrCreate($create);

                array_push($to_sync, $model->id);
            }

            $relationship = trim($relation, 's') . 's';

            $object->$relationship()->sync($to_sync);
        }

    }

    protected static function isNameArray($relation)
    {
        if (in_array($relation, self::$first_names)) return true;

        return false;
    }


    private static function appendEditTags($edit, $params)
    {
        foreach ($params as $key => $values) {
          
          $edit[$key] = [
            'type' => 'tag',
            'allowNew' => self::isAllowNew($key),
            'isArray' => true,
            'url' => 'search/'.rtrim($key, 's'),
            //'url' => $key,
            /*
            'value' => $values->unique()->flatten(1)->reject(function($value, $key){
                return $key == 'pivot';
            })->toArray()
            */
            //'value' => $values->unique()->toArray()
            'value' => $values->unique()->map(function($o){ return $o->name; })
          ];
        }
      
        return $edit;
    }


	private static function getImages($dir, $url, $filter = null)
	{
        $g = glob(storage_path($dir).'*');

        $images = [];

        foreach ($g as $k => $file){
            
            if (file_exists($file)){
                
                list($width, $height, $type, $attr) = getimagesize($file);
                $ex = explode('/', $file);
                $name = end($ex);

                $push = true;

                if (!is_null($filter) && $filter !== ''){

                	$filter = preg_replace('/[0-9]+/', '', $filter);
                	$filter = str_replace('-', '', $filter);

                	$push = (strpos($name, $filter) !== false) ? true : false;
                }

                if ($push){

                	$images[$k]['src'] = $url.$name;
                    $images[$k]['dim'] = $width.'x'.$height;
                }
            } 
        }

        return $images;
	}

	private static function crop($file, $cropped_value, $file_name, $dir, $width = 500, $height = 281)
    {
        $cp_v = explode("," ,$cropped_value);
        
        $img = Image::make($file->getRealPath());
        
        $img->crop($cp_v[0],$cp_v[1],$cp_v[2],$cp_v[3]);

        if (!is_null($width) && !is_null($height)){
            
            $img->fit($width, $height, function ($constraint) {
                
                $constraint->aspectRatio();
            
            });
        }
            
        $img->save( storage_path($dir).$file_name );
    }


}