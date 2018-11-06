<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCastVideoTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cast_video', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('cast_id')->nullable();
            $table->unsignedInteger('video_id')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('cast_id')->references('id')->on('casts')->onDelete('cascade');
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
        Schema::table('cast_video', function (Blueprint $table) {
            //
        });
    }
}
