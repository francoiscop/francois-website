@include('admin._layouts.header-admin')

<section id="content" class="main @if(Auth::check()) p-l-50 @endif">

	@yield('hero')

	<div class="container is-full">

		<div class="columns">

			@if ($columns['left'] > 0)
			<div class="column is-{{ $columns['left'] }} center-text">
				@yield('left')
			</div>
			@endif

			@if ($columns['middle'] > 0)
			<div class="column is-{{ $columns['middle'] }} h-grow">
			@endif
				
				@yield('content')
			
			@if ($columns['middle'] > 0)
			</div>
			@endif

			@if ($columns['right'] > 0)
			<div class="column is-{{ $columns['right'] }} center-text">
				@yield('right')
			</div>
			@endif

		</div>

	</div>
	
</section>

@include('admin._layouts.footer-admin')