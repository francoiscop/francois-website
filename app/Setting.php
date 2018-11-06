<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
    	'name',
    	'value',
    	'type',
    	'bool',
    	'int',
    	'json'
    ];

    protected $dates = ['deleted_at'];

    public static function format($settings)
    {
        $formatted = [];
        
        foreach ($settings as $v){

            $type = (is_null($v['type']) || $v['type'] == '') ? 'base' : $v['type'];

            if ($v['int'] == '1') $v['value'] = (is_null($v['value'])) ? false : (int)$v['value'];
            if ($v['bool'] == '1') $v['value'] = (is_null($v['value'])) ? false : (bool)$v['value'];
            if ($v['json'] == '1') $v['value'] = (is_null($v['value'])) ? false : json_decode($v['value'], true);

            $formatted[$type][$v['name']] = $v['value'];

        }

        return $formatted;
    }


}
