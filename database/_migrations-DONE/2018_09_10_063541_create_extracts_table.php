<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateExtractsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('extracts', function (Blueprint $table) {
            
            $table->increments('id');         
            $table->string('uid', 150)->unique();
            
            $table->unsignedInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->unsignedInteger('video_id')->nullable();
            $table->foreign('video_id')->references('id')->on('videos');
            
            $table->float('time_in', 7, 2)->nullable();
            $table->float('time_out', 7, 2)->nullable();
            $table->unsignedInteger('duration_sec')->nullable();
            $table->string('from_film', 250)->nullable();
            $table->string('title', 250)->nullable();
            $table->string('slug', 250)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_film')->default(true);
            $table->boolean('is_error_encode')->default(false);
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
        Schema::dropIfExists('extracts');
    }
}
