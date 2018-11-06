@extends('_layouts.master')

@section('hero')
<section class="hero is-primary is-small">
   <div class="hero-body">
      <div class="container">
         <h1 class="title">LOGIN</h1>
         <h2 class="subtitle"></h2>
      </div>
   </div>
</section>
@endsection

@section('content')

@if( Session::has( 'error' ))
<div class="notification is-danger">
     {{ Session::get( 'error' ) }}
</div>
@endif

@if( Session::has( 'success' ))
<div class="notification is-info">
     {{ Session::get( 'success' ) }}
</div>
@endif

<div style="max-width: 600px;margin: 0 auto;margin-top: 20px;">
    <vs-form :label="'login'" :url="'/login'" :is-ajax="false">
         {{ csrf_field() }}
         
         @if (Request::has('previous'))
            <input type="hidden" name="previous" value="{{ Request::get('previous') }}">
         @else
            <input type="hidden" name="previous" value="{{ URL::previous() }}">
         @endif
         
         <p class="has-text-grey has-text-centered is-size-9" slot="after">
            <a href="/register">Sign Up</a> &nbsp;·&nbsp;
            <!--<a href="../">Forgot Password</a> &nbsp;·&nbsp;-->
         </p>
    
    </vs-form>
</div>

@endsection

@section('js_footer')

<script type="text/javascript">
   
     var _form = {

        form : {
            username : {
                type : 'string',
                value : '{{ old("username") }}',
                required : true,
                rules: [],
                max : null,
                min : null,
                icon : 'person',
                helper : '',
                error : {
                    status : {{ ($errors->has('username')) ? 'true' : 'false' }},
                    label : '{{ $errors->first("username") }}'
                }
            },
            password : {
                type : 'password',
                required : true,
                rules: [],
                min : null,
                icon : 'lock',
                helper : '',
                error : {
                    status : {{ ($errors->has('password')) ? 'true' : 'false' }},
                    label : '{{ $errors->first("password") }}'
                }
            },
            remember_me : {
                type : 'bool'
            }
        }
    };

</script>

<script type="text/javascript" src="/js/vue/form.js"></script>
<script type="text/javascript">

var vm = new Vue({
  el: '#app',
  store
})

</script>
@endsection