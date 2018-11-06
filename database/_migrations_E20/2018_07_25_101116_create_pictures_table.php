<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePicturesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pictures', function (Blueprint $table) {
            
            $table->increments('id');
            //$table->string('uid', 150)->unique();
            
            $table->unsignedInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->unsignedInteger('album_id');
            $table->foreign('album_id')->references('id')->on('albums')->onDelete('cascade');

            $table->string('file')->nullable();

            $table->boolean('web')->default(true);
            $table->unsignedInteger('tokens')->default(0);
            

            $table->boolean('is_active')->default(true);
            $table->boolean('is_flag')->default(false);

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
        Schema::dropIfExists('pictures');
    }
}
