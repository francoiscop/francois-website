<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSettingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->increments('id');
            $table->string('name', 250)->nullabe();
            $table->text('value')->nullabe();
            $table->enum('type', ['config', 'pagination', 'directory', 'upload', 'encode', 'display', 'imdb'])->nullabe();
            $table->boolean('bool')->default(0);
            $table->boolean('int')->default(0);
            $table->boolean('json')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('settings');
    }
}
