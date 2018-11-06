<?php

namespace App\Http\Controllers\Auth;

use App\User;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Foundation\Auth\RegistersUsers;
use App\Classes\Utils;
use Response;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Registered;
use App\UserInfo;
use App\UserPreference;
use App\UserService;
use App\UserStatistic;
use App\UserSystem;
use App\Traits\FormTrait;
use App\Mail\ActivateUser;
use Illuminate\Support\Facades\Mail;



class RegisterController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Register Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles the registration of new users as well as their
    | validation and creation. By default this controller uses a trait to
    | provide this functionality without requiring any additional code.
    |
    */

    use RegistersUsers;

    use FormTrait;

    /**
     * Where to redirect users after registration.
     *
     * @var string
     */
    protected $redirectTo = '/home';

    
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest');
    }



    public function showRegistrationForm()
    {

        $form = [

            'form' => self::getForm('register')
        
        ];

        //return $form;
        
        return view("auth.register", [
            'form' => $form, 
            'columns' => [
                'left' => 2,
                'middle' => 8,
                'right' => 2
            ]
        ]);
    }

    
    public function showRegistrationForm_xxxxxxxxx()
    {
        $_p = Utils::jsDob();
        
        $_p['countries'] = Utils::jsCountry();

        $form = [

            'form' => self::getForm('register')
        
        ];
        
        $columns = [
            'left' => 2,
            'middle' => 8,
            'right' => 2
        ];
        
        return view("auth.register", ['_p' => $_p, 'columns' => $columns]);
    }

    /**
     * Get a validator for an incoming registration request.
     *
     * @param  array  $data
     * @return \Illuminate\Contracts\Validation\Validator
     */
    protected function validator(array $data)
    {
        return Validator::make($data, self::setRules('register'), self::setMessages('register'));
    }

    protected function validator_xxxxxxxxxx(array $data)
    {
        return Validator::make($data, [
            'username' => 'required|string|min:5|max:25|unique:users|reserved|alphanum',
            'email' => 'required|string|email|max:100|unique:users',
            'password' => 'required|string|min:5|confirmed',
            'gender' => 'required|string',
            'dob' => 'required|dob_valid_validation|dob_min_validation',
            'country' => 'required|string|country_validation',
            'captcha' => 'required|captcha',
        ],
        [
            'username.reserved' => 'This username is reserved',
            'username.required' => 'The username field is required.',
            'username.alphanum' => 'The username does not contain only letters and numbers. (No space allowed)',
            'gender.required' => 'Choose your gender.',
            'country.required' => 'Select a country.',
            'country.country_validation' => 'Select a country.',
            'dob.dob_valid_validation' => ' Invalid date of birth',
            'dob.dob_min_validation' => ' Age < 18 year\'s',
            'captcha.captcha' => 'Invalid captcha code.'
        ]);
    }

    public function register(Request $request)
    {

        $this->validator($request->all())->validate();

        event(new Registered($user = $this->create($request->all())));

        //$this->guard()->login($user);

        return Response::json(['message' => 'An activation link has been sent to your email'], 200);

        return $this->registered($request, $user)
                        ?: redirect($this->redirectPath());
    }

    /**
     * Create a new user instance after a valid registration.
     *
     * @param  array  $data
     * @return \App\User
     */
    protected function create(array $data)
    {

        $user = User::create([
            'uid' => Utils::uid( $data['username'] ),
            'username' => strtolower($data['username']),
            'email' => strtolower($data['email']),
            'password' => bcrypt($data['password']),
            'dob' => $data['dob'],
            'gender' => strtolower($data['gender']),
            'country' => ucwords($data['country']),
            'activationkey' => md5(uniqid (rand())),
        ]);

        UserInfo::create([
            'user_id' => $user->id,
        ]);

        /*
        UserPreference::create([
            'user_id' => $user->id,
        ]);
        */

        /*
        UserService::create([
            'user_id' => $user->id,
        ]);
        */

        UserStatistic::create([
            'user_id' => $user->id,
        ]);

        UserSystem::create([
            'user_id' => $user->id,
        ]);

        return $user;
    }

    /**
     * Send Activation link.
     *
     * @param  Request  $request
     * @return Response
     */
    public function sendActivationLink(Request $request)
    {
        Mail::to($request->user())->queue(new OrderShipped($order));
    }
}
