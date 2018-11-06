<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUserPreferencesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_preferences', function (Blueprint $table) {
            
            $table->increments('id');
            $table->integer('user_id')->unsigned();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->text('i_like')->nullable();
            $table->text('i_dislike')->nullable();
            $table->text('sexual_activities')->nullable();
            $table->text('most_erogenous_zones')->nullable();
            $table->text('favorite_panties')->nullable();
            $table->text('panty_fetish')->nullable();

            $table->enum('favorite_position', ['','doggy style','missionary','being on top','all of them'])->nullable();
            $table->enum('sexually_daring', ['','I am sexually shy','I am curious','I will try most anything once','I have already tried everything and will do it again!'])->nullable();
            $table->enum('sex_how_often', ['','All the time','Daily','3-5 times a week','At least once a week','A few times a month','Not a big part'])->nullable();
            $table->enum('masturbation', ['','never','rarely','sometimes','once a week','few times a week','everyday','multiple times a day'])->nullable();
            $table->enum('webcam', ['','yes','no','maybe'])->nullable();
            $table->enum('making_home_videos', ['','I want no part of it','I would consider doing it','Have not found a parter do it with yet','Have a few videos of myself','Have a few pics of myself','Have a growing collection','I videotape all my encounters','Both pics and video is required to play with me','I am practically a pornstar','I AM a pornstar!'])->nullable();
            $table->enum('toys', ['','A must','Sometimes','Willing to experiment','Never'])->nullable();
            $table->enum('porn_how_often', ['','Never','Rarely','Once or twice a week','Often','All the time!'])->nullable();
            
            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('user_preferences');
    }
}
