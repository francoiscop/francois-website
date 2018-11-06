@extends('admin._layouts.master-admin')


@section('content')
<vs-form style="max-width: 500px;" class="center-auto" label="create" url="/admin/video/store"></vs-form>
@endsection

@section('js_footer')
<script type="text/javascript">

var _form = JSON.parse('{!! json_encode($form, JSON_HEX_APOS|JSON_HEX_QUOT) !!}');

console.log(_form);

</script>

<script type="text/javascript" src="/js/vue/form.js"></script>

<script type="text/javascript">

var vm = new Vue({
  el: '#app',
  store
})

</script>
@endsection