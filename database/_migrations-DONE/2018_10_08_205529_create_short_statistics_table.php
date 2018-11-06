<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateShortStatisticsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('short_statistics', function (Blueprint $table) {
            
            $table->increments('id');

            $table->unsignedInteger('short_id');
            $table->foreign('short_id')->references('id')->on('shorts')->onDelete('cascade');
            
            $table->decimal('_ratings', 3, 2)->default(0);
            $table->unsignedInteger('_ratings_count')->default(0);
            $table->unsignedInteger('_views')->default(0);
            $table->unsignedInteger('_plays')->default(0);
            $table->unsignedInteger('_downloads')->default(0);
            $table->unsignedInteger('_likes')->default(0);
            $table->unsignedInteger('_dislikes')->default(0);
            $table->unsignedInteger('_comments')->default(0);

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
        Schema::dropIfExists('short_statistics');
    }
}
