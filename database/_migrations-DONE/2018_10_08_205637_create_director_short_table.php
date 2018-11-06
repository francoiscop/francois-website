<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDirectorShortTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('director_short', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('director_id')->nullable();
            $table->unsignedInteger('short_id')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('director_id')->references('id')->on('directors')->onDelete('cascade');
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
        Schema::dropIfExists('director_short');
    }
}
