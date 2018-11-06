<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateVideosTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('videos', function (Blueprint $table) {

            $table->increments('id');
            $table->string('uid', 150)->unique();            
            $table->string('title', 250)->nullable();
            $table->string('slug', 250)->nullable();
            $table->string('client', 250)->nullable();
            $table->unsignedInteger('store_id')->nullable();
            $table->string('country', 250)->nullable();
            $table->enum('aspect_ratio', ['1','1.33','1.78','1.85','1.90','2','2.35','2.40','2.50'])->nullable();
            $table->enum('format', ['digital','35mm','16mm','8mm'])->nullable();
            $table->string('camera', 250)->nullable();
            $table->enum('provider', ['vimeo','youtube'])->nullable();
            $table->string('url', 250)->nullable();
            $table->date('produced_at')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_selection')->default(false);
            $table->boolean('is_screencaps')->default(false);
            $table->boolean('is_info')->default(false);
            $table->boolean('is_active')->default(true);

            $table->foreign('store_id')->references('id')->on('stores');

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
        Schema::dropIfExists('videos');
    }
}
