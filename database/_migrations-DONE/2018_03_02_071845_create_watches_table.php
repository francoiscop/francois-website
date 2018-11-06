<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateWatchesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('watches', function (Blueprint $table) {
            $table->increments('id');
            $table->ipAddress('ip')->nullable();
            $table->unsignedInteger('user_id');
            $table->unsignedInteger('video_id');
            $table->string('token', 250)->nullable();
            $table->boolean('full')->nullable();
            $table->unsignedInteger('time_stop')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('video_id')->references('id')->on('videos')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('watches');
    }
}
