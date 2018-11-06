<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTagProductsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tag_products', function (Blueprint $table) {
            
            $table->increments('id');
            $table->string('name', 50)->nullabe();
            $table->string('category', 250)->nullabe();
            $table->unsignedInteger('num')->default(0);

            $table->text('color')->nullable();
            $table->text('fabric')->nullable();
            $table->text('size')->nullable();
            $table->text('shape')->nullable();
            $table->text('wear')->nullable();

            $table->string('f', 250)->nullable();

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
        Schema::dropIfExists('tag_products');
    }
}