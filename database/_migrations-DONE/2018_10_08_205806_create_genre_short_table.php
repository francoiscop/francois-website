<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateGenreShortTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('genre_short', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('genre_id')->nullable();
            $table->unsignedInteger('short_id')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('genre_id')->references('id')->on('genres')->onDelete('cascade');
            $table->foreign('short_id')->references('id')->on('shorts')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('genre_short');
    }
}
