<template>
	<div class="div--full flex flex-column flex-center z-30">
		<div class="div__about p-10">
			Francois is an award winning cinematographer based in London with over 14 years of experience.<br />
                Originally from Paris where, after achieving a PhD in Physics, he started his career as a documentary and news cameraman. He then graduated from the french film school Louis Lumiere and moved to England to achieve a Master in Cinematography at the Northern Film School. Since, he has worked around the world in features, TV series, commercials and documetaries. He especially spent extensive time in the middle east working on large scale TV series (Lawrence of Arabia, Sleep Walkers).<br />
                On all levels, his cinematography is dedicated to serve the story, naturalistic or stylised it is about helping the director to provide an unique emotional experience.<br />
                He is proficient with both film (35mm) and Digital and has acquired over the last years precious knowledge of 3D productions.
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
.div__about{
	width: 90%;
	max-width: 600px;
	text-align: left;
}
</style>

<script>

export default{

	mounted(){
		//console.warn('CONTACT ROUTE MOUNTED !!!!!')
		//store.commit('menu/setToRouter', 1)
	}


}
</script>