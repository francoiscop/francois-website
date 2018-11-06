<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePostStatisticsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('post_statistics', function (Blueprint $table) {
            $table->increments('id');

            $table->unsignedInteger('post_id');
            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
            
            $table->unsignedInteger('_views')->default(0);
            $table->unsignedInteger('_likes')->default(0);
            $table->unsignedInteger('_dislikes')->default(0);
            $table->unsignedInteger('_comments')->default(0);
            $table->unsignedInteger('_retweets')->default(0);

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
        Schema::dropIfExists('post_statistics');
    }
}
