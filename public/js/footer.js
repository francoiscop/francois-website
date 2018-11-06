webpackJsonp([5],{

/***/ 240:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(241);


/***/ }),

/***/ 241:
/***/ (function(module, exports) {

var lp = document.getElementById('loading-page');

if (lp !== null) NProgress.configure({ parent: '#loading-page', easing: 'ease', speed: 3000 });else NProgress.configure({ easing: 'ease', speed: 6000 });

NProgress.start();
//NProgress.inc(0.5);

window.addEventListener("load", function () {

    var lp = document.getElementById('loading-page');

    var header = document.getElementById('header');

    header.style.display = 'block';

    if (lp !== null) lp.style.display = "none";

    NProgress.done();
});

/***/ })

},[240]);