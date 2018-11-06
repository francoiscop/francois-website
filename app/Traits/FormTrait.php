<?php

namespace App\Traits;

use App\Classes\Utils;


trait FormTrait{

	private static $fields_map = [

		'register' => [

			'fields' => [
				'username', 'password', 'password_confirmation', 'email', 'dob', 'gender', 'country', 'captcha'
			],
			
			'required' => [
				'username', 'password', 'password_confirmation', 'email', 'dob', 'gender', 'country', 'captcha'
			]
		],

		'login' => [

			'fields' => [
				'username', 'password'
			],
			
			'required' => [
				'username', 'password'
			]
		],
		
		'video' => [

			'fields' => [
				'title', 'client', 'store', 'genre', 'country', 'productions', 'directors', 'dop', 'tags', 'date_production', 'description', 'provider', 'url', 'format', 'aspect_ratio', 'camera', 'screencaps', 'selection'
			],
			
			'required' => [
				'title', 'genre', 'directors', 'date_production', 'provider', 'productions'
			]
		],

		'album' => [

			'fields' => [
			],
			
			'required' => [
			]
		],

		'product' => [

			'fields' => [
			],
			
			'required' => [
			]
		],

		'avatar' => [

			'fields' => [
			],
			
			'required' => [
			]
		],

		'poster' => [

			'fields' => [
			],
			
			'required' => [
			]
		],

		'hero' => [

			'fields' => [
			],
			
			'required' => [
			]
		],

		'cover' => [

			'fields' => [
			],
			
			'required' => [
			]
		],

		'extract' => [

			'fields' => [
				'title', 'original_film', 'genres', 'tags', 'description'
			],
			
			'required' => [
				'title', 'original_film', 'genres', 'tags', 'description'
			]
		],

		'extract_video' => [

			'fields' => [
				'title', 'tags', 'description'
			],
			
			'required' => [
				'title', 'tags', 'description'
			]
		],

		'short' => [
			
			'fields' => [
				'title', 'genres', 'directors', 'casts', 'tags', 'production', 'description', 'country', 'format', 'color', 'year', 'duration', 'is_linked', '$subform'
			],
			
			'required' => [
				'title', 'genres', 'directors', 'tags', 'duration', 'color', 'duration', 'is_linked', 'terms', 'copyrights', 'url', 'provider'
			],

		],
	
	];


	private static $fields_definition = [
		
		'title' => [

			'fields' => [
            	'type' => 'string',
            	//'rules' => ['regex:(,),\''],
            	'min' => 3,
            	'max' => 50
            ],

            'rules' => [
            	'regex:/^[a-z0-9 \-\(\)]+$/i'
            ],
        ],

        'client' => [

			'fields' => [
            	'type' => 'string',
            	'rules' => ['alphanumeric'],
            ],

            'rules' => [
            	'nullable','regex:/^[a-z0-9 \-\(\)]+$/i'
            ],
        ],

		'tags' => [

			'fields' => [
				'type' => 'tag',
				'key' => 'name',
				'url' => 'tags',
				'allowNew' => true,
				'value' => [],
				'isArray' => true
			],

            'rules' => [
            ],
        ],

		'description' => [

			'fields' => [
				'type' => 'text'
			],

			'rules' => [
            ],

        ],

		'directors' => [

			'fields' => [
				'type' => 'tag',
                'key' => 'name',
                'url' => 'search/director',
                'allowNew' => true,
                'value' => [],
                'isArray' => true
			],

			'rules' => [
            ],

        ],

        'productions' => [

			'fields' => [
				'type' => 'tag',
                'key' => 'name',
                'url' => 'search/production',
                'allowNew' => true,
                'value' => ['zutalor'],
                'isArray' => true
			],

			'rules' => [
            ],

        ],

        'casts' => [

			'fields' => [
				'type' => 'tag',
                'key' => 'name',
                'url' => 'search/cast',
                'allowNew' => true,
                'value' => [],
                'isArray' => true
			],

			'rules' => [
            ],

        ],

        'dop' => [

			'fields' => [
				'type' => 'tag',
                'key' => 'name',
                'url' => 'search/dop',
                'allowNew' => true,
                'value' => [],
                'isArray' => true
			],

			'rules' => [
            ],

        ],

		'genre' => [

			'fields' => [
				'type' => 'enum',
                'enum' => [],
			],

			'rules' => [
            ],

        ],

        'store' => [

			'fields' => [
				'type' => 'enum',
                'enum' => [],
			],

			'rules' => [
            ],

        ],

		'country' => [

			'fields' => [
				'type' => 'enum',
                'enum' => [],
                'value' => 'United Kingdom',
			],

			'rules' => [
            ],

            'messages' => [
            	'required' => 'select a country'
            ],

        ],

        'date_production' => [

			'fields' => [
            	'type' => 'date_year_month',
            	'icon' => 'lock',
            	'datas' => null
            ],

            'rules' => [
            ],
        ],

		'year' => [

			'fields' => [
				'type' => 'enum',
                'enum' => [],
                'widthStyle' => '180px',
			],

			'rules' => [
            ],

            'messages' => [
            	'required' => 'select the year'
            ],

        ],

		'production' => [

			'fields' => [
				'type' => 'string',
			],

			'rules' => [
            ],

        ],

        'is_linked' => [

			'fields' => [
				'type' => 'switches',
                'switches' => [
                	[
                		'ref' => 'link',
                        'libel' => ' Share link',
                        'status' => false,
                        'triggerSubform' => true,
                        'disableUpload' => true
                    ],
                    [
                    	'ref' => 'server',
                    	'libel' => ' Upload video to our server',
                    	'status' => false
                    ]
                ]
			],

			'rules' => [
            ],

        ],

        'link' => [

			'fields' => [
				'type' => 'string',
			],

			'rules' => [
				'required_if:is_linked,link', 'active_url'
            ],

        ],

        'provider' => [

			'fields' => [
				'type' => 'enum',
				'enum' => ['vimeo', 'youtube'],
				'value' => 'vimeo',
				'widthStyle' => '180px',
			],

			'rules' => [
				'required_if:is_linked,link', 'in:vimeo,youtube'
            ],

        ],

        'url' => [

			'fields' => [
				'type' => 'string',
				'helper' => 'ID of vimeo / youtube'
			],

			'rules' => [
				'required_if:is_linked,link'
            ],

        ],

        'camera' => [

			'fields' => [
				'type' => 'string',
			],

			'rules' => [
            ],

        ],

        'aspect_ratio' => [

			'fields' => [
				'type' => 'enum',
				'enum' => ['1', '1.33', '1.78', '1.85', '2', '2.35', '2.40'],
				'value' => '1.85',
				'widthStyle' => '180px',
                'marginStyle' => '0px 0px 50px 0px'
			],

			'rules' => [
				'required_if:is_linked,link'
            ],

        ],

        'screencaps' => [

			'fields' => [
				'type' => 'bool',
			],

			'rules' => [
            ],

        ],

        'selection' => [

			'fields' => [
				'type' => 'bool',
			],

			'rules' => [
            ],

        ],


        'copyrights' => [

			'fields' => [
				'type' => 'bool',
                'label' => 'I certify that I own the copyrights'
			],

			'rules' => [
				'required_if:is_linked,link'
            ],

        ],

        'terms' => [

			'fields' => [
				'type' => 'bool',
                'label' => 'I have read and agreed with our term and conditions',
			],

			'rules' => [
				'required_if:is_linked,link'
            ],

        ],

        'format' => [

			'fields' => [
				'type' => 'enum',
				'enum' => ['digital','35mm','16mm','8mm'],
				'value' => 'digital',
				'widthStyle' => '180px',
			],

			'rules' => [
            ],

        ],

        'color' => [

			'fields' => [
				'type' => 'bool',
				'value' => true
			],

			'rules' => [
            ],

        ],

        'duration' => [

			'fields' => [
				'type' => 'int',
				'helper' => 'in minutes',
				'min' => 1,
				'max' => 25
			],

			'rules' => [
            ],

        ],

        'original_film' => [

			'fields' => [
				'type' => 'string',
				'rules' => ['alphanumeric'],
			],

			'rules' => [
            ],

        ],

        'username' => [

			'fields' => [
            	'type' => 'string',
            	'rules' => ['alphanumeric'],
            	'min' => 4,
            	'max' => 15,
            	'icon' => 'person'
            ],

            'rules' => [
            	'alphanum',
            	'unique:users',
            	'reserved'
            ],

            'messages' => [
            	'required' => 'username is required',
            	'alphanum' => 'The username does not contain only letters and numbers. (No space allowed)',
            	'reserved' => 'This username is reserved'
            ],
        ],

        'password' => [

			'fields' => [
            	'type' => 'string',
            	'min' => 5,
            	'icon' => 'lock'
            ],

            'rules' => [
            	'confirmed'
            ],
        ],

        'password_confirmation' => [

			'fields' => [
            	'type' => 'string',
            	'min' => 5,
            	'icon' => 'lock'
            ],

            'rules' => [
            ],
        ],

        'email' => [

			'fields' => [
            	'type' => 'string',
            	'icon' => 'email'
            ],

            'rules' => [
            	'email',
            	'unique:users'
            ],
        ],

        'dob' => [

			'fields' => [
            	'type' => 'dob',
            	'icon' => 'lock',
            	'datas' => null
            ],

            'rules' => [
            	'dob_valid_validation',
            	'dob_min_validation'
            ],

            'messages' => [
            	'dob_valid_validation' => 'Invalid date of birth',
            	'dob_min_validation' => 'Age < 18 year\'s'
            ]
        ],

        'gender' => [

			'fields' => [
            	'type' => 'gender',
            ],

            'rules' => [
            	'string'
            ],

            'messages' => [
            	'required' => 'choose your gender'
            ],
        ],

        'captcha' => [

			'fields' => [
            	'type' => 'captcha',
            ],

            'rules' => [
            	'captcha'
            ],

            'messages' => [
            	'captcha' => 'Invalid captcha'
            ],
        ],
	
	];
       
           
           


	private static $subform_map = [

		'short' => [
			'provider', 'url', 'aspect_ratio', 'copyrights', 'terms'
		],
	
	];



	private static function isValid($media)
	{

		if (array_key_exists($media, self::$fields_map)) return true;

		return false;
	}

	private static function getForm($media)
	{
		$form = [];

		$fields = self::$fields_map[$media]['fields'];

		foreach ($fields as $key) {

			if ($key !== '$subform') $form[$key] = self::$fields_definition[$key]['fields'];

			else $form['subform'] = self::getSubForm($media);
		}

		$form = self::setRequired($media, $form);

		$form = self::setFix($media, $form);

		return $form;
	}


	private static function getSubForm($media)
	{
		$form = [];

		if (!array_key_exists($media, self::$subform_map)) return null;

		$fields = self::$subform_map[$media];

		foreach ($fields as $key) {

			$form[$key] = self::$fields_definition[$key]['fields'];

		}

		return $form;
	}

	private static function setRequired($media, $form)
	{
		$required = self::$fields_map[$media]['required'];

		foreach ($required as $key) {
			
			if (array_key_exists($key, $form)) $form[$key]['required'] = true;
		}

		if (array_key_exists('subform', $form)){

			foreach ($form['subform'] as $key => $sub) {
				
				if (in_array($key, $required)) $form['subform'][$key]['required'] = true;
			}
		}

		return $form;
	}

	private static function setFix($media, $form)
	{
		//genre::
		if (array_key_exists('genre', $form)) $form['genre']['enum'] = Utils::jsGenre();

		//store::
		if (array_key_exists('store', $form)) $form['store']['enum'] = Utils::jsStore();

		//countries::
		if (array_key_exists('country', $form)) $form['country']['enum'] = Utils::jsCountry();

		//dob::
		if (array_key_exists('dob', $form)) $form['dob']['datas'] = Utils::jsDob();

		//date::
		if (array_key_exists('date_production', $form)) $form['date_production']['datas'] = Utils::jsDateYearMonth();

		//year::
		$max = ($media === 'short') ? 20 : 100;
		if (array_key_exists('year', $form)) $form['year']['enum'] = Utils::jsYear($max);

		//captcha::
		if (array_key_exists('captcha', $form)) $form['captcha']['datas'] = str_replace('"', '\"', captcha_img());

		return $form;
	}










	/* RULES */
	private static function setRules($media)
	{
		$rules = [];

		$fields = self::$fields_map[$media]['fields'];

		$required = self::$fields_map[$media]['required'];

		foreach ($fields as $field) {

			$_rules = [];

			if ($field !== '$subform'){

				$_rules = self::generateRule($field, $required);

				if (count($_rules) > 0) $rules[$field] = $_rules;
			
			} else {

				foreach (self::$subform_map[$media] as $k){

					$_rules = self::generateRule($k, $required);

					if (count($_rules) > 0) $rules[$k] = $_rules;
				}

			}
		}

		//if (!in_array($media, ['register'])) $rules['file'] = self::getRulesDefinitionFile($media);

		//NOT SURE !!!!!!!!!!????
		if (in_array($media, ['avatar', 'hero', 'poster', 'cover'])) $rules['type'] = 'required|in:video,user,short';
		//

		return $rules;
	}

	private static function generateRule($field, $required)
	{
		$rule = [];

		$definitions = self::$fields_definition[$field]['fields'];

		$rules = self::$fields_definition[$field]['rules'];

		if (!array_key_exists('type', $definitions)) return [];

		if (in_array($field, $required)) $rule[0] = 'required';

		if (count($rules) > 0){

			$test = explode(':', $rules[0]);

			if ($test[0] === 'required_if') $rule = [];

			$rule = array_merge($rule, $rules);

		}

		if (array_key_exists('min', $definitions)) array_push($rule, 'min:' . $definitions['min']);

		if (array_key_exists('max', $definitions)) array_push($rule, 'max:' . $definitions['max']);

		if ($definitions['type'] === 'tag') array_push($rule, 'array');

		if ($definitions['type'] === 'int') array_push($rule, 'numeric');

		return $rule;
	}


	private static function getRulesDefinitionFile($media)
    {
    	$settings = config('app.settings');

    	$key = $media;                

        if (in_array($media, ['avatar', 'poster', 'cover'])) $key = 'album';

        $valid_file_upload = $settings['upload']['valid_file_upload'][$key];
        $max_size_upload = $settings['upload']['max_size_upload'][$key];
        $min_size_upload = $settings['upload']['min_size_upload'][$key];

        $required = 'required';

        if ($media === 'short') $required = 'required_if:is_linked,false';

        return $required.'|file|max:'.($max_size_upload/1000).'|min:'.($min_size_upload/1000).'|mimes:'.implode(',', $valid_file_upload);

    }

    private static function setMessages($media)
	{
		$messages = [];

		$fields = self::$fields_map[$media]['fields'];

		foreach ($fields as $field) {

			if (!array_key_exists($field, self::$fields_definition)) continue;

			if (!array_key_exists('messages', self::$fields_definition[$field])) continue;

			foreach (self::$fields_definition[$field]['messages'] as $key => $message) {

				$messages[$field . '.' . $key] = $message;

			}

		}

		return $messages;
	}



}