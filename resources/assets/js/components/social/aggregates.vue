<template>
	<div class="feed-aggregates">

		<div v-for="(aggregate, key) in aggregatesComputed" v-if="['watch'].indexOf(key) === -1">
			<div>
			<span v-for="(obj, k, index) in aggregate" v-if="index < countUser">
				<span v-html="getUser(obj)"></span>
				<rating v-if="key === 'rating'" :rating="getRating(obj)" :size="0.6" static />
				{{ getSeparator(index, key) }}
			</span>
			<span v-html="getOthers(key)" @click="setDisplayOther(key, true)"></span>
			<span v-html="getHeader(key)"></span>
			</div>
			<div class="get-others box" v-if="displayOthers[key]">
					<button class="delete" @click="setDisplayOther(key, false)"></button>
					<span v-for="other in othersList(key)">
						<div  class="flex">
						<img :src="other.avatar" class="rounded" style="height:30px;">
						<span v-html="other.name" style="margin: 0px 5px;"></span>
						<rating v-if="other.rating" :rating="other.rating" :size="0.6" static />
						</div>
					</span>
			</div>
		</div>
	
	</div>
</template>

<style>
.feed-aggregates {
	margin-bottom: 10px;
	font-style: italic;
}
.feed-aggregates > div {
	font-size: 0.9rem;
	position: relative;
}

.feed-aggregates a:not(.others){
	text-transform: capitalize;
}
.feed-aggregates .get-others{
	border-radius: 0;
	position: relative;
}
.feed-aggregates .get-others .delete{
	position: absolute;
	left: 97%;
	top:-10px;
}
</style>

<script>
import rating from './rating.vue'

export default{

	components: {
		rating : rating
	},

	props: {
		aggregates: {
			//type: Object,
			default(){
				return {}
			}
		},

		type: {
			type: String,
			default: null
		}
	},

	data(){

		return{
			countUser: 2,
			displayOthers : this.initDisplayOthers(),
			others : {}
		}
	},

	computed: {

		aggregatesComputed(){

			return this.aggregates;
		},

	},

	methods: {

		othersList(type){

			var i = 1, others = [];

			for (let k in this.aggregates[type]){

				if (i > this.countUser){

					const item = {
						name : this.formatUser(this.aggregates[type][k].user),
						avatar : this.aggregates[type][k].user.avatar,
						rating : this.getRating(this.aggregates[type][k])
					};

					others.push(item);
				}
				i++;
			}

			return others;

		},

		getUser(obj){

			return this.formatUser(obj.user);

		},

		getSeparator(index, type){

			var l = this.getObjectlength(type);

			if (l < 2 || index >= this.countUser - 1) return '';

			if (index === 0 && l < 3) return ' and ';

			return ', ';

		},

		isOthers(type){

			var l = this.getObjectlength(type);

			var diff = l - this.countUser;

			if (diff < 1) return false;

			return diff;

		},

		getOthers(type){

			var diff = this.isOthers(type);

			if (!diff) return;

			var s = (diff > 1) ? 's' : '';

			return 'and ' + diff + ' <a class="others">other' + s + '</a>';

		},

		getHeader(type){
			
			var verb = 'liked';
			if (type === 'comment') verb = 'commented on';
			if (type === 'retweet') verb = 'shared';
			if (type === 'rating') verb = 'rated';
			if (type === 'review') verb = 'wrote a <a href="/films/reviews/' + this.$parent.feed.object.slug + '">review</a> of';
			if (type === 'friend') verb = 'and';
			
			return verb + ' ' + this.getType(type);
		},

		getType(type){

			if (type === 'friend') return this.formatUser(this.$parent.feed.object) + ' are now friends';

			if (this.type === 'user') return this.formatUser(this.$parent.feed.object) + ' \'s profile';

			if (this.type === 'video') return 'this film';

			return 'this ' + this.type;
		},

		getRating(obj){

			if (!obj.object.hasOwnProperty('rating')) return null;

			return obj.object.rating;

		},

		getObjectByKey(key, type){

			if (!this.aggregates.hasOwnProperty(type)) return null;

			return this.aggregates[type][key];

		},

		getObjectlength(type){

			if (!this.aggregates.hasOwnProperty(type)) return 0;

			return Object.keys(this.aggregates[type]).length;

		},

		formatUser(user){
			return '<a href="' + user.link + '">' + user.username + '</a> '
		},

		initDisplayOthers(){
			let obj = {};
			for (let k in this.aggregates){
				obj[k] = false;
			}
			return obj;
		},

		setDisplayOther(key, val){

			Vue.set(this.displayOthers, key, val);
		
		}

	}
}
</script>