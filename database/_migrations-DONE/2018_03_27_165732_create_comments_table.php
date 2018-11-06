<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCommentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('comments', function (Blueprint $table) {
            
            $table->increments('id');                 
            $table->integer('user_id')->unsigned();
            $table->unsignedInteger('parent_id')->nullable();
            $table->integer('commentable_id')->unsigned();
            $table->string('commentable_type', 250)->nullable();            
            $table->text('comment')->nullable(true);
            //$table->unsignedInteger('_likes')->default(0);
            //$table->unsignedInteger('_dislikes')->default(0);
            $table->boolean('approved')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('parent_id')->references('id')->on('comments')->onDelete('cascade');

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('comments');
    }
}
