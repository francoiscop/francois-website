<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateShortsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('shorts', function (Blueprint $table) {
            
            $table->increments('id');
            $table->string('uid', 150)->unique();
            
            $table->unsignedInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            $table->string('title', 250)->nullable();
            $table->string('slug', 250)->nullable();
            $table->enum('provider', ['','vimeo','youtube'])->nullable();
            $table->string('url', 250)->nullable();
            $table->unsignedInteger('thumb_id')->nullable()->default(10);
            $table->unsignedInteger('duration')->nullable();
            $table->string('country', 250)->nullable();
            $table->integer('year')->nullable();
            $table->boolean('color')->default(true);
            $table->text('description')->nullable();
            $table->string('production', 100)->nullable();
            $table->enum('format', ['','digital','35mm','16mm','8mm'])->nullable();
            $table->string('aspect_ratio', 10)->nullable();
            $table->boolean('is_error_encode')->default(false);
            $table->boolean('is_display')->default(true);
            $table->text('relationship')->nullable();
            $table->dateTime('encoded_at')->nullable();

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
        Schema::dropIfExists('shorts');
    }
}