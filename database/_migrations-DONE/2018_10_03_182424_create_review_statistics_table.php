<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateReviewStatisticsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('review_statistics', function (Blueprint $table) {
            $table->increments('id');

            $table->unsignedInteger('review_id');
            $table->foreign('review_id')->references('id')->on('reviews')->onDelete('cascade');
            
            $table->unsignedInteger('_likes')->default(0);
            $table->unsignedInteger('_dislikes')->default(0);
            $table->unsignedInteger('_comments')->default(0);
            $table->unsignedInteger('_views')->default(0);
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
        Schema::dropIfExists('review_statistics');
    }
}
