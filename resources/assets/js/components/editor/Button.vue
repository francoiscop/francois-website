<template>
	<div @mousedown="onBtnClick" class="tooltip is-tooltip-warning" :data-tooltip="module.description">

		<a v-if="module.icon === null"			
			:class="['vw-btn-'+module.title, {'is-disabled' : isDisabled}]"
			style="position:relative;"
		>
			<component :is="module" @exec="exec"></component>
		</a>

		<a v-else :class="['vw-btn-'+module.title, {'is-disabled' : isDisabled}]" v-html="module.icon"></a>

		<div class="dashboard" v-show="showDashboard" ref="dashboard" v-if="module.title !== 'color'">
			
			<component 
				v-if="module.render"
				v-once ref="moduleDashboard"
				:is="module"
				@exec="exec"
				:uid="uid"
				:options="options"
			></component>
		
		</div>
	
	</div>
</template>

<style>
.is-disabled{
	opacity: 0.4;
	cursor: not-allowed !important;
}
</style>

<script>
import bus from './bus.js'

export default {
	props: ["module", "options", 'isDisabled'],

	data () {
		return {

			showDashboard: false,
			isToggled : false,
		}
	},

  	computed: {
    	uid () {
      		return this.$parent._uid
    	}
  	},

	methods: {
		closeDashboard () {
			this.showDashboard = false;
		},

		openDashboard () {
			this.showDashboard = true;
		},

		exec () {
			this.$parent.exec.apply(null, arguments)
		},

		toggle(){
			this.isToggled = !this.isToggled;
		},

		resetToggle(){
			this.isToggled = false;
		},

		onBtnClick ($event) {
			
			$event.preventDefault();

			if (this.module.title === 'color' || this.module.title === 'imageInsert') return;

			if (this.module.action !== undefined){

				this.exec.apply(null, [this.module.action, 'btn-' + this.module.title]);

				return;
			}

			if (this.module.customAction !== undefined) {

				this.module.customAction(bus.utils).forEach(a => this.exec.apply(null, a));

				return;
			
			}

			if (this.module.render !== undefined && (!this.$refs.dashboard || !this.$refs.dashboard.contains($event.target))){
				
				this.showDashboard = !this.showDashboard;
				
				bus.emit(`${this.uid}_${this.showDashboard ? "show" : "hide"}_dashboard_${this.module.title}`);
				
				return;
			}
		},
	}
}
</script>
