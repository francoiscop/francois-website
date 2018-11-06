<template>
	<div>
	<div class="div--full flex flex-center center-text z-30 is-hidden-mobile">
		<div class="div__contact">
			<div class="s-12">LONDON</div>
			<ul class="s-10">
				<li>+44 (0) 7497 096258</li>
				<li>francoiscoppey@gmail.com</li>
			</ul>
		</div>
		<div class="div__contact">
			<div class="s-12">PARIS</div>
			<ul class="s-10">
				<li>+33 (0) 6 733 703 66</li>
				<li>francoiscoppey@gmail.com</li>
			</ul>
		</div>
	</div>

	<div class="div--full flex flex-column flex-center center-text z-30 is-hidden-tablet">
		<div class="m-b-20">
			<div class="s-12">LONDON</div>
			<ul class="s-10">
				<li>+44 (0) 7497 096258</li>
				<li>francoiscoppey@gmail.com</li>
			</ul>
		</div>
		<div class="">
			<div class="s-12">PARIS</div>
			<ul class="s-10">
				<li>+33 (0) 6 733 703 66</li>
				<li>francoiscoppey@gmail.com</li>
			</ul>
		</div>
	</div>
	</div>
</template>


<style scoped>
.div--full{
	width: 100%;
	height: 100vh;
	position: absolute;
	top:-4.25rem;
	left:0;
	background-color: white;
}
.div__contact{
	width: 300px;
}
</style>

<script>

export default{

	mounted(){
		//document.body.style.overflow = 'hidden'
	}


}
</script>