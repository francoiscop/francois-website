<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {

            $table->increments('id');
            $table->string('uid', 50)->unique;
            $table->string('username', 50)->unique();
            $table->unsignedSmallInteger('user_level')->default(0);
            $table->enum('gender', ['m', 'f', 't'])->nullable();
            $table->enum('role', ['user', 'model', 'producer'])->default('user');
            $table->string('avatar', 100)->nullable();
            $table->string('hero', 100)->nullable();
            $table->string('email', 100)->unique();
            $table->string('password', 250);
            $table->date('dob')->nullable();
            $table->string('session', 250)->nullable();
            $table->unsignedInteger('tokens')->default(0);
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_verification_send')->default(false);
            $table->string('country', 50)->default('');
            $table->boolean('mail_list')->default(true);
            $table->string('activationkey', 250)->nullable();
            $table->ipAddress('ip')->default('');
            $table->dateTime('last_login')->nullable();
            $table->rememberToken();
            $table->dateTime('verified_at')->nullable();
            $table->dateTime('activated_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['username', 'gender', 'role']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}
