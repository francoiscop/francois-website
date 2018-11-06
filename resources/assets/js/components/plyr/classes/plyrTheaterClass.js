class Theater {

	constructor(video, player){

		this.status = false;

		this.columnsClass = [];

		this.columns = [];

		this.getColumns();

	}

	getColumns(){

		const columns = document.getElementsByClassName('columns')[0]

		if (typeof columns === 'undefined') return;

		const els = columns.getElementsByClassName('column');

		for (let k in els){

			if (typeof els[k].className !== 'undefined'){
				var _is = els[k].className.split(' ')[1];
				this.columnsClass.push(_is);
				this.columns.push(els[k]);
			}

		}
	}

	toggle(){

		this.status = !this.status;

		if (this.status) this.removeClasses();
		if (!this.status) this.addClasses();
	}

	removeClasses(){

		for (let k in this.columns){

			this.columns[k].classList.remove(this.columnsClass[k]);

			if (k != 1) this.columns[k].className += " none";

		}

	}

	addClasses(){

		for (let k in this.columns){

			this.columns[k].classList.remove('none');

			this.columns[k].className += " " + this.columnsClass[k];

		}


	}

}

export default Theater

