@extends('_layouts.master')

@section('css')
<style>
html.has-padding-top { padding-top: 3.25rem; }
</style>
@endsection

@section('content')

<div style="max-width: 600px;margin: 0 auto;margin-top: 20px;">
    <vs-form :label="'admin'" :url="'/admin/login'" :is-ajax="false">
         {{ csrf_field() }}
    </vs-form>
</div>

@endsection

@section('js_footer')
<script type="text/javascript">

    var _panels = JSON.parse('{!! $menu->toJson() !!}');

    var _form = JSON.parse('{!! $form->toJson() !!}');

    console.warn(_panels)

    /*
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
    */

    console.warn('form', _form);

</script>

<script type="text/javascript" src="/js/vue/form.js"></script>
<script type="text/javascript">

var vm = new Vue({
  el: '#app',
  store
})

</script>
@endsection