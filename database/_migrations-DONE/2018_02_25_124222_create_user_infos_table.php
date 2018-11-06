<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUserInfosTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_infos', function (Blueprint $table) {
            
            $table->increments('id');
            $table->integer('user_id')->unsigned();

            $table->string('firstname', 50)->nullable();
            $table->string('lastname', 50)->nullable();
            $table->string('city', 50)->nullable();
            $table->string('state', 50)->nullable();
            $table->string('website', 50)->nullable();
            $table->string('twitter', 50)->nullable();

            $table->text('description')->nullable();

            $table->text('looking_for')->nullable();
            $table->enum('orientation', ['','straight','gay','bisexual'])->nullable();
            $table->enum('here_for', ['','just fun','friends','dating','casual relationship','serious relationship'])->nullable();
            $table->enum('ethnicity', ['','White/Caucasian','Asian','Black/African descent','Latino/Hispanic','East Indian','Middle Eastern','Mixed','Native American','Pacific Islander','Other'])->nullable();
            $table->enum('education', ['',"Haven''t graduated high school",'High School graduate','Some college','Current college student',"Associate''s degree &#187; 2 years college",'BA/BS &#187; 4 years college','Some grad school','Current grad school student','MA/MS/MBA','JD','PhD/Post Doctoral'])->nullable();
            $table->enum('marital_status', ['','Single','Attached','Married','Divorced','Separated','Widowed'])->nullable();
            $table->enum('career_job', ['','Administrative/Secretarial','Artistic/Creative/Performance','Executive/Management','Financial services','Labor/Construction','Legal','Medical/Dental/Veterinary','Political/Govt/Civil Service/Military','Retail/Food services','Retired','Sales/Marketing','Teacher/Professor','Technical/Computers/Engineering','Travel/Hospitality/Transportation','Other profession'])->nullable();
            $table->enum('work', ['','Full Time','Part Time','Shift Work','Home Office','Self Employed','Full-time Parent','Student','unemployed','Retired'])->nullable();

            $table->text('interests')->nullable();
            $table->text('favorite_films')->nullable();
            $table->text('favorite_music')->nullable();
            $table->text('favorite_books')->nullable();
            $table->text('favorite_tv')->nullable();
            $table->text('favorite_food')->nullable();

            $table->text('best_feature')->nullable();
            $table->enum('body_type', ['','Petite','Slender','Average','Athletic','Few extra pounds','Full figured','Curvy','Large','Body builder','Tall and skinny'])->nullable();
            $table->enum('height', ['','<4 ft 10 in','4 ft 10 in','4 ft 11 in','5 ft 0 in','5 ft 1 in','5 ft 2 in','5 ft 3 in<','5 ft 4 in','5 ft 5 in','5 ft 6 in','5 ft 7 in','5 ft 8 in','5 ft 9 in','5 ft 10 in','5 ft 11 in','6 ft 0 in','6 ft 1 in','6 ft 2 in','6 ft 3 in','6 ft 4 in','6 ft 5 in','6 ft 6 in','6 ft 7 in','>6 ft 7 in'])->nullable();
            $table->enum('weight', ['','<100lbs','100-109lbs','110-119lbs','120-129lbs','130-139lbs','140-149lbs','150-159lbs','160-169lbs','170-179lbs','180-189lbs','190-199lbs','200-209lbs','210-219lbs','220-229lbs','230-239lbs','240-249lbs','250-259lbs','260-269lbs','270-279lbs','280-289lbs','290-299lbs','>300lbs'])->nullable();
            $table->enum('eye_color', ['','Blue','Brown','Green','Grey','Hazel','Variable','Mixed'])->nullable();
            $table->enum('hair_color', ['','Black','Blonde','Bleached','Dark Brown','Blue','Red','Light Brown','Auburn','Grey/Silver','Dyed','Bald'])->nullable();
            $table->enum('hair_length', ['','Bald','Receeding','Very Short','Crew Cut','Short','Medium','Shoulder-length','Mid-back length','Reaches my butt'])->nullable();
            $table->enum('body_hair', ['','Fully Shaved','Smooth','Trimmed','Average','Very Hairy'])->nullable();
            $table->enum('pubic_hair', ['','Naturally bare','Unshaved/natural','Unshaved and bushy','Shaved or waxed to be neat','Shaved or waxed to be gone'])->nullable();
            
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('user_infos');
    }
}
