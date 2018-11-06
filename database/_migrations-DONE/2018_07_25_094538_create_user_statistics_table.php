<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUserStatisticsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_statistics', function (Blueprint $table) {
            
            $table->increments('id');
            
            $table->integer('user_id')->unsigned();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->unsignedInteger('_views')->default(0);
            $table->unsignedInteger('_friends')->default(0);
            $table->unsignedInteger('_followers')->default(0);
            $table->unsignedInteger('_following')->default(0);
            $table->decimal('_ratings', 3, 2)->default(0);
            $table->unsignedInteger('_ratings_count')->default(0);
            $table->unsignedInteger('_likes')->default(0);
            $table->unsignedInteger('_dislikes')->default(0);
            $table->unsignedInteger('_comments')->default(0);

            $table->unsignedInteger('_videos')->default(0);
            $table->unsignedInteger('_videos_web')->default(0);
            $table->unsignedInteger('_albums')->default(0);
            $table->unsignedInteger('_albums_web')->default(0);
            $table->unsignedInteger('_pictures')->default(0);
            $table->unsignedInteger('_pictures_web')->default(0);
            $table->unsignedInteger('_favorites_videos')->default(0);
            $table->unsignedInteger('_favorites_albums')->default(0);
            $table->unsignedInteger('_products')->default(0);
            
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
        Schema::dropIfExists('user_statistics');
    }
}
