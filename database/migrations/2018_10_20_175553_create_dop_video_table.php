<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDopVideoTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('dop_video', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('dop_id')->nullable();
            $table->unsignedInteger('video_id')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('dop_id')->references('id')->on('dops')->onDelete('cascade');
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
        Schema::dropIfExists('dop_video');
    }
}
