<?php
namespace App\Classes;

use Carbon\Carbon;
use App\Settings;
use DB;
use Auth;
use Illuminate\Support\Facades\Storage;

use App\User;

class Utils
{
	private $max_age = 90;

  public static function enum($table, $column)
  {
      $enum = DB::select( DB::raw("SELECT COLUMN_TYPE FROM information_schema.`COLUMNS` WHERE TABLE_NAME = '$table' AND COLUMN_NAME = '$column' "));
      if (count($enum) === 0) return [];

      //$string = str_replace(['enum(', ')'], '', $enum[0]->COLUMN_TYPE);
      $resp = [];

      if (preg_match('/^enum\((.*)\)$/', $enum[0]->COLUMN_TYPE, $matches)){
          foreach( explode(',', $matches[1]) as $value ){
            array_push($resp, trim( $value, "'" ));
          }
      }
     return $resp;
  }

	public static function getColumnsTable($table)
	{
      $columns = [];
      $table_info_columns = DB::select( DB::raw("SHOW COLUMNS FROM $table"));
      
      //echo '<pre>';print_r($table_info_columns);

      foreach($table_info_columns as $column){
        
        $name = $column->Field;
        $type = $column->Type;
        $enum = null;

        if (preg_match('/^int/', $column->Type, $matches))
        {
          $type = 'int';
        }
        if (preg_match('/^varchar/', $column->Type, $matches))
        {
          $type = 'string';
        }
        if (preg_match('/^tinyint\(1\)/', $column->Type, $matches))
        {
          $type = 'bool';
        } 

        if (preg_match('/^enum\((.*)\)$/', $column->Type, $matches))
        {
          $enum = [];
          foreach( explode(',', $matches[1]) as $value ){
            $v = trim( $value, "'" );
            $enum[$v] = $v;
          }
        }

        $columns[$name] = ['type' => $type, 'enum' => $enum]; 
      }
           
      return $columns;
  }

  public static function getColumnsArray($table)
  {
      $columns = [];
      $table_info_columns = DB::select( DB::raw("SHOW COLUMNS FROM $table"));
      
      foreach($table_info_columns as $column){
        
        array_push($columns, $column->Field);
        
      }
           
      return $columns;
  }

  public static function producedAt($date)
  {
      $temp = explode('-', $date);

      if (count($temp) === 1) return $date . '-01-01';

      $month = $temp[1];

      if (strlen($month) === 1) $month = '0'.$month;

      return $temp[0] . '-' . $month . '-01';
  }

  public static function storeId($name)
  {
      $store = \App\Store::where('name', $name)->first();

      if (is_null($store)) return null;

      return $store->id;
  }


  public static function jsYear($max = 100)
  {
    $year = [];

    for($i = date('Y'); $i >= date('Y', strtotime("-$max years")); $i--){
      array_push($year, (string)$i);
    }

    return $year;
  }

  public static function jsDateYearMonth()
  {
    $options = ['year' => [], 'month' => []];

    //year
    for($i = date('Y'); $i >= date('Y', strtotime('-20 years')); $i--){
      array_push($options['year'], (string)$i);
    }
    //month
    for($i = 1; $i <= 12; $i++){
      $dt = Carbon::createFromFormat('!m', $i);
      array_push($options['month'], ['label' => $dt->format('F'), 'value' => $i]);
    }

    return $options;
  }

 

  public static function jsDob()
  {
    $options = ['year' => [], 'month' => [], 'day' => []];

    //year
    for($i = date('Y'); $i >= date('Y', strtotime('-90 years')); $i--){
      array_push($options['year'], (string)$i);
    }
    //month
    for($i = 1; $i <= 12; $i++){
      $dt = Carbon::createFromFormat('!m', $i);
      array_push($options['month'], ['label' => $dt->format('F'), 'value' => $i]);
    }
    //day
    for($i = 1; $i <= 31; $i++){  
      array_push($options['day'], (string)$i);
    }

    return $options;
  }

  public static function jsCountry($available = false)
  {
    if (!$available){

      include(app_path() . '/Libs/country_list.php');
      return $country_list;

    }

    return User::all()->pluck('country')->unique();

  }

  public static function jsGenre($available = false)
  {
   
    if (!$available){

      return \App\Genre::get()->pluck('name');

    }

    return \App\GenreVideo::with('genres')->get()->pluck('genres.name')->unique()->reject(function ($name) {
      return empty($name);
    });

  }

  public static function jsStore($available = false)
  {
   
    if (!$available){

      return \App\Store::get()->pluck('name');

    }

    return \App\Video::with('store')->get()->pluck('stores.name')->unique()->reject(function ($name) {
      return empty($name);
    });

  }

	public static function dob( $opt = false, $dob = false )
	{
		$options = ['year' => [], 'month' => [], 'day' => []];

		//year
		if (!$opt) $options['year'][0] = 'Year';
		for($i = date('Y'); $i >= date('Y', strtotime('-90 years')); $i--){
			if (!$opt){
				array_push($options['year'], $i);
			} else {
				$selected = ($dob && $dob[0] == $i) ? 'selected' : '';
				if ($selected === '' && $j === 0){
					array_push($options['year'], '<option>Year</option>');
				} else {
					array_push($options['year'], '<option value="'.$i.'" $selected>'.$i.'</option>');
				}
			}
		}
		//month
		if (!$opt) $options['month'][0] = 'Month';
		for($i = 1; $i <= 12; $i++){
			$dt = Carbon::createFromFormat('!m', $i);
			if (!$opt){
				array_push($options['month'], $dt->format('F'));
			} else {
				$selected = ($dob && $dob[1] == $i) ? 'selected' : '';
				array_push($options['month'], '<option value="'.$i.'" $selected>'.$dt->format('F').'</option>');
			}
		}
		//day
		if (!$opt) $options['day'][0] = 'Day';
		for($i = 1; $i <= 31; $i++){	
			if (!$opt){
				array_push($options['day'], $i);
			} else {
				$selected = ($dob && $dob[2] == $i) ? 'selected' : '';
				array_push($options['day'], '<option value="'.$i.'" $selected>'.$i.'</option>');
			}
		}

		return $options;
	}

	public static function country( $opt = false, $country = false )
	{
		include(app_path() . '/Libs/country_list.php');

		$options = ['Country'];
		foreach ($country_list as $c){
			if (!$opt){
				$options[$c] = $c;
			} else {
				$selected = ($country && $country == $c) ? 'selected' : '';
				array_push($options, '<option value="'.$c.'" $selected>'.$c.'</option>');
			}
		}
		return $options;
	}

	public static function uid( $user = false )
    {
        if ($user)
        {
            $user = trim(basename(stripslashes($user)), ".\x00..\x20");
            $user = md5($user);
            $user = preg_replace('/[a-z]/','',$user);
            $user = substr($user, 0, 10);

        } else {
        	$user = '';
        }
     
        return uniqid().$user;
    }

  public static function sec2min($sec)
  {
      $minutes = floor(($sec / 60) % 60) . ' minutes';
    
      $seconds = $sec % 60;

      if ($seconds > 0) $minutes .= ' and ' . $seconds . ' seconds';

      return $minutes;
  }


    //************************************************************************************************ MOVED TO ENCODE/MEDIAINFO

    /**
     * Extracts seconds from HH:MM:SS string
     * @param  string HH:MM:SS formatted value
     * @return string
     */
    public static function timestampToSeconds_xxxx($string)
    {
        // Extract hour, minute, and seconds
        $time = explode(":", $string);

        // Convert to seconds (round up to nearest second)
        $secs = ($time[0] * 3600) + ($time[1] * 60) + (ceil($time[2]));
        return $secs;
    }

    /*
    public static function cleanTitle($string)
    {
        $string = self::removeParenthesis($string);
        $string = preg_replace('/[^a-z\d ]/i', '', $string);
        $string = preg_replace('/\s\s+/', ' ', $string);
        $string = trim($string);
        return strtolower($string);
    }
    */

    public static function extractYear($string)
    {
        $string = self::parenthesis($string, 'get');
        return ((int)$string === 0) ? null : (int)$string;
    }

    public static function extractTitle($string)
    {
        $string = self::parenthesis($string, 'remove');
        $string = preg_replace('/[^a-z\d ]/i', '', $string);
        $string = preg_replace('/\s\s+/', ' ', $string);
        $string = trim($string);
        return strtolower($string);
    }

    public static function parenthesis($string, $action = 'remove')
    {
        $remove = ($action === 'remove');
        $get = ($action === 'get');

        if (!$get && !$remove) return;

        $regex = ($get) ? '~\((.*?)\)~' : '~(.*?)\s\(~';
        
        preg_match_all($regex, $string, $matches);
        
        if (count($matches[1]) === 0){

          return trim($string);

        }
        
        return trim($matches[1][0]);
    }

    /**
     * GET DIMENSION OF PICTURE
     * call by Gallery Class
     * @param  $file_path of img (as $file)
     * @return []
     */
    /*
    public static function get_dimension($file)
    {
    	if (!file_exists($file)) return false;

    	list($width, $height, $type, $attr) = getimagesize($file);
    		
    	if (($width/$height)>=1){
    		if ($width > 900){
    			$height = round($height*(900/$width));
    			$width = "900";
    		}
    	} else {
    		if ($height > 900){
    			$width = round($width*(900/$height));
    			$height = "900";
    		}
    	}

    	return ["width" => $width, "height" => $height];
    }
    */

}
