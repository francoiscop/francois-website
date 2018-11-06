<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateVideoStatisticsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('video_statistics', function (Blueprint $table) {

            $table->increments('id');
            $table->unsignedInteger('video_id');
            $table->foreign('video_id')->references('id')->on('videos');
            $table->string('event', 250)->nullable();
            $table->decimal('time', 3, 2)->default(0);
            $table->boolean('is_mobile')->default(false);
            $table->string('platform', 250)->nullable();
            $table->string('browser', 250)->nullable();
            $table->string('kind', 250)->nullable();
            $table->string('city', 250)->nullable();
            $table->string('country', 250)->nullable();
            $table->string('ip', 250)->nullable();
            
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
        Schema::dropIfExists('video_statistics');
    }
}
