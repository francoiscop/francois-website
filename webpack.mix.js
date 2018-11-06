let mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.options({
  //extractVueStyles: false,
  //processCssUrls: true,
  //purifyCss: false,
  //uglify: {},
  //postCss: []
});


mix.webpackConfig({
  resolve: {
    alias: {
        "TweenLite": path.resolve('node_modules', 'gsap/src/uncompressed/TweenLite.js'),
        "TweenMax": path.resolve('node_modules', 'gsap/src/uncompressed/TweenMax.js'),
        "TimelineLite": path.resolve('node_modules', 'gsap/src/uncompressed/TimelineLite.js'),
        "TimelineMax": path.resolve('node_modules', 'gsap/src/uncompressed/TimelineMax.js'),
        "ScrollMagic": path.resolve('node_modules', 'scrollmagic/scrollmagic/uncompressed/ScrollMagic.js'),
        "animation.gsap": path.resolve('node_modules', 'scrollmagic/scrollmagic/uncompressed/plugins/animation.gsap.js'),
        "debug.addIndicators": path.resolve('node_modules', 'scrollmagic/scrollmagic/uncompressed/plugins/debug.addIndicators.js')
    },
  },
});


/*
mix.webpackConfig({
  module: {
    rules: [
      {
        test: /\.styl$/,
        loader: ['style-loader', 'css-loader', 'stylus-loader', {
          loader: 'vuetify-loader',
          options: {
            theme: path.resolve('vuetify/src/stylus/theme.styl')
          }
        }]
      }
    ]
  }
})
*/


mix.sass('resources/assets/sass/app.scss', 'public/css');
mix.copy('public/css/app.css', '../../htdocs/_FRANCOIS/css/app.css');


mix.js('resources/assets/js/app.js', 'public/js').extract(['vue','axios','buefy'])
mix.copy('public/js/app.js', '../../htdocs/_FRANCOIS/js/app.js');
mix.copy('public/js/manifest.js', '../../htdocs/_FRANCOIS/js/vendors/manifest.js');
mix.copy('public/js/vendor.js', '../../htdocs/_FRANCOIS/js/vendors/vendor.js');

//mix.js('resources/assets/js/home.js', 'public/js');
//mix.copy('public/js/home.js', '../../htdocs/_FRANCOIS/js/vue/home.js');

mix.js('resources/assets/js/header.js', 'public/js');
mix.copy('public/js/header.js', '../../htdocs/_FRANCOIS/js/header.js');

mix.js('resources/assets/js/form.js', 'public/js');
mix.copy('public/js/form.js', '../../htdocs/_FRANCOIS/js/vue/form.js');

mix.js('resources/assets/js/vimeo.js', 'public/js');
mix.copy('public/js/vimeo.js', '../../htdocs/_FRANCOIS/js/vimeo.js');

mix.js('resources/assets/js/footer.js', 'public/js');
mix.copy('public/js/footer.js', '../../htdocs/_FRANCOIS/js/footer.js');

