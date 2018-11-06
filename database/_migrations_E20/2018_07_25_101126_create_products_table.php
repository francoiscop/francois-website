<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateProductsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            
            $table->increments('id');
            $table->string('uid', 150)->unique();

            $table->unsignedInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            $table->string('title', 50)->nullabe();
            $table->string('slug', 250)->nullable();
            $table->text('images')->nullable();
            $table->string('category', 250)->nullabe();
            $table->text('description')->nullable();

            $table->boolean('is_stock')->default(false);
            $table->unsignedInteger('stock_count')->default(0);

            $table->unsignedInteger('tokens')->default(0);
            $table->unsignedInteger('discount')->default(0);
            
            $table->text('color')->nullable();
            $table->text('fabric')->nullable();
            $table->text('size')->nullable();
            $table->text('shape')->nullable();
            $table->text('wear')->nullable();

            $table->boolean('is_active')->default(true);
            $table->boolean('is_flag')->default(false);
            
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
        Schema::dropIfExists('products');
    }
}
