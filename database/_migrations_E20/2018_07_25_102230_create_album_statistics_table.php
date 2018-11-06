<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAlbumStatisticsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('album_statistics', function (Blueprint $table) {
            $table->increments('id');

            $table->unsignedInteger('album_id');
            $table->foreign('album_id')->references('id')->on('albums')->onDelete('cascade');
            
            $table->decimal('_ratings', 3, 2)->default(0);
            $table->unsignedInteger('_ratings_count')->default(0);
            $table->unsignedInteger('_favorites')->default(0);
            $table->unsignedInteger('_views')->default(0);
            $table->unsignedInteger('_downloads')->default(0);
            $table->unsignedInteger('_likes')->default(0);
            $table->unsignedInteger('_dislikes')->default(0);
            $table->unsignedInteger('_comments')->default(0);
            $table->unsignedInteger('_reviews')->default(0);

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
        Schema::dropIfExists('album_statistics');
    }
}
