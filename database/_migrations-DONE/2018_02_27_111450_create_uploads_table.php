<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUploadsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('uploads', function (Blueprint $table) {
            $table->increments('id');         
            $table->string('uid', 150)->unique();

            //$table->unsignedInteger('user_id');
            //$table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            //$table->foreign('user_id')->references('id')->on('admins')->onDelete('cascade');

            $table->unsignedInteger('video_id');
            $table->foreign('video_id')->references('id')->on('videos');

            $table->text('tags')->nullable();
            $table->text('genres')->nullable();
            $table->string('video_size', 25)->nullable();
            $table->string('format', 25)->nullable();
            $table->string('duration', 25)->nullable();
            $table->unsignedInteger('duration_sec')->default(0);
            $table->unsignedInteger('file_size')->default(0);
            $table->unsignedInteger('bitrate')->default(0);
            $table->string('codec', 50)->nullable();
            $table->string('aspect_ratio', 10)->nullable();
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
            $table->datetime('converted_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();

            /*
            $table->unsignedInteger('user_id');
            $table->enum('type', ['shared','personal'])->nullable();
            $table->unsignedInteger('price')->default(0);
            $table->boolean('model')->default(false);
            $table->boolean('producer')->default(false);
            $table->ipAddress('ip')->nullable();
            $table->text('archives')->nullable();
            $table->boolean('error_archives')->default(false);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            */
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('uploads');
    }
}
