<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAlbumsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('albums', function (Blueprint $table) {
            
            $table->increments('id');
            $table->string('uid', 150)->unique();
            
            $table->unsignedInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->unsignedInteger('pictures_count');
            
            $table->string('title', 250)->nullable();
            $table->string('slug', 250)->nullable();
            $table->string('original_title', 250)->nullable();

            $table->boolean('web')->default(true);
            $table->unsignedInteger('tokens')->default(0);
            $table->unsignedInteger('discount')->default(0);
            
            $table->text('description')->nullable();

            $table->boolean('is_active')->default(true);
            $table->boolean('is_infos')->default(false);
            $table->boolean('is_licenced')->default(false);
            $table->boolean('is_flag')->default(false);
            $table->string('copyrights_holder', 250)->nullable();

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
        Schema::dropIfExists('albums');
    }
}
