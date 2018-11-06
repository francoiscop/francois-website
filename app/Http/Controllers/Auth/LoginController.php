<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use App\User;
use Illuminate\Support\Facades\Lang;
use Session;
use App\Traits\FormTrait;


class LoginController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers;

    use FormTrait;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo = '/';

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest')->except('logout', 'userlogout');
    }

    public function logout(Request $request)
    {
        $this->guard()->logout();
        
        $request->session()->flush();
        
        $request->session()->regenerate();
        
        //return redirect('/films');
        
        return back();
    }

    /**
     * The user has been authenticated.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  mixed  $user
     * @return mixed
     */
    protected function authenticated(Request $request, $user)
    {
        if ($request->has('previous')){

            return redirect($request->previous);

        }
    }

    /*
    public function redirectTo()
    {
        return Session::get('backUrl') ? Session::get('backUrl') :   $this->redirectTo;

        var_dump($this->request);die('test');
        if ($this->request->has('previous')) {
            $this->redirectTo = $this->request->get('previous');
        }

        return $this->redirectTo ?? '/';
    }
    */


     /**
     * Get the login username to be used by the controller.
     *
     * @return string
     */
    public function username()
    {
        return 'username';
    }

    public function showLoginForm()
    {
        $form = [
            'form' => self::getForm('login')
        ];

        return view("auth.login", [
            'form' => $form,
            'columns' => [
                'left' => 0,
                'middle' => 12,
                'right' => 0
            ]
        ]);
    }

     /**
     * Method override to send correct error messages
     * Get the failed login response instance.
     *
     * @param \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    protected function sendFailedLoginResponse(Request $request)
    {

        if ( ! User::where('username', $request->username)->first() ) {
            return redirect()->back()
                ->withInput($request->only($this->username(), 'remember'))
                ->withErrors([
                    //$this->username() => Lang::get('auth.username'),
                    $this->username() => 'Username not found',
                ]);
        }

        if ( ! User::where('username', $request->username)->where('password', bcrypt($request->password))->first() ) {
            return redirect()->back()
                ->withInput($request->only($this->username(), 'remember'))
                ->withErrors([
                    //'password' => Lang::get('auth.password'),
                    'password' => 'Incorrect password',
                ]);
        }

    }

    public function activate($username, Request $request)
    {
        $user = User::where('username', $username)->withoutGlobalScopes()->firstOrFail();

        if (!is_null($user->activated_at)) {

            Session::flash('error', 'You already activated your account');
        }

        else if ($request->key !== $user->activationkey) {

            Session::flash('error', 'Wrong activation key!');
        }

        else {

            $user->update(['activated_at' => now(), 'activationkey' => null]);

            Session::flash('success', 'Your account have been activated. You can now login');

        }

        return $this->showLoginForm();
    }

}
