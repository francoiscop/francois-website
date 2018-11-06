@extends('admin._layouts.master-admin')

@section('content')

<div class="flex flex-warp flex-center-x"> 
@foreach ($videos as $genre => $values)

	@foreach ($values as $video)
	<div class="aspect__ratio--16-9 is-dark m-5" style="width: 300px">
          <div style="background-size:cover;background-image: url('{{ $video->poster }}');">

              <a href="/admin/video/edit/{{ $video->slug }}">
                  <div class="absolute flex flex-column flex-center center-text video-index__metas">
                      <div class="anton s-22 u has-text-light has-text-primary">
                          {{ $video->title }}
                      </div>
                  </div>
              </a>

              <div class="button order z-20 m-5" data-id="{{ $video->id }}">ORDER</div> 
          
          </div>
    </div>
    @endforeach

    <div class="aspect__ratio--16-9 is-dark m-5" style="width: 300px">
    	<div class="button is-primary is-large order-submit">RE-ORDER</div>
    </div>

@endforeach
</div>

@endsection

@section('js_footer')
<script type="text/javascript">

	let videos = [];

	[...document.querySelectorAll('.order')].forEach((order) => {

		order.addEventListener('click', () => {

			order.parentElement.parentElement.className += " debug";

			const id = order.dataset.id;

			const index = videos.indexOf(id);

			if (index === -1) videos.unshift(id);

			else {

				videos.splice(index, 1);

				order.parentElement.parentElement.classList.remove("debug");

			}
		})

	});

	[...document.querySelectorAll('.order-submit')].forEach((button) => {

		button.addEventListener('click', () => {

			console.log(videos);

			if (videos.length === 0) return;

			axios.post('/admin/rest/videos/order', {videos : videos}).then((r) => {

			}).catch((e) => {

			});

		})

	});

</script>
<script type="text/javascript">
/*
var vm = new Vue({
  el: '#app'
})
*/
</script>
@endsection