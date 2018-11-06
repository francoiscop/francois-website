Vue.component('vs-icon-play', require('./components/icons/play.vue'));

import VueRouter from 'vue-router'

Vue.use(VueRouter)


const NotFoundComponent = { template: '<div></div>' }

const feedsComponent = { template: '<div><vs-feeds></vs-feeds></div>' }

const tweetComponent = { template: '<div><vs-editor></vs-editor></div>' }

const Comments = { template: '<div><vs-comment-input></vs-comment-input><vs-comments></vs-comments></div>' }

const formComponent = { template: '<vs-form label="update" ></vs-form>' }

const posterComponent = { template: '<vs-upload-simple name-upload="poster"></vs-upload-simple>' }

const coverComponent = { template: '<vs-upload-simple name-upload="cover"></vs-upload-simple>' }

const avatarComponent = { template: '<vs-upload-simple name-upload="avatar"></vs-upload-simple>' }

const reviewsComponent = { template: '<vs-reviews></vs-reviews>' }



import castsComponent from "./views/casts.vue"

import aboutComponent from "./views/about.vue"

import infosVideoComponent from "./views/infos/video.vue"

import descriptionComponent from "./views/description.vue"

import newsComponent from "./views/news.vue"


let routes = [
  //{ path: '/', redirect: '/infos/video' },
  { path: '*', component: NotFoundComponent },
  { path: '/news',component: newsComponent },
  { path: '/feed',component: feedsComponent },
  { path: '/about', component: aboutComponent },
  { path: '/tweet', component: tweetComponent },
  { path: '/comments', component: Comments },
  { path: '/casts', component: castsComponent },
  { path: '/description', component: descriptionComponent },
  { path: '/reviews', component: reviewsComponent },

  { path: '/edit', component: formComponent },
  { path: '/poster', component: posterComponent },
  { path: '/cover', component: coverComponent },
  { path: '/avatar', component: avatarComponent }
]


window.router = new VueRouter({
  routes // short for `routes: routes`
})

