@include('_layouts.header')

<section id="content" class="debug-green">

	@yield('hero')

	<div class="container is-full debug-red">

		@yield('content')

	</div>
	
</section>

@include('_layouts.footer')