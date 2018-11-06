<?php 

namespace App;

class GoPublic extends \Illuminate\Foundation\Application
{
 /**
 * Get the path to the public / web directory.
 *
 * @return string
 */
 public function publicPath()
 {
 	//return $this->basePath.DIRECTORY_SEPARATOR.'public';
 	
 	return dirname( $this->basePath.DIRECTORY_SEPARATOR , 2 )._APP_PUBLIC.'/'._APP_PUBLIC_FOLDER;
 }

}