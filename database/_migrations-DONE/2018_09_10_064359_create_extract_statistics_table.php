<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateExtractStatisticsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('extract_statistics', function (Blueprint $table) {

            $table->increments('id');

            $table->unsignedInteger('extract_id');
            $table->foreign('extract_id')->references('id')->on('extracts')->onDelete('cascade');
            
            $table->unsignedInteger('_favorites')->default(0);
            $table->unsignedInteger('_views')->default(0);
            $table->unsignedInteger('_plays')->default(0);
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
        Schema::dropIfExists('extract_statistics');
    }
}
