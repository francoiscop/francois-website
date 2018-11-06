@extends('_layouts.master')

@section('hero')
<section class="hero is-primary is-small">
    <div class="hero-body">
        <div class="container">
            <h1 class="title u">Register</h1>
        </div>
    </div>
</section>
@endsection

@section('content')

<div style="max-width: 600px;margin: 0 auto;margin-top: 20px;">
    <vs-form :label="'register'" :url="'/register'">
         {{ csrf_field() }}
    </vs-form>
</div>

@endsection

@section('js_footer')

<script type="text/javascript">

    var _form = JSON.parse('{!! json_encode($form, JSON_HEX_APOS|JSON_HEX_QUOT) !!}');

    //var _p = JSON.parse('{! json_encode($_p, JSON_HEX_APOS|JSON_HEX_QUOT) !}');
   
   /*
     var _form_xxxxx = {

        form :{
            username : {
                type : 'string',
                value : '{{ old("username") }}',
                required : true,
                icon: 'person',
                error : {
                    status : {{ ($errors->has('username')) ? 'true' : 'false' }},
                    libel : '{{ $errors->first("username") }}'
                }
            },           
            password : {
                type : 'password',
                required : true,
                icon : 'lock',
                error : {
                    status : {{ ($errors->has('password')) ? 'true' : 'false' }},
                    libel : '{{ $errors->first("password") }}'
                }
            },
            password_confirmation : {
                type : 'password',
                required : true,
                icon : 'lock',
                error : {
                    status : {{ ($errors->has('password_confirmation')) ? 'true' : 'false' }},
                    libel : '{{ $errors->first("password_confirmation") }}'
                }
            },
            email : {
                type : 'string',
                value : '{{ old("email") }}',
                required : true,
                icon : 'email',
                error : {
                    status : {{ ($errors->has('email')) ? 'true' : 'false' }},
                    libel : '{{ $errors->first("email") }}'
                }
            },
            dob : {
                type : 'dob',
                datas : _p,
                value : '{{ old("dob") }}',
                //value : '2002-02-01',
                required : true,
                error : {
                    status : {{ ($errors->has('dob')) ? 'true' : 'false' }},
                    libel : '{{ $errors->first("dob") }}'
                }
            },
            gender : {
                type : 'gender',
                value : '{{ old("gender") }}',
                //value : 'f',
                required : true,
                error : {
                    status : {{ ($errors->has('gender')) ? 'true' : 'false' }},
                    libel : '{{ $errors->first("gender") }}'
                }
            },
            country : {
                type : 'enum',
                value : '{{ old("country") }}',
                enum : _p.countries,
                required : true,
                error : {
                    status : {{ ($errors->has('country')) ? 'true' : 'false' }},
                    libel : '{{ $errors->first("country") }}'
                }
            },
            captcha : {
                type : 'captcha',
                datas : '{!! captcha_img() !!}',
                required : true,
                error : {
                    status : {{ ($errors->has('captcha')) ? 'true' : 'false' }},
                    libel : '{{ $errors->first("captcha") }}'
                }
            },
        },
    };
    */

console.warn(_form.form);
</script>

<script type="text/javascript" src="/js/vue/form.js"></script>
<script type="text/javascript">

var vm = new Vue({
  el: '#app',
  store
})

</script>

@endsection

