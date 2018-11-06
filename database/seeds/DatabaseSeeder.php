<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // $this->call(UsersTableSeeder::class);

        /*
        |
        | ADMINS
        |
        */
        DB::table('admins')->insert([
            'username' => 'khalil',
            'email' => 'francoiscoppy@gmail.com',
            'password' => bcrypt('5mgcgmvv'),
        ]);

        /*
        |
        | SETTINGS
        |
        */
        DB::table('settings')->insert(self::getCreate($this->settings));

        /*
        |
        | MENUS
        |
        */
        DB::table('menus')->insert(self::getCreate($this->menus));

        /*
        |
        | STORES
        |
        */
        DB::table('stores')->insert(self::getCreate($this->stores));

        /*
        |
        | VIDEOS
        |
        */
        DB::table('videos')->insert(self::getCreate($this->videos));

        /*
        |
        | GENRES
        |
        */
        DB::table('genres')->insert(self::getCreate($this->genres));

        /*
        |
        | DIRECTORS
        |
        */
        DB::table('directors')->insert(self::getCreate($this->directors));

        /*
        |
        | PRODUCTIONS
        |
        */
        DB::table('productions')->insert(self::getCreate($this->productions));

        /*
        |
        | DOPS
        |
        */
        DB::table('dops')->insert(self::getCreate($this->dops));

        /*
        |
        | VIDEO_GENRE
        |
        */
        DB::table('genre_video')->insert(self::getCreate($this->genre_video));

        /*
        |
        | VIDEO_DIRECTOR
        |
        */
        DB::table('director_video')->insert(self::getCreate($this->director_video));

        /*
        |
        | VIDEO_DOP
        |
        */
        DB::table('dop_video')->insert(self::getCreate($this->dop_video));

        /*
        |
        | VIDEO_PRODUCTION
        |
        */
        DB::table('production_video')->insert(self::getCreate($this->production_video));
        
        /*
        |
        | PANELS
        |
        */
        //DB::table('panels')->insert(self::getCreate($this->panels));

    }

    private static function getCreate($array)
    {
        return collect($array)->map(function($value){
            
            return collect($value)->forget('id');
        
        })->toArray();
    }


    private $directors = array(
  array('id' => '1','slug' => 'samuel-martin','first_name' => 'samuel','last_name' => 'martin','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-20 21:31:40','updated_at' => '2018-10-20 21:31:40','deleted_at' => NULL),
  array('id' => '2','slug' => 'ali-j-walker','first_name' => 'ali j','last_name' => 'walker','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-24 18:33:42','updated_at' => '2018-10-24 18:33:42','deleted_at' => NULL),
  array('id' => '3','slug' => 'mohamed-al-enezy','first_name' => 'mohamed','last_name' => 'al_enezy','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-24 18:35:18','updated_at' => '2018-10-24 18:35:18','deleted_at' => NULL),
  array('id' => '4','slug' => 'mohammed-alhayussain','first_name' => 'mohammed','last_name' => 'alhayussain','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-24 18:44:14','updated_at' => '2018-10-24 18:44:14','deleted_at' => NULL),
  array('id' => '5','slug' => 'yurena-de-dios','first_name' => 'yurena de','last_name' => 'dios','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-26 10:11:13','updated_at' => '2018-10-26 10:11:13','deleted_at' => NULL),
  array('id' => '6','slug' => 'jim-de-whalley','first_name' => 'jim de','last_name' => 'whalley','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-26 10:45:51','updated_at' => '2018-10-26 10:45:51','deleted_at' => NULL),
  array('id' => '7','slug' => 'francois-coppey','first_name' => 'francois','last_name' => 'coppey','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-26 10:45:51','updated_at' => '2018-10-26 10:45:51','deleted_at' => NULL),
  array('id' => '8','slug' => 'andrew-saunders','first_name' => 'andrew','last_name' => 'saunders','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-26 12:10:11','updated_at' => '2018-10-26 12:10:11','deleted_at' => NULL),
  array('id' => '9','slug' => 'shekhar-bassi','first_name' => 'shekhar','last_name' => 'bassi','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-26 12:32:10','updated_at' => '2018-10-26 12:32:10','deleted_at' => NULL),
  array('id' => '10','slug' => 'neil-aling','first_name' => 'neil','last_name' => 'aling','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-30 09:18:52','updated_at' => '2018-10-30 09:18:52','deleted_at' => NULL),
  array('id' => '11','slug' => 'mohamed-fadel','first_name' => 'mohamed','last_name' => 'fadel','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-30 12:53:06','updated_at' => '2018-10-30 12:53:06','deleted_at' => NULL),
  array('id' => '12','slug' => 'alex-sufit','first_name' => 'alex','last_name' => 'sufit','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-30 13:34:31','updated_at' => '2018-10-30 13:34:31','deleted_at' => NULL),
  array('id' => '13','slug' => 'paul-rupesh','first_name' => 'paul','last_name' => 'rupesh','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-30 13:40:18','updated_at' => '2018-10-30 13:40:18','deleted_at' => NULL),
  array('id' => '14','slug' => 'arthur-girod','first_name' => 'arthur','last_name' => 'girod','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-30 13:41:51','updated_at' => '2018-10-30 13:41:51','deleted_at' => NULL),
  array('id' => '15','slug' => 'amy-mathieson','first_name' => 'amy','last_name' => 'mathieson','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-30 13:43:55','updated_at' => '2018-10-30 13:43:55','deleted_at' => NULL),
  array('id' => '16','slug' => 'dimitra-tsolka','first_name' => 'dimitra','last_name' => 'tsolka','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-30 13:45:51','updated_at' => '2018-10-30 13:45:51','deleted_at' => NULL),
  array('id' => '17','slug' => 'richar-driscoll','first_name' => 'richar','last_name' => 'driscoll','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-30 13:47:11','updated_at' => '2018-10-30 13:47:11','deleted_at' => NULL),
  array('id' => '18','slug' => 'saer-mussa','first_name' => 'saer','last_name' => 'mussa','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-30 13:49:04','updated_at' => '2018-10-30 13:49:04','deleted_at' => NULL),
  array('id' => '19','slug' => 'ghassan-abdallah','first_name' => 'ghassan','last_name' => 'abdallah','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-30 13:50:59','updated_at' => '2018-10-30 13:50:59','deleted_at' => NULL),
  array('id' => '20','slug' => 'jean-ducasse','first_name' => 'jean','last_name' => 'ducasse','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-30 13:52:44','updated_at' => '2018-10-30 13:52:44','deleted_at' => NULL),
  array('id' => '21','slug' => 'pascal-vuillemot','first_name' => 'pascal','last_name' => 'vuillemot','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-31 15:38:45','updated_at' => '2018-10-31 15:38:45','deleted_at' => NULL),
  array('id' => '22','slug' => 'hyo-jung-kim','first_name' => 'hyo jung','last_name' => 'kim','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-31 15:44:14','updated_at' => '2018-10-31 15:44:14','deleted_at' => NULL),
  array('id' => '23','slug' => 'leila-kanaan','first_name' => 'leila','last_name' => 'kanaan','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-31 15:46:40','updated_at' => '2018-10-31 15:46:40','deleted_at' => NULL),
  array('id' => '24','slug' => 'tania-moreira-david','first_name' => 'tania moreira','last_name' => 'david','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-31 15:49:49','updated_at' => '2018-10-31 15:49:49','deleted_at' => NULL),
  array('id' => '25','slug' => 'keith-dando','first_name' => 'keith','last_name' => 'dando','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-31 15:52:52','updated_at' => '2018-10-31 15:52:52','deleted_at' => NULL),
  array('id' => '26','slug' => 'howard-johnson','first_name' => 'howard','last_name' => 'johnson','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-31 15:55:11','updated_at' => '2018-10-31 15:55:11','deleted_at' => NULL),
  array('id' => '27','slug' => 'joe-eshwar','first_name' => 'joe','last_name' => 'eshwar','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-31 15:56:53','updated_at' => '2018-10-31 15:56:53','deleted_at' => NULL),
  array('id' => '28','slug' => 'alexandra-paramettri','first_name' => 'alexandra','last_name' => 'paramettri','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-31 16:00:25','updated_at' => '2018-10-31 16:00:25','deleted_at' => NULL),
  array('id' => '29','slug' => 'ioakim-mylonas','first_name' => 'ioakim','last_name' => 'mylonas','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-31 16:01:12','updated_at' => '2018-10-31 16:01:12','deleted_at' => NULL),
  array('id' => '30','slug' => 'david-mingay','first_name' => 'david','last_name' => 'mingay','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-31 16:05:14','updated_at' => '2018-10-31 16:05:14','deleted_at' => NULL),
  array('id' => '31','slug' => 'christophe-cousin','first_name' => 'christophe','last_name' => 'cousin','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-11-01 13:36:17','updated_at' => '2018-11-01 13:36:17','deleted_at' => NULL)
);

    private $director_video = array(
  array('id' => '1','director_id' => '5','video_id' => '3','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '2','director_id' => '2','video_id' => '11','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '3','director_id' => '2','video_id' => '10','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '4','director_id' => '2','video_id' => '8','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '5','director_id' => '6','video_id' => '4','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '6','director_id' => '7','video_id' => '4','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '7','director_id' => '2','video_id' => '6','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '8','director_id' => '4','video_id' => '9','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '9','director_id' => '3','video_id' => '7','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '10','director_id' => '1','video_id' => '1','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '11','director_id' => '1','video_id' => '2','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '12','director_id' => '1','video_id' => '5','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '13','director_id' => '8','video_id' => '12','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '14','director_id' => '9','video_id' => '13','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '15','director_id' => '10','video_id' => '14','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '16','director_id' => '11','video_id' => '15','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '17','director_id' => '12','video_id' => '16','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '18','director_id' => '2','video_id' => '17','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '19','director_id' => '3','video_id' => '18','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '20','director_id' => '13','video_id' => '19','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '21','director_id' => '14','video_id' => '20','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '22','director_id' => '15','video_id' => '21','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '23','director_id' => '16','video_id' => '22','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '24','director_id' => '17','video_id' => '23','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '25','director_id' => '18','video_id' => '24','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '26','director_id' => '19','video_id' => '25','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '27','director_id' => '20','video_id' => '26','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '28','director_id' => '21','video_id' => '27','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '30','director_id' => '22','video_id' => '29','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '31','director_id' => '23','video_id' => '30','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '32','director_id' => '23','video_id' => '31','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '33','director_id' => '24','video_id' => '32','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '34','director_id' => '9','video_id' => '33','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '35','director_id' => '25','video_id' => '34','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '36','director_id' => '26','video_id' => '35','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '37','director_id' => '27','video_id' => '36','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '38','director_id' => '2','video_id' => '37','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '39','director_id' => '2','video_id' => '38','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '40','director_id' => '28','video_id' => '39','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '41','director_id' => '29','video_id' => '40','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '42','director_id' => '28','video_id' => '41','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '43','director_id' => '7','video_id' => '42','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '44','director_id' => '30','video_id' => '43','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '45','director_id' => '5','video_id' => '44','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '46','director_id' => '7','video_id' => '45','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '47','director_id' => '4','video_id' => '46','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '48','director_id' => '31','video_id' => '47','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '49','director_id' => '6','video_id' => '48','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '50','director_id' => '7','video_id' => '48','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL)
);

    private $dops = array(
  array('id' => '1','slug' => 'francois-coppey','first_name' => 'francois','last_name' => 'coppey','country' => NULL,'year_from' => NULL,'year_to' => NULL,'description' => NULL,'created_at' => '2018-10-20 21:31:41','updated_at' => '2018-10-20 21:31:41','deleted_at' => NULL)
);

    private $dop_video = array(
  array('id' => '1','dop_id' => '1','video_id' => '1','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '2','dop_id' => '1','video_id' => '2','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '3','dop_id' => '1','video_id' => '3','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '4','dop_id' => '1','video_id' => '4','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '5','dop_id' => '1','video_id' => '5','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '6','dop_id' => '1','video_id' => '6','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '7','dop_id' => '1','video_id' => '7','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '8','dop_id' => '1','video_id' => '8','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '9','dop_id' => '1','video_id' => '9','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '10','dop_id' => '1','video_id' => '10','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '11','dop_id' => '1','video_id' => '11','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '12','dop_id' => '1','video_id' => '12','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '13','dop_id' => '1','video_id' => '13','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '14','dop_id' => '1','video_id' => '14','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '15','dop_id' => '1','video_id' => '15','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '16','dop_id' => '1','video_id' => '16','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '17','dop_id' => '1','video_id' => '17','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '18','dop_id' => '1','video_id' => '18','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '19','dop_id' => '1','video_id' => '19','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '20','dop_id' => '1','video_id' => '20','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '21','dop_id' => '1','video_id' => '21','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '22','dop_id' => '1','video_id' => '22','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '23','dop_id' => '1','video_id' => '23','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '24','dop_id' => '1','video_id' => '24','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '25','dop_id' => '1','video_id' => '25','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '26','dop_id' => '1','video_id' => '26','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '27','dop_id' => '1','video_id' => '27','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '29','dop_id' => '1','video_id' => '29','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '30','dop_id' => '1','video_id' => '30','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '31','dop_id' => '1','video_id' => '31','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '32','dop_id' => '1','video_id' => '32','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '33','dop_id' => '1','video_id' => '33','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '34','dop_id' => '1','video_id' => '34','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '35','dop_id' => '1','video_id' => '35','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '36','dop_id' => '1','video_id' => '36','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '37','dop_id' => '1','video_id' => '37','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '38','dop_id' => '1','video_id' => '38','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '39','dop_id' => '1','video_id' => '39','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '40','dop_id' => '1','video_id' => '40','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '41','dop_id' => '1','video_id' => '41','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '42','dop_id' => '1','video_id' => '42','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '43','dop_id' => '1','video_id' => '43','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '44','dop_id' => '1','video_id' => '44','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '45','dop_id' => '1','video_id' => '45','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '46','dop_id' => '1','video_id' => '46','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '47','dop_id' => '1','video_id' => '47','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '48','dop_id' => '1','video_id' => '48','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL)
);


    private $genres = array(
  array('id' => '1','name' => 'commercial','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '2','name' => 'music video','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '3','name' => 'fashion','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '4','name' => 'short film','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '5','name' => 'feature film','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '6','name' => 'documentary','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '7','name' => 'TV series','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL)
);

    private $genre_video = array(
  array('id' => '1','genre_id' => '3','video_id' => '1','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '2','genre_id' => '3','video_id' => '2','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '3','genre_id' => '2','video_id' => '3','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '4','genre_id' => '2','video_id' => '4','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '5','genre_id' => '5','video_id' => '5','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '6','genre_id' => '2','video_id' => '6','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '7','genre_id' => '5','video_id' => '7','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '8','genre_id' => '1','video_id' => '8','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '9','genre_id' => '5','video_id' => '9','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '10','genre_id' => '1','video_id' => '10','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '11','genre_id' => '1','video_id' => '11','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '12','genre_id' => '1','video_id' => '12','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '13','genre_id' => '4','video_id' => '13','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '14','genre_id' => '5','video_id' => '14','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '15','genre_id' => '7','video_id' => '15','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '16','genre_id' => '2','video_id' => '16','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '17','genre_id' => '1','video_id' => '17','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '18','genre_id' => '6','video_id' => '18','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '19','genre_id' => '5','video_id' => '19','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '20','genre_id' => '2','video_id' => '20','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '21','genre_id' => '6','video_id' => '21','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '22','genre_id' => '6','video_id' => '22','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '23','genre_id' => '5','video_id' => '23','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '24','genre_id' => '7','video_id' => '24','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '25','genre_id' => '7','video_id' => '25','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '26','genre_id' => '6','video_id' => '26','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '27','genre_id' => '5','video_id' => '27','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '29','genre_id' => '4','video_id' => '29','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '30','genre_id' => '1','video_id' => '30','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '31','genre_id' => '1','video_id' => '31','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '32','genre_id' => '4','video_id' => '32','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '33','genre_id' => '4','video_id' => '33','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '34','genre_id' => '4','video_id' => '34','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '35','genre_id' => '6','video_id' => '35','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '36','genre_id' => '1','video_id' => '36','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '37','genre_id' => '2','video_id' => '37','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '38','genre_id' => '2','video_id' => '38','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '39','genre_id' => '4','video_id' => '39','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '40','genre_id' => '4','video_id' => '40','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '41','genre_id' => '4','video_id' => '41','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '42','genre_id' => '6','video_id' => '42','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '43','genre_id' => '6','video_id' => '43','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '44','genre_id' => '2','video_id' => '44','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '46','genre_id' => '7','video_id' => '46','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '47','genre_id' => '4','video_id' => '47','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '48','genre_id' => '2','video_id' => '48','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL)
);

    private $menus = array(
  array('id' => '1','name' => 'home','slug' => NULL,'link' => NULL,'bg_class' => NULL,'bg_color' => NULL,'bg_image' => NULL,'created_at' => NULL,'updated_at' => NULL),
  array('id' => '2','name' => 'commercial','slug' => NULL,'link' => NULL,'bg_class' => NULL,'bg_color' => NULL,'bg_image' => NULL,'created_at' => NULL,'updated_at' => NULL),
  array('id' => '3','name' => 'fashion','slug' => NULL,'link' => NULL,'bg_class' => NULL,'bg_color' => NULL,'bg_image' => NULL,'created_at' => NULL,'updated_at' => NULL),
  array('id' => '4','name' => 'music video','slug' => NULL,'link' => NULL,'bg_class' => NULL,'bg_color' => NULL,'bg_image' => NULL,'created_at' => NULL,'updated_at' => NULL),
  array('id' => '5','name' => 'short film','slug' => NULL,'link' => NULL,'bg_class' => NULL,'bg_color' => NULL,'bg_image' => NULL,'created_at' => NULL,'updated_at' => NULL)
);

    private $productions = array(
  array('id' => '1','slug' => 'zutalor','name' => 'zutalor','country' => NULL,'description' => NULL,'created_at' => '2018-10-25 12:22:23','updated_at' => '2018-10-25 12:22:23','deleted_at' => NULL),
  array('id' => '2','slug' => 'polaris-production','name' => 'polaris production','country' => NULL,'description' => NULL,'created_at' => '2018-10-25 13:17:44','updated_at' => '2018-10-25 13:17:44','deleted_at' => NULL),
  array('id' => '3','slug' => 'lmg-music','name' => 'lmg music','country' => NULL,'description' => NULL,'created_at' => '2018-10-25 13:50:08','updated_at' => '2018-10-25 13:50:08','deleted_at' => NULL),
  array('id' => '4','slug' => 'asprey','name' => 'asprey','country' => NULL,'description' => NULL,'created_at' => '2018-10-26 09:50:59','updated_at' => '2018-10-26 09:50:59','deleted_at' => NULL),
  array('id' => '5','slug' => 'project-production','name' => 'project production','country' => NULL,'description' => NULL,'created_at' => '2018-10-26 10:00:28','updated_at' => '2018-10-26 10:00:28','deleted_at' => NULL),
  array('id' => '6','slug' => 'one-mega-management','name' => 'one mega management','country' => NULL,'description' => NULL,'created_at' => '2018-10-26 10:38:02','updated_at' => '2018-10-26 10:38:02','deleted_at' => NULL),
  array('id' => '7','slug' => 'almaha-tv-production','name' => 'almaha tv production','country' => NULL,'description' => NULL,'created_at' => '2018-10-26 10:53:45','updated_at' => '2018-10-26 10:53:45','deleted_at' => NULL),
  array('id' => '8','slug' => 'prangsta','name' => 'prangsta','country' => NULL,'description' => NULL,'created_at' => '2018-10-26 11:32:15','updated_at' => '2018-10-26 11:32:15','deleted_at' => NULL),
  array('id' => '9','slug' => '3dality','name' => '3dality','country' => NULL,'description' => NULL,'created_at' => '2018-10-26 11:54:05','updated_at' => '2018-10-26 11:54:05','deleted_at' => NULL),
  array('id' => '10','slug' => 'glyndebourne','name' => 'glyndebourne','country' => NULL,'description' => NULL,'created_at' => '2018-10-26 12:10:11','updated_at' => '2018-10-26 12:10:11','deleted_at' => NULL),
  array('id' => '11','slug' => 'ib-films','name' => 'ib films','country' => NULL,'description' => NULL,'created_at' => '2018-10-26 12:32:11','updated_at' => '2018-10-26 12:32:11','deleted_at' => NULL),
  array('id' => '12','slug' => 'dapper-films','name' => 'dapper films','country' => NULL,'description' => NULL,'created_at' => '2018-10-30 09:18:53','updated_at' => '2018-10-30 09:18:53','deleted_at' => NULL),
  array('id' => '13','slug' => 'star-tv-films','name' => 'star tv films','country' => NULL,'description' => NULL,'created_at' => '2018-10-30 12:53:06','updated_at' => '2018-10-30 12:53:06','deleted_at' => NULL),
  array('id' => '14','slug' => 'cinema-verite','name' => 'cinema verite','country' => NULL,'description' => NULL,'created_at' => '2018-10-30 13:40:18','updated_at' => '2018-10-30 13:40:18','deleted_at' => NULL),
  array('id' => '15','slug' => 'president-record','name' => 'president record','country' => NULL,'description' => NULL,'created_at' => '2018-10-30 13:41:51','updated_at' => '2018-10-30 13:41:51','deleted_at' => NULL),
  array('id' => '16','slug' => 'jet-set-films','name' => 'jet set films','country' => NULL,'description' => NULL,'created_at' => '2018-10-30 13:43:55','updated_at' => '2018-10-30 13:43:55','deleted_at' => NULL),
  array('id' => '17','slug' => 'nfs','name' => 'nfs','country' => NULL,'description' => NULL,'created_at' => '2018-10-30 13:45:51','updated_at' => '2018-10-30 13:45:51','deleted_at' => NULL),
  array('id' => '18','slug' => 'house-of-fear','name' => 'house of fear','country' => NULL,'description' => NULL,'created_at' => '2018-10-30 13:47:11','updated_at' => '2018-10-30 13:47:11','deleted_at' => NULL),
  array('id' => '19','slug' => 'totolo-films','name' => 'totolo films','country' => NULL,'description' => NULL,'created_at' => '2018-10-30 13:52:45','updated_at' => '2018-10-30 13:52:45','deleted_at' => NULL),
  array('id' => '20','slug' => 'coulisses-productions','name' => 'coulisses productions','country' => NULL,'description' => NULL,'created_at' => '2018-10-31 15:38:47','updated_at' => '2018-10-31 15:38:47','deleted_at' => NULL),
  array('id' => '21','slug' => 'eicar','name' => 'eicar','country' => NULL,'description' => NULL,'created_at' => '2018-10-31 15:44:14','updated_at' => '2018-10-31 15:44:14','deleted_at' => NULL),
  array('id' => '22','slug' => 'al-noor-productions','name' => 'al noor productions','country' => NULL,'description' => NULL,'created_at' => '2018-10-31 15:46:42','updated_at' => '2018-10-31 15:46:42','deleted_at' => NULL),
  array('id' => '23','slug' => 'juri-nishi','name' => 'juri nishi','country' => NULL,'description' => NULL,'created_at' => '2018-10-31 15:49:50','updated_at' => '2018-10-31 15:49:50','deleted_at' => NULL),
  array('id' => '24','slug' => 'film-for-real','name' => 'film for real','country' => NULL,'description' => NULL,'created_at' => '2018-10-31 15:55:12','updated_at' => '2018-10-31 15:55:12','deleted_at' => NULL),
  array('id' => '25','slug' => 'team-k','name' => 'team k','country' => NULL,'description' => NULL,'created_at' => '2018-10-31 15:56:54','updated_at' => '2018-10-31 15:56:54','deleted_at' => NULL),
  array('id' => '26','slug' => 'cctv1','name' => 'cctv1','country' => NULL,'description' => NULL,'created_at' => '2018-10-31 16:02:37','updated_at' => '2018-10-31 16:02:37','deleted_at' => NULL),
  array('id' => '27','slug' => 'alys-production','name' => 'alys production','country' => NULL,'description' => NULL,'created_at' => '2018-10-31 16:03:53','updated_at' => '2018-10-31 16:03:53','deleted_at' => NULL),
  array('id' => '28','slug' => 'arte','name' => 'arte','country' => NULL,'description' => NULL,'created_at' => '2018-10-31 16:05:15','updated_at' => '2018-10-31 16:05:15','deleted_at' => NULL),
  array('id' => '29','slug' => 'qatar-tv','name' => 'qatar tv','country' => NULL,'description' => NULL,'created_at' => '2018-11-01 13:02:54','updated_at' => '2018-11-01 13:02:54','deleted_at' => NULL)
);

    private $production_video = array(
  array('id' => '1','production_id' => '2','video_id' => '3','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '2','production_id' => '4','video_id' => '11','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '3','production_id' => '4','video_id' => '10','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '4','production_id' => '6','video_id' => '8','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '5','production_id' => '5','video_id' => '4','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '6','production_id' => '3','video_id' => '6','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '7','production_id' => '7','video_id' => '9','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '8','production_id' => '7','video_id' => '7','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '9','production_id' => '8','video_id' => '1','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '10','production_id' => '8','video_id' => '2','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '11','production_id' => '9','video_id' => '5','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '12','production_id' => '10','video_id' => '12','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '13','production_id' => '11','video_id' => '13','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '14','production_id' => '12','video_id' => '14','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '15','production_id' => '13','video_id' => '15','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '16','production_id' => '2','video_id' => '16','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '17','production_id' => '4','video_id' => '17','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '18','production_id' => '7','video_id' => '18','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '19','production_id' => '14','video_id' => '19','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '20','production_id' => '15','video_id' => '20','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '21','production_id' => '16','video_id' => '21','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '22','production_id' => '17','video_id' => '22','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '23','production_id' => '18','video_id' => '23','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '24','production_id' => '13','video_id' => '24','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '25','production_id' => '13','video_id' => '25','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '26','production_id' => '19','video_id' => '26','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '27','production_id' => '20','video_id' => '27','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '29','production_id' => '21','video_id' => '29','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '30','production_id' => '22','video_id' => '30','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '31','production_id' => '22','video_id' => '31','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '32','production_id' => '23','video_id' => '32','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '33','production_id' => '11','video_id' => '33','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '34','production_id' => '17','video_id' => '34','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '35','production_id' => '24','video_id' => '35','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '36','production_id' => '25','video_id' => '36','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '37','production_id' => '3','video_id' => '37','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '38','production_id' => '3','video_id' => '38','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '39','production_id' => '17','video_id' => '39','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '40','production_id' => '17','video_id' => '40','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '41','production_id' => '17','video_id' => '41','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '42','production_id' => '26','video_id' => '41','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '43','production_id' => '27','video_id' => '42','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '44','production_id' => '28','video_id' => '43','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '45','production_id' => '2','video_id' => '44','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '46','production_id' => '1','video_id' => '45','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '47','production_id' => '29','video_id' => '46','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '48','production_id' => '27','video_id' => '47','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '49','production_id' => '5','video_id' => '48','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL)
);

    private $stores = array(
  array('id' => '1','name' => 'feature films','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '2','name' => 'commercials & music videos','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL),
  array('id' => '3','name' => 'documentaries & shorts','created_at' => NULL,'updated_at' => NULL,'deleted_at' => NULL)
);

    private $settings = array(
  array('name' => 'max_file_upload','value' => '{"video":1,"album":20,"product":6}','type' => 'upload','bool' => '0','int' => '0','json' => '1','created_at' => NULL,'updated_at' => NULL),
  array('name' => 'valid_file_upload','value' => '{"video" : ["mp4", "mov", "qt", "flv", "mpeg", "wmv"], "album" : ["jpg","jpeg","JPG","png","gif","zip"], "product" : ["jpg","jpeg","JPG","png","gif"], "avatar" : ["jpg","jpeg","JPG","png","gif"]}','type' => 'upload','bool' => '0','int' => '0','json' => '1','created_at' => NULL,'updated_at' => NULL),
  array('name' => 'max_size_upload','value' => '{"video":3000000000,"album":100000000,"product":10000000,"avatar":10000000}','type' => 'upload','bool' => '0','int' => '0','json' => '1','created_at' => NULL,'updated_at' => NULL),
  array('name' => 'min_size_upload','value' => '{"video":2000,"album":1000,"product":1000,"avatar":1000}','type' => 'upload','bool' => '0','int' => '0','json' => '1','created_at' => NULL,'updated_at' => NULL),
  array('name' => 'max_thumbs','value' => '20','type' => 'upload','bool' => '0','int' => '1','json' => '0','created_at' => NULL,'updated_at' => NULL),
);

    private $videos = array(
  array('id' => '1','uid' => '5bcbabc0090bd','title' => 'alive','slug' => 'alive','client' => 'prangsta','store_id' => '2','country' => 'united kingdom','aspect_ratio' => '2.35','format' => 'digital','camera' => 'red','provider' => 'vimeo','url' => '124522195','produced_at' => '2017-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-29 17:55:58','updated_at' => '2018-11-01 17:55:58','deleted_at' => NULL),
  array('id' => '2','uid' => '5bcd70e501b7e','title' => 'vengeance','slug' => 'vengeance','client' => 'prangsta','store_id' => '2','country' => 'united kingdom','aspect_ratio' => '2.40','format' => 'digital','camera' => 'red','provider' => 'vimeo','url' => '85473615','produced_at' => '2018-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-27 17:55:59','updated_at' => '2018-11-01 17:55:59','deleted_at' => NULL),
  array('id' => '3','uid' => '5bcef037a8652','title' => 'i can\'t help myself','slug' => 'i-can-t-help-myself','client' => 'the luka state','store_id' => '2','country' => 'united kingdom','aspect_ratio' => '1.78','format' => 'digital','camera' => 'alexa','provider' => 'vimeo','url' => '127967558','produced_at' => '2016-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-24 17:01:49','updated_at' => '2018-10-31 17:01:49','deleted_at' => NULL),
  array('id' => '4','uid' => '5bd02c9eddc74','title' => 'lies lies lies','slug' => 'lies-lies-lies','client' => 'the luka state','store_id' => '2','country' => 'united kingdom','aspect_ratio' => '2.35','format' => 'digital','camera' => 'alexa','provider' => 'vimeo','url' => '246967352','produced_at' => '2017-02-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-30 17:55:58','updated_at' => '2018-11-01 17:55:58','deleted_at' => NULL),
  array('id' => '5','uid' => '5bd0baa0aa17a','title' => 'shortlisted 3d','slug' => 'shortlisted-3d','client' => NULL,'store_id' => '1','country' => 'united kingdom','aspect_ratio' => '1.85','format' => 'digital','camera' => '3d red','provider' => 'vimeo','url' => '61562553','produced_at' => '2015-11-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-26 16:53:55','updated_at' => '2018-10-31 16:53:55','deleted_at' => NULL),
  array('id' => '6','uid' => '5bd0bb064cb8f','title' => 'bad as you are','slug' => 'bad-as-you-are','client' => 'peter andre','store_id' => '2','country' => 'united kingdom','aspect_ratio' => '2.40','format' => 'digital','camera' => 'red','provider' => 'vimeo','url' => '52934428','produced_at' => '2015-11-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-20 17:55:59','updated_at' => '2018-11-01 17:55:59','deleted_at' => NULL),
  array('id' => '7','uid' => '5bd0bb66121b0','title' => 'jesus and mary','slug' => 'jesus-and-mary','client' => NULL,'store_id' => '1','country' => 'egypt','aspect_ratio' => '2.35','format' => 'digital','camera' => 'red','provider' => 'vimeo','url' => '79297360','produced_at' => '2015-11-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-29 16:53:54','updated_at' => '2018-10-31 16:53:54','deleted_at' => NULL),
  array('id' => '8','uid' => '5bd0bba6a9cb2','title' => 'ss 14','slug' => 'gossard-ss-14','client' => 'gossard','store_id' => '2','country' => 'united kingdom','aspect_ratio' => '2.40','format' => 'digital','camera' => 'red','provider' => 'vimeo','url' => '124391327','produced_at' => '2015-11-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-25 17:55:59','updated_at' => '2018-11-01 17:55:59','deleted_at' => NULL),
  array('id' => '9','uid' => '5bd0bd7df0808','title' => 'a tale of arabia','slug' => 'a-tale-of-arabia','client' => NULL,'store_id' => '1','country' => 'egypt','aspect_ratio' => '2.35','format' => 'digital','camera' => 'red','provider' => 'vimeo','url' => '79302888','produced_at' => '2015-11-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-30 16:53:54','updated_at' => '2018-10-31 16:53:54','deleted_at' => NULL),
  array('id' => '10','uid' => '5bd1d66441d79','title' => 'born to dream','slug' => 'born-to-dream','client' => 'asprey','store_id' => '2','country' => 'united kingdom','aspect_ratio' => '2.50','format' => 'digital','camera' => 'alexa','provider' => 'vimeo','url' => '140565539','produced_at' => '2015-11-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-26 17:55:59','updated_at' => '2018-11-01 17:55:59','deleted_at' => NULL),
  array('id' => '11','uid' => '5bd2e3829b4ed','title' => 'the journey','slug' => 'the-journey','client' => 'asprey','store_id' => '2','country' => 'united kingdom','aspect_ratio' => '2.50','format' => 'digital','camera' => 'alexa','provider' => 'vimeo','url' => '190240903','produced_at' => '2016-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-31 17:55:58','updated_at' => '2018-11-01 17:55:58','deleted_at' => NULL),
  array('id' => '12','uid' => '5bd30422e5f55','title' => 'cinema trailer','slug' => 'glyndebourne-cinema-trailer','client' => 'glyndebourne' ,'store_id' => '2','country' => 'united kingdom','aspect_ratio' => '2.40','format' => 'digital','camera' => 'sony f55','provider' => 'vimeo','url' => '140567310','produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-24 17:55:59','updated_at' => '2018-11-01 17:55:59','deleted_at' => NULL),
  array('id' => '13','uid' => '5bd309498284b','title' => 'no love lost','slug' => 'no-love-lost','client' => NULL,'store_id' => '3','country' => 'United Kingdom','aspect_ratio' => '1.85','format' => 'digital','camera' => 'alexa','provider' => 'vimeo','url' => '157414717','produced_at' => '2016-10-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-31 15:08:51','updated_at' => '2018-11-01 15:08:51','deleted_at' => NULL),
  array('id' => '14','uid' => '5bd821fc6f9c2','title' => 'the wedding ensemble','slug' => 'the-wedding-ensemble','client' => NULL,'store_id' => '1','country' => 'united kingdom','aspect_ratio' => '1.85','format' => 'digital','camera' => 'hdcam 900','provider' => 'vimeo','url' => '0','produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '1','is_info' => '0','is_active' => '1','created_at' => '2018-10-21 16:53:55','updated_at' => '2018-10-31 16:53:55','deleted_at' => NULL),
  array('id' => '15','uid' => '5bd85431607e4','title' => 'sleep walker','slug' => 'sleep-walker','client' => NULL,'store_id' => '1','country' => 'syria','aspect_ratio' => '1.85','format' => 'digital','camera' => 'hdcam 900','provider' => 'vimeo','url' => NULL,'produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '1','is_info' => '0','is_active' => '1','created_at' => '2018-10-25 16:53:55','updated_at' => '2018-10-31 16:53:55','deleted_at' => NULL),
  array('id' => '16','uid' => '5bd85de6bce08','title' => 'glitter in the sky','slug' => 'glitter-in-the-sky','client' => 'kitty brucknell','store_id' => '2','country' => 'United Kingdom','aspect_ratio' => '2.35','format' => 'digital','camera' => 'sony f55','provider' => 'vimeo','url' => '109022988','produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-21 17:55:59','updated_at' => '2018-11-01 17:55:59','deleted_at' => NULL),
  array('id' => '17','uid' => '5bd85e4645d4e','title' => 'pursuit of perfection','slug' => 'pursuit-of-perfection','client' => 'asprey','store_id' => '2','country' => 'United Kingdom','aspect_ratio' => '2.40','format' => 'digital','camera' => 'red','provider' => 'vimeo','url' => '140565992','produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-19 17:55:59','updated_at' => '2018-11-01 17:55:59','deleted_at' => NULL),
  array('id' => '18','uid' => '5bd85ee6b0057','title' => 'al rahma','slug' => 'al-rahma','client' => NULL,'store_id' => '3','country' => 'Yemen','aspect_ratio' => '1.85','format' => 'digital','camera' => 'black magic / F7','provider' => 'vimeo','url' => '125249516','produced_at' => '2015-01-01','description' => 'Bosnia, Yemen, Kyrgyzstan, Djibouti, Bangladesh, Sri Lanka, Indonesia','is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-30 15:08:51','updated_at' => '2018-11-01 15:08:51','deleted_at' => NULL),
  array('id' => '19','uid' => '5bd85f4196ed4','title' => 'saint dracula 3d','slug' => 'saint-dracula-3d','client' => NULL,'store_id' => '1','country' => 'United Kingdom','aspect_ratio' => '2.35','format' => 'digital','camera' => '3d red','provider' => 'vimeo','url' => '145135260','produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-27 16:53:54','updated_at' => '2018-10-31 16:53:54','deleted_at' => NULL),
  array('id' => '20','uid' => '5bd85f9eef810','title' => 'chain','slug' => 'chain','client' => 'robots in disguise','store_id' => '2','country' => 'United Kingdom','aspect_ratio' => '1.85','format' => 'digital','camera' => 'red','provider' => 'vimeo','url' => NULL,'produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-14 17:56:00','updated_at' => '2018-11-01 17:56:00','deleted_at' => NULL),
  array('id' => '21','uid' => '5bd8601b3fb1c','title' => '1 way up 3d','slug' => '1-way-up-3d','client' => NULL,'store_id' => '3','country' => 'United Kingdom','aspect_ratio' => '1.78','format' => 'digital','camera' => '3d red','provider' => 'vimeo','url' => '97855903','produced_at' => '2016-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-29 15:08:51','updated_at' => '2018-11-01 15:08:51','deleted_at' => NULL),
  array('id' => '22','uid' => '5bd8608ec94fa','title' => 'living in volcano','slug' => 'living-in-volcano','client' => NULL,'store_id' => '3','country' => 'Cape Verde','aspect_ratio' => '1.85','format' => 'digital','camera' => 'digibeta','provider' => 'vimeo','url' => NULL,'produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-27 15:08:51','updated_at' => '2018-11-01 15:08:51','deleted_at' => NULL),
  array('id' => '23','uid' => '5bd860de9af0c','title' => 'eldorado 3d','slug' => 'eldorado-3d','client' => NULL,'store_id' => '1','country' => 'United Kingdom','aspect_ratio' => '1.85','format' => 'digital','camera' => '3d red','provider' => 'vimeo','url' => NULL,'produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '1','is_info' => '0','is_active' => '1','created_at' => '2018-10-22 16:53:55','updated_at' => '2018-10-31 16:53:55','deleted_at' => NULL),
  array('id' => '24','uid' => '5bd8614ff3c6d','title' => 'lawrence of arabia','slug' => 'lawrence-of-arabia','client' => NULL,'store_id' => '1','country' => 'Syria','aspect_ratio' => '1.85','format' => 'digital','camera' => 'HDCAM 900','provider' => 'vimeo','url' => NULL,'produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-24 16:53:55','updated_at' => '2018-10-31 16:53:55','deleted_at' => NULL),
  array('id' => '25','uid' => '5bd861c2c3ed8','title' => 'sword of god','slug' => 'sword-of-god','client' => NULL,'store_id' => '1','country' => 'Syria','aspect_ratio' => '1.85','format' => 'digital','camera' => 'HDCAM 900','provider' => 'vimeo','url' => NULL,'produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-23 16:53:55','updated_at' => '2018-10-31 16:53:55','deleted_at' => NULL),
  array('id' => '26','uid' => '5bd8622c68f4a','title' => 'balani show','slug' => 'balani-show','client' => NULL,'store_id' => '3','country' => 'Mali','aspect_ratio' => '1.85','format' => 'digital','camera' => NULL,'provider' => 'vimeo','url' => '79303908','produced_at' => '2016-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-26 15:08:51','updated_at' => '2018-11-01 15:08:51','deleted_at' => NULL),
  array('id' => '27','uid' => '5bd9cc8397cdc','title' => 'le soufle des ancetres','slug' => 'le-soufle-des-ancetres','client' => NULL,'store_id' => '1','country' => 'France','aspect_ratio' => '1.85','format' => 'digital','camera' => 'HDCAM 900','provider' => 'vimeo','url' => '163033992','produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-28 16:53:54','updated_at' => '2018-10-31 16:53:54','deleted_at' => NULL),
  array('id' => '29','uid' => '5bd9cdcd04c6d','title' => 'gong guee','slug' => 'gong-guee','client' => NULL,'store_id' => '3','country' => 'France','aspect_ratio' => '1.85','format' => '35mm','camera' => 'HDCAM 900','provider' => 'vimeo','url' => NULL,'produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '0','created_at' => '2018-10-16 15:08:52','updated_at' => '2018-11-01 15:08:52','deleted_at' => NULL),
  array('id' => '30','uid' => '5bd9ce5e55281','title' => 'qatar commercial 1','slug' => 'qatar-commercial-1','client' => NULL,'store_id' => '2','country' => 'Qatar','aspect_ratio' => '2.35','format' => 'digital','camera' => 'alexa','provider' => 'vimeo','url' => '145133119','produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-15 17:56:00','updated_at' => '2018-11-01 17:56:00','deleted_at' => NULL),
  array('id' => '31','uid' => '5bd9ce81ca1fb','title' => 'qatar commercial 2','slug' => 'qatar-commercial-2','client' => NULL,'store_id' => '2','country' => 'Qatar','aspect_ratio' => '2.35','format' => 'digital','camera' => 'alexa','provider' => 'vimeo','url' => '145134198','produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-16 17:56:00','updated_at' => '2018-11-01 17:56:00','deleted_at' => NULL),
  array('id' => '32','uid' => '5bd9cf1c6c9ca','title' => 'phenomena','slug' => 'phenomena','client' => NULL,'store_id' => '3','country' => 'United Kingdom','aspect_ratio' => '1.85','format' => 'digital','camera' => '5d','provider' => 'vimeo','url' => '145129616','produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-28 15:08:51','updated_at' => '2018-11-01 15:08:51','deleted_at' => NULL),
  array('id' => '33','uid' => '5bd9cf87c884b','title' => 'fairy who stole eyes','slug' => 'fairy-who-stole-eyes','client' => NULL,'store_id' => '3','country' => 'united kingdom','aspect_ratio' => '1.85','format' => '16mm','camera' => 'alexa','provider' => 'vimeo','url' => NULL,'produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-23 15:08:51','updated_at' => '2018-11-01 15:08:51','deleted_at' => NULL),
  array('id' => '34','uid' => '5bd9cfd312027','title' => 'spaceboy','slug' => 'spaceboy','client' => NULL,'store_id' => '3','country' => 'United Kingdom','aspect_ratio' => '1.85','format' => 'digital','camera' => 'digibeta','provider' => 'vimeo','url' => NULL,'produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-24 15:08:51','updated_at' => '2018-11-01 15:08:51','deleted_at' => NULL),
  array('id' => '35','uid' => '5bd9d05f4467d','title' => 'guns in the afternoon','slug' => 'guns-in-the-afternoon','client' => NULL,'store_id' => '3','country' => 'United Kingdom','aspect_ratio' => '1.78','format' => 'digital','camera' => 'digibeta','provider' => 'vimeo','url' => '145139067','produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-18 15:08:52','updated_at' => '2018-11-01 15:08:52','deleted_at' => NULL),
  array('id' => '36','uid' => '5bd9d0c478aab','title' => 'pristiano olive oil','slug' => 'pristiano-olive-oil','client' => NULL,'store_id' => '2','country' => 'India','aspect_ratio' => '2.35','format' => 'digital','camera' => 'red','provider' => 'vimeo','url' => '145132936','produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-17 17:56:00','updated_at' => '2018-11-01 17:56:00','deleted_at' => NULL),
  array('id' => '37','uid' => '5bd9d11006de3','title' => 'Brauch Dich Nicht','slug' => 'brauch-dich-nicht','client' => 'jamt','store_id' => '2','country' => 'United Kingdom','aspect_ratio' => '2.40','format' => 'digital','camera' => 'red','provider' => 'vimeo','url' => '145129892','produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-23 17:55:59','updated_at' => '2018-11-01 17:55:59','deleted_at' => NULL),
  array('id' => '38','uid' => '5bd9d145273d4','title' => 'stand by me','slug' => 'stand-by-me','client' => 'aguilera','store_id' => '2','country' => 'United Kingdom','aspect_ratio' => '2.40','format' => 'digital','camera' => 'red','provider' => 'vimeo','url' => '145162533','produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-18 17:55:59','updated_at' => '2018-11-01 17:56:00','deleted_at' => NULL),
  array('id' => '39','uid' => '5bd9d197bd9d9','title' => 'night cab','slug' => 'night-cab','client' => NULL,'store_id' => '3','country' => 'United Kingdom','aspect_ratio' => '1.85','format' => '16mm','camera' => NULL,'provider' => 'vimeo','url' => NULL,'produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-22 15:08:51','updated_at' => '2018-11-01 15:08:51','deleted_at' => NULL),
  array('id' => '40','uid' => '5bd9d1c77f1b9','title' => 'road to redemption','slug' => 'road-to-redemption','client' => NULL,'store_id' => '3','country' => 'United Kingdom','aspect_ratio' => '1.85','format' => '16mm','camera' => NULL,'provider' => 'vimeo','url' => NULL,'produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-25 15:08:51','updated_at' => '2018-11-01 15:08:51','deleted_at' => NULL),
  array('id' => '41','uid' => '5bd9d21bc34fa','title' => 'joseph needham','slug' => 'joseph-needham','client' => NULL,'store_id' => '3','country' => 'United Kingdom','aspect_ratio' => '1.85','format' => '16mm','camera' => NULL,'provider' => 'vimeo','url' => NULL,'produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-21 15:08:51','updated_at' => '2018-11-01 15:08:51','deleted_at' => NULL),
  array('id' => '42','uid' => '5bd9d26876fad','title' => 'stars of hawaii','slug' => 'stars-of-hawaii','client' => NULL,'store_id' => '3','country' => 'United States','aspect_ratio' => '1.85','format' => '16mm','camera' => NULL,'provider' => 'vimeo','url' => NULL,'produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-19 15:08:51','updated_at' => '2018-11-01 15:08:51','deleted_at' => NULL),
  array('id' => '43','uid' => '5bd9d2b9ca22f','title' => 'joe strummer','slug' => 'joe-strummer','client' => NULL,'store_id' => '3','country' => 'United Kingdom','aspect_ratio' => '1.78','format' => 'digital','camera' => NULL,'provider' => 'vimeo','url' => NULL,'produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '0','created_at' => '2018-10-17 15:08:52','updated_at' => '2018-11-01 15:08:52','deleted_at' => NULL),
  array('id' => '44','uid' => '5bd9d3590ac02','title' => 'bring this all together','slug' => 'bring-this-all-together','client' => 'the luka state','store_id' => '2','country' => 'United Kingdom','aspect_ratio' => '2.40','format' => 'digital','camera' => 'sony f55','provider' => 'vimeo','url' => '145627494','produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-28 17:55:58','updated_at' => '2018-11-01 17:55:58','deleted_at' => NULL),
  array('id' => '45','uid' => '5bdadf00c5799','title' => 'reel','slug' => 'reel','client' => NULL,'store_id' => NULL,'country' => 'United Kingdom','aspect_ratio' => '1.85','format' => 'digital','camera' => NULL,'provider' => 'vimeo','url' => '189825675','produced_at' => '2018-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-11-01 11:09:53','updated_at' => '2018-11-01 11:09:53','deleted_at' => NULL),
  array('id' => '46','uid' => '5bdaf97bbd498','title' => 'ahmad ibn hanbal','slug' => 'ahmad-ibn-hanbal','client' => NULL,'store_id' => '1','country' => 'Turkey','aspect_ratio' => '2.50','format' => 'digital','camera' => 'alexa','provider' => 'vimeo','url' => '246974182','produced_at' => '2017-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-11-01 13:02:52','updated_at' => '2018-11-01 13:02:52','deleted_at' => NULL),
  array('id' => '47','uid' => '5bdb014fedfb9','title' => 'temoins de la nuit','slug' => 'temoins-de-la-nuit','client' => NULL,'store_id' => '3','country' => 'France','aspect_ratio' => '1.85','format' => '35mm','camera' => 'moviecam','provider' => 'vimeo','url' => NULL,'produced_at' => '2015-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-20 15:08:51','updated_at' => '2018-11-01 15:08:51','deleted_at' => NULL),
  array('id' => '48','uid' => '5bdb36055b0dd','title' => 'bring this all together (alter)','slug' => 'bring-this-all-together-alter','client' => 'the luka state','store_id' => '2','country' => 'United Kingdom','aspect_ratio' => '1.90','format' => 'digital','camera' => 'alexa','provider' => 'vimeo','url' => '246974475','produced_at' => '2018-01-01','description' => NULL,'is_screencaps' => '0','is_info' => '0','is_active' => '1','created_at' => '2018-10-22 17:55:59','updated_at' => '2018-11-01 17:55:59','deleted_at' => NULL)
);




	private $panels = array(
  array('id' => '1','title' => 'news','bg_color' => '#00d1b2','bg_image' => NULL,'link' => NULL,'text' => NULL,'created_at' => NULL,'updated_at' => NULL),
  array('id' => '2','title' => 'begotten','bg_color' => '#F03861','bg_image' => '2.jpg','link' => '{"title":"watch","url":"/video/bergotten"}','text' => NULL,'created_at' => NULL,'updated_at' => NULL),
  array('id' => '3','title' => 'dreyer','bg_color' => '#ef5350','bg_image' => 'dreyer.jpg','link' => '{"title":"read","url":"/articles/dreyer"}','text' => NULL,'created_at' => NULL,'updated_at' => NULL),
  array('id' => '4','title' => '???????','bg_color' => '#ec407a','bg_image' => '4.jpg','link' => NULL,'text' => NULL,'created_at' => NULL,'updated_at' => NULL),
  array('id' => '5','title' => 'experimental cinema','bg_color' => '#66bb6a','bg_image' => 'experimental.jpg','link' => '{"title":"read","url":"/articles/experimental-cinema"}','text' => NULL,'created_at' => NULL,'updated_at' => NULL),
  array('id' => '6','title' => 'rare','bg_color' => '#00d1b2','bg_image' => NULL,'link' => NULL,'text' => NULL,'created_at' => NULL,'updated_at' => NULL)
);

}
