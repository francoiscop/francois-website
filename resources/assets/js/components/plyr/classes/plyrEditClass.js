class Edit {

	constructor(video, player){
		
		this.error = false;
		this.video = video;
		this.player = player;
		
		this.time = {
			in: null,
			out: null
		}

		this.setProgress();

		this.setWidth();

		this.disable(true);

	}

	setProgress(){

		var y = document.getElementsByClassName('plyr__progress');
		this.progress = y[0];

	}

	setWidth(){

		this.width = this.progress.offsetWidth;

	}

	disable(val){

		var elIn = document.querySelector('[data-plyr="in"]');
		var elOut = document.querySelector('[data-plyr="out"]');
		
		if (typeof elIn === 'undefined' || typeof elOut === 'undefined'){
			
			this.error = true
			
			return
		}
		
		if (elIn == null || elOut == null){
			
			this.error = true
			
			return
		}


		if (val){
			if (this.time.in !== null) elIn.click();
			if (this.time.out !== null) elOut.click();
		}

		elIn.disabled = val;
		elOut.disabled = val;
	}

	set(type, pressed){

		if (['in','out'].indexOf(type) === -1) return;

		this.removeEl(type);

		if (!pressed){		

			return;
		}

		this.time[type] = this.player.currentTime;

		this.createEl(type);
	
	}

	createEl(type){

		//CHECK
		var opposite = (type === 'in') ? 'out' : 'in';

		if (this.time[opposite] !== null){

			var el =  document.querySelector('[data-plyr="' + opposite + '"]');

			switch(type){
				case 'in':
				if (this.time[type] >= this.time[opposite]) el.click();
				break;

				case 'out':
				if (this.time[type] <= this.time[opposite]) el.click();
				break;
			}
		
		}

		this.setWidth();

		var id = type + '-point';
		var tooltip = type + ' point';
		var color = (type === 'in') ? 'hsl(171, 100%, 41%)' : 'hsl(348, 100%, 61%)';

		var div = document.createElement('div');

		div.setAttribute('id', id);
		div.setAttribute('class', 'plyr__edit is-tooltip-warning tooltip');
		div.dataset.tooltip = tooltip;
		div.style.backgroundColor = color;

		var perc = (this.time[type]/this.player.duration * 100).toFixed(2);

		var left = (parseInt(perc) * this.width)/100;

		div.style.left = left + 'px';

		this.progress.appendChild(div);

	}

	removeEl(type){

		var id = type + '-point';

		var elem = document.getElementById(id);

		if (elem === null) return;

		this.time[type] = null;

		elem.parentElement.removeChild(elem);

	}

}

export default Edit

