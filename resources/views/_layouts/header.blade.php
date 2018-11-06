<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
   <head>
      
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="description" content="">
      <meta name="author" content="">
      <meta name="csrf-token" content="{{ csrf_token() }}">
      <title>MEDIUM RARE</title>

      <link href="{{ asset('css/app.css') }}" rel="stylesheet">

      @yield('css')
      
      <script type="text/javascript" src="/js/vendors/manifest.js"></script>
      <script type="text/javascript" src="/js/vendors/vendor.js"></script>
      <script type="text/javascript" src="/js/header.js"></script>

      @yield('js_header')
   </head>
   
  <body>

      <div id="app" class="{{ ($is_scroll) ? 'app--padding' : '' }}">

         <section id="header" class="{{ ($is_loader) ? 'none' : '' }}">

            <vh-menu
               brand="{{ ($is_brand) ? 'FRANCOIS COPPEY DIRECTOR OF PHOTOGRAPHY' : '' }}"
               class="z-40"
               id="menu"
            >
            </vh-menu>

         </section>