<?php

function removeClassSlashes($class)
{
    return strtolower(str_replace('App\\', '', $class));
}

function name($id, $uid)
{
    $object = new \stdClass();
    $object->id = $id;
    $object->uid = $uid;
    return  \App\Classes\Medias::name($object);
}

function gender( $g )
{
	$return = ['f' => 'Female', 'm' => 'Male', 't' => 'transgender'];
	return (array_key_exists($g, $return)) ? $return[$g] : $g;
}

function truncate($string, $length = 80, $etc = '...', $break_words = false, $middle = false, $more = false)
{
    if ($length == 0) {
        return '';
    }

    if ($more){
        $more = ' <a href="'.url()->current().'/'.$more.'" style="color: #3097D1;">[more]</a>';
    } else $more = '';

    if (isset($string[$length])) {
        $length -= min($length, strlen($etc));
        if (!$break_words && !$middle) {
            $string = preg_replace('/\s+?(\S+)?$/', '', substr($string, 0, $length + 1));
        }
        if (!$middle) {
            return substr($string, 0, $length) . ' '.$etc.$more;
        }

        return substr($string, 0, $length / 2) . ' '.$etc . substr($string, - $length / 2).$more;
    }

    return $string;
}

function underscore($string)
{
    return str_replace(' ', '_', $string);
}

function _underscore($string, $cap = true)
{
    return ucwords(str_replace('_', ' ', $string));
}

function question($var, $json = false)
{
    if (is_null($var)){
        return '<i class="fas fa-question-circle"></i>';
    }
    if (!$json) return ucwords($var);
    else {
        $r = '';
        $array = (is_array($var)) ? $var : json_decode($var);
        foreach ($array as $v){
            $r .= ucwords($v);
            $r .= ($v != end($array)) ? ' - ' : '';
        }
        return $r;
    }
}

/*
function avatar($object)
{
    return  \App\Classes\Utils::avatar($object);
}
*/



function avatar_extras($user)
{
    if (!property_exists($user, 'verification') || !property_exists($user, 'model') || !property_exists($user, 'seller') || !property_exists($user, 'producer'))
    {
        return;
    }

    $badges = '<ul class="small">';
    $badges .= ($user->verification) ? '<li style="width:100%;background-color:orange;" class="mb-1 py-1"><i class="fas fa-check"></i> Verified member</li>' : '';
    $badges .= ($user->producer) ? '<li><i class="fas fa-check"></i> Producer</li>' : '';
    $badges .= ($user->seller) ? '<li><i class="fas fa-check"></i> Seller</li>' : '';
    $badges .= ($user->model) ? '<li style="width:100%;background-color:orange;" class="py-1"><i class="fas fa-female fa-lg"></i>  Model</li>' : '';
    $badges .= '</ul>';
    return $badges;
}