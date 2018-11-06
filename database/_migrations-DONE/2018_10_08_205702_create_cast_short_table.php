<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCastShortTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cast_short', function (Blueprint $table) {
            $table->increments('id');
            $table->unsignedInteger('cast_id')->nullable();
            $table->unsignedInteger('short_id')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('cast_id')->references('id')->on('casts')->onDelete('cascade');
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
        Schema::dropIfExists('cast_short');
    }
}
