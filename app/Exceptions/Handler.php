<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;

class Handler extends ExceptionHandler
{
    use ExceptionTrait;

    /**
     * A list of the exception types that are not reported.
     *
     * @var array
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array
     */
    protected $dontFlash = [
        'password',
        'password_confirmation',
    ];

    /**
     * Report or log an exception.
     *
     * This is a great spot to send exceptions to Sentry, Bugsnag, etc.
     *
     * @param  \Exception  $exception
     * @return void
     */
    public function report(Exception $exception)
    {
        parent::report($exception);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Exception  $exception
     * @return \Illuminate\Http\Response
     */
    /*
    public function render($request, Exception $exception)
    {
        return parent::render($request, $exception);
    }
    */

    public function render($request, Exception $exception)
    {
        //return $this->apiException($request, $exception);
        
        if ($request->expectsJson() && !$exception instanceof \Illuminate\Validation\ValidationException) {
            
            //return response()->json(['error' => $exception->getMessage()], 427);
        
        }


        if ($exception instanceof \App\Exceptions\CustomException)  {
            
            return $exception->render($request);
        
        }
 
        return parent::render($request, $exception);
    }

    

    /**
     * Convert an authentication exception into an unauthenticated response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Illuminate\Auth\AuthenticationException  $exception
     * @return \Illuminate\Http\Response
     */
    protected function unauthenticated($request, AuthenticationException $exception)
    {

        if ($request->expectsJson()) {
            
            return response()->json(['error' => 'Unauthenticated.'], 401);
            //return response()->json(['message' => $exception->getMessage()], 401);
        
        }
 
        $guard = array_get($exception->guards(), 0);
 
        //using switch statement to switch between the guards
        switch ($guard) {
            case 'admin':
                $login = 'admin.login';
                break;
            default:
                $login = 'login';
                break;
        }
        
        return redirect()->guest(route($login));
    }
}
