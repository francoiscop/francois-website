<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateVideoSystemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('video_systems', function (Blueprint $table) {
            
            $table->increments('id');

            $table->unsignedInteger('video_id');
            $table->foreign('video_id')->references('id')->on('videos')->onDelete('cascade');

            $table->text('hls')->nullable();
            $table->boolean('error_hls')->default(false);
            $table->text('dash')->nullable();
            $table->boolean('error_dash')->default(false);
            $table->text('mp4')->nullable();
            $table->boolean('error_mp4')->default(false);

            $table->text('preview')->nullable();
            $table->boolean('error_preview')->default(false);
            $table->text('extract')->nullable();
            $table->boolean('error_extract')->default(false);
            
            $table->boolean('encode_status')->nullable();
            $table->boolean('hd')->default(false);
            $table->string('video_size', 25)->nullable();
            $table->string('format', 25)->default('mp4');
            $table->string('duration',20)->nullable();
            $table->unsignedInteger('duration_sec')->nullable();
            $table->string('runtime',20)->nullable();
            $table->unsignedInteger('file_size')->nullable();
            $table->unsignedInteger('bitrate')->nullable();
            $table->string('codec', 50)->nullable();
            $table->string('aspect_ratio', 10)->nullable();
            $table->string('original_file', 250)->nullable();
            $table->string('peview', 250)->nullable();
            $table->boolean('color')->nullable();

            $table->boolean('is_preview')->default(true);
            $table->boolean('is_extract')->default(true);

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
        Schema::dropIfExists('video_systems');
    }
}
