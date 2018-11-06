const valid_feed = ['post', 'comment', 'review', 'user', 'video', 'album', 'upload', 'extract', 'short']

const medias = ['video', 'extract', 'album', 'product', 'review', 'short']

const buttonsDefault = {

	comment : ['like', 'dislike', 'replies', 'reply', 'delete'],

	post : [{like:{icon: 'favorite_border',toggle:{status: false,icon: 'favorite'}}}, 'retweet', 'comment', 'delete'],

	review : ['like', 'dislike', 'comment', 'delete'],

	user : [{like:{icon: 'favorite_border',toggle:{status: false,icon: 'favorite'}}}, 'comment', 'delete'],

	video : [{like:{icon: 'favorite_border',toggle:{status: false,icon: 'favorite'}}}, 'comment'],

	extract : [{like:{icon: 'favorite_border',toggle:{status: false,icon: 'favorite'}}}, 'comment', 'delete'],

	short : [{like:{icon: 'favorite_border',toggle:{status: false,icon: 'favorite'}}}, 'comment'],
}


const objectDefault = {

	title : null,

	imageBackground : null,

	images : [],

	text : null,

	buttons : [],

	rating : null
}

class Feed {

	constructor(feed){

		this.feed = feed

		if (this.feed.object === null) return null;

		this.valid = valid_feed

		this.isValid = this.getValid()

		this._object = this.formatObject()

		this.header = this.getHeader()

		console.warn('feedCLass.js -> object ', this._object)

	}

	formatObject(){

		let _object = {}

		_object.parentId = this.feed.object.id

		_object.parentClass = this.feed.type

		if (this.isMedia()){

			_object.title = {
				is: true,
				center: true,
				title: this.feed.object.title
			}

		}

		if (this.isImages()){

			_object.images = this.getImages()

		}

		_object.imageBackground = this.getImageBackground()

		_object.imageBackgroundText = this.getImageBackgroundText()

		_object.text = this.getText()

		_object.buttons = this.getButtons()

		_object.statistic = this.feed.object.statistic

		_object.rating = this.getRating()

		return {...objectDefault, ..._object}

	}

	isMedia(){

		return medias.indexOf(this.feed.type) > -1
	}

	isImages(){

		return ['post', 'album'].indexOf(this.feed.type) > -1
	}

	getValid(){

		return this.valid.indexOf(this.feed.type) > -1
	}

	getImageBackground(){

		if (['video'].indexOf(this.feed.type) > -1){

			return {
				src : this.feed.object.poster,
				class : 'aspect__ratio--poster min-w-100xx min-w-200',
            	link : this.feed.object.link
        	}

		}

		if (this.feed.type === 'short'){

			return {
				src : this.feed.object.hero,
				class : 'aspect__ratio--2-40 min-w-300',
            	link : this.feed.object.link
        	}

		}

		if (this.feed.type === 'extract'){

			return {
				src : this.feed.object.poster || this.feed.object.thumb,
				class : 'aspect__ratio--16-9 min-w-300',
            	link : this.feed.object.link
        	}

		}

		if (this.feed.type === 'user'){

			return {
				src : this.feed.object.avatar,
				class : 'aspect__ratio--square min-w-150',
            	link : this.feed.object.link
        	}

		}

		return null
	}

	getImageBackgroundText(){

		if (this.feed.type === 'user' && this.feed.object.avatar === null){

			return '<div class="absolute center-absolute h--black u anton s-30">' + this.feed.object.gender + '</div>'
		}

		return '';
	}

	getImages(){

		var images = []

		if (!this.feed.hasOwnProperty('object') || !this.feed.object.hasOwnProperty('image') || !this.feed.object.images === null){

			return images

		}

		this.feed.object.image.map((image) => {

			let src = (image.hasOwnProperty('src')) ? image.src : image

			let link = (image.hasOwnProperty('link')) ? image.link : null

			images.push({ src : src, link : link })
		})

		return images
	}

	getText(){

		if (this.feed.object.hasOwnProperty('body') && this.feed.object.body !== ''){

			return this.feed.object.body;

		}

		if (this.feed.object.hasOwnProperty('comment') && this.feed.object.comment !== ''){

			return this.feed.object.comment;

		}

		if (this.feed.type === 'extract' && this.feed.object.hasOwnProperty('description') && this.feed.object.description !== ''){

			return this.feed.object.description;

		}

		return null
	}

	getButtons(){

		if (buttonsDefault[this.feed.type] !== null){

			let buttons = buttonsDefault[this.feed.type]

			if (!this.feed.object.hasOwnProperty('deletable') || this.feed.object.deletable === null || !this.feed.object.deletable){

				//console.warn('feed object ::::', this.feed.object)
				//console.warn('feed child ::::', this.feed.child)
				//console.error('feed ::::', this.feed)
				buttons = this.removeDelete(buttons)
			}

			return buttons
		}

		return []
	}

	getRating(){

		if (this.feed.object.hasOwnProperty('rating')){

			if (this.feed.object.rating.hasOwnProperty('rating')) return this.feed.object.rating.rating;

			if (typeof this.feed.object.rating === 'number') return this.feed.object.rating;

		}

		return null

	}

	getHeader() {

		let header = '';

		if (this.feed.user){

			header += '<strong class="c"><a href="' + this.feed.user.link + '">' + this.feed.user.username + '</a></strong>';

			header += ' ' + this.feed.action + this.getOn();

        }

        if (this.feed.action === 'uploaded')  header += ' a new ' + this.feed.type;

        if (['review', 'extract'].indexOf(this.feed.type) > -1){

        	if (this.feed.child){

        		let adj = ' of '

        		if (this.feed.type === 'extract') adj = ' from ';

        		header += adj + ' <strong class="c"><a href="' + this.feed.child.link + '">' + this.feed.child.title + '</a></strong>';
        	}

        	return header;
        }

        /*
        if (this.feed.name === 'profile'){

        }
        */

        return header
    }

    getOn(){

    	if (this.feed.action === 'commented') return ' on ';

    	return '';

    }

    removeDelete(buttons){

    	if (typeof buttons === 'undefined') return buttons;

    	const index = buttons.indexOf('delete');

    	if (index > -1) buttons.splice(index, 1);

    	return buttons
    }
}

export default Feed