<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Auth;
use Illuminate\Validation\ValidationException;
use App\Admin;
use App\Traits\FormTrait;


class AdminLoginController extends Controller
{
    use FormTrait;

	public function __construct()
	{
		$this->middleware('guest:admin',['except' => ['logout']]);
	}

    public function username()
    {
        return 'username';
    }

    public function showLoginForm()
    {
    	return view('admin.admin-login', [

            'form' => collect(['form' => self::getForm('login')])
        
        ]);
    }

    public function login(Request $request) {
        
        $this->validate($request,[
            
            'username' => 'required|alpha_num',
            'password' => 'required|min:6'
        
        ]);
        
        if (Auth::guard('admin')->attempt([
            
            'username' => $request->username,
            'password' => $request->password
        
        ], $request->remember)){
            
            //success
            return redirect()->intended(route('admin.dashboard'));
        
        }

        return $this->sendFailedLoginResponse($request);

        //var_dump('FALSE');die();
        
        //if unsuccessfull redirect back to the login for with form data
        throw ValidationException::withMessages([
            $this->username() => [trans('auth.failed')],
        ]);
        return redirect()->back()->withInput($request->only('username','remember'));
    }

    protected function sendFailedLoginResponse(Request $request)
    {

        if ( ! Admin::where('username', $request->username)->first() ) {
            return redirect()->back()
                ->withInput($request->only($this->username(), 'remember'))
                ->withErrors([
                    //$this->username() => Lang::get('auth.username'),
                    $this->username() => 'Username not found',
                ]);
        }

        if ( ! Admin::where('username', $request->username)->where('password', bcrypt($request->password))->first() ) {
            return redirect()->back()
                ->withInput($request->only($this->username(), 'remember'))
                ->withErrors([
                    //'password' => Lang::get('auth.password'),
                    'password' => 'Incorrect password',
                ]);
        }

    }
 
    public function logout()
    {
        Auth::guard('admin')->logout();
 
        return redirect('/');
    }
}
