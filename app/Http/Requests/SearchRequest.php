<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class SearchRequest extends FormRequest
{

    protected $valid = ['videos', 'extracts', 'members'];
    
    
    
    public function authorize()
    {
        $parameters = $this->route()->parameters();

        if ((!in_array($parameters['models'], $this->valid))) abort(404);

        return true;  
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */

    public function rules()
    {
        return [];
    }

    public function messages()
    {
        return [];
    }

    /**
     * Override failed validation response
     * @param  Illuminate\Contracts\Validation\Validator
     * @return response
     */

    /*
    protected function failedValidation(Validator $validator)
    {
        $errors = 'Error System: ' . implode(' | ', $validator->errors()->all());
        throw new HttpResponseException(response('', 403)->setStatusCode(403, $errors));
         //throw new HttpResponseException(response()->json($validator->errors(), 422));
    }
    */


}
