<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateGenreimdbVideoTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('genreimdb_video', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('genreimdb_id')->nullable();
            $table->unsignedInteger('video_id')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('genreimdb_id')->references('id')->on('genreimdbs')->onDelete('cascade');
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
        Schema::dropIfExists('genreimdb_video');
    }
}
