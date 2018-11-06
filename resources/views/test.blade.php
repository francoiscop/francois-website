@extends('_layouts.master')

@section('css')
<link rel="stylesheet" type="text/css" href="/js/vendors/_swiper/swiper.css">
<style>
 html, body {
      position: relative;
      height: 100%;
    }
    body {
      background: #eee;
      font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
      font-size: 14px;
      color:#000;
      margin: 0;
      padding: 0;
    }
    .swiper-container {
      width: 100%;
      height: 100%;
      border:1px solid orange;
    }
    .swiper-container-v{
      border:6px solid blue;
    }
    .swiper-slide {
      border:0px solid green;
      /*
      text-align: center;
      font-size: 18px;
      background: #fff;
      display: -webkit-box;
      display: -ms-flexbox;
      display: -webkit-flex;
      display: flex;
      -webkit-box-pack: center;
      -ms-flex-pack: center;
      -webkit-justify-content: center;
      justify-content: center;
      -webkit-box-align: center;
      -ms-flex-align: center;
      -webkit-align-items: center;
      align-items: center;
      */
    }
    .swiper-container-v {
      background: #ccc;
    } 
}
</style>
@endsection

@section('js_header')
<script type="text/javascript" src="/js/vendors/_swiper/swiper.js"></script>
<!--<script type="text/javascript" src="/js/main.js"></script>-->
@endsection

@section('content')

@foreach($feeds as $feed)
<li>{{ $feed->id }} | {{ ($feed->feedable) ? $feed->feedable->id : '' }}</li>
@if ($feed->feedable && $feed->feedable->commentable)

{{ $feed->feedable->commentable->comment }}

@endif
@endforeach

<!-- Swiper -->
<!--
  <div class="swiper-container swiper-container-v">
    <div class="swiper-wrapper">
      <div class="swiper-slide">Horizontal Slide 1</div>
      <div class="swiper-slide">
        <div class="swiper-container swiper-container-h">
          <div class="swiper-wrapper">
            <div class="swiper-slide">Vertical Slide 1</div>
            <div class="swiper-slide">Vertical Slide 2</div>
            <div class="swiper-slide">Vertical Slide 3</div>
            <div class="swiper-slide">Vertical Slide 4</div>
            <div class="swiper-slide">Vertical Slide 5</div>
          </div>
          <div class="swiper-pagination swiper-pagination-h"></div>
        </div>
      </div>
      <div class="swiper-slide">Horizontal Slide 3</div>
      <div class="swiper-slide">Horizontal Slide 4</div>
    </div>
    <div class="swiper-pagination swiper-pagination-v"></div>
  </div>
-->



@endsection
@section('js_footer')
<script type="text/javascript">

var options = {
   h : {
      pagination: '.swiper-pagination-h',
      paginationClickable: true,
      spaceBetween: 0,
      onSlideChangeStart : function(s){
      },
      onSlideChangeEnd : function(s){
      },
      navigation: {
         nextEl: '.swiper-button-next',
         prevEl: '.swiper-button-prev',
      },
      a11y: {
         prevSlideMessage: 'Previous slide',
         nextSlideMessage: 'Next slide',
      },
   },

   v : {
      //height: 500,
      direction : 'vertical',
      autoHeight: true,
      pagination: '.swiper-pagination-v',
      paginationClickable: true,
      spaceBetween: 0,
      navigation: {
         nextEl: '.swiper-button-next',
         prevEl: '.swiper-button-prev',
      },
      onSlideChangeStart : function(s){
      },
      onSlideChangeEnd : function(s){
      },
      a11y: {
         prevSlideMessage: 'Previous slide',
         nextSlideMessage: 'Next slide',
      },
   }
};




var swiperH = new Swiper('.swiper-container-h', {
      spaceBetween: 0,
      pagination: {
        el: '.swiper-pagination-h',
        clickable: true,
      },
    });
    var swiperV = new Swiper('.swiper-container-v', {
      direction: 'vertical',
      spaceBetween: 0,
      pagination: {
        el: '.swiper-pagination-v',
        clickable: true,
      },
    });

</script>
@endsection