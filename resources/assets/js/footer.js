const lp = document.getElementById('loading-page');

if (lp !== null) NProgress.configure({ parent: '#loading-page', easing: 'ease', speed: 3000 });

else NProgress.configure({ easing: 'ease', speed: 6000 });

NProgress.start();
//NProgress.inc(0.5);

window.addEventListener("load", () => {

    let lp = document.getElementById('loading-page')

    let header = document.getElementById('header')

    header.style.display = 'block'

    if (lp !== null) lp.style.display = "none";

    NProgress.done()
                
});