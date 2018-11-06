<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDirectorVideoTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('director_video', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('director_id')->nullable();
            $table->unsignedInteger('video_id')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('director_id')->references('id')->on('directors')->onDelete('cascade');
            $table->foreign('video_id')->references('id')->on('videos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('director_video', function (Blueprint $table) {
            //
        });
    }
}
