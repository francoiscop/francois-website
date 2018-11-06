    <!DOCTYPE html>
<html lang="{{ app()->getLocale() }}" class="has-navbar-fixed-top">
   <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="description" content="">
      <meta name="author" content="">
      <meta name="csrf-token" content="{{ csrf_token() }}">
      <title>ADMIN | MEDIUM RARE</title>

      <link href="{{ asset('css/app.css') }}" rel="stylesheet">

      @yield('css')

      <script type="text/javascript" src="/js/vendors/manifest.js"></script>
      <script type="text/javascript" src="/js/vendors/vendor.js"></script>
      <script type="text/javascript" src="/js/header.js"></script>

      @yield('js_header')

   </head>
   
  <body>

  <div id="app">

  <section id="header">

@if (Auth::guard('admin')->check())

    <nav class="navbar is-fixed-top nav-header">
        <div class="navbar-brand">
             <a class="navbar-item" href="/admin">
               <span class="brand-text">
                  <button class="button is-static">ADMIN</button>
               </span>
               </a>
        </div>
        <div id="nav-header-target" class="navbar-menu">
            
            <div class="navbar-end">
                  <div class="navbar-item">
                     <div class="field is-grouped small">

                         @if(Auth::guard('admin')->check())
                        <button class="button is-warning" style="font-family:Anton;margin-right: 10x;" onclick="event.preventDefault();document.getElementById('logout-form').submit();">
                           LOG OUT
                           <small style="font-family: 'Yanone Kaffeesatz', sans-serif;margin-left: 5px;">
                           Admin : {{ ucwords(Auth::guard('admin')->user()->username) }}
                           </small>
                        </button>
                        <form id="logout-form" action="{{ url('/admin/logout') }}" method="POST" style="display: none;">
                           {{ csrf_field() }}
                        </form>
                        @endif
                     
                     </div>
                  </div>
               </div>


        </div>
    </nav>

<vh-menu-user :menu="[{ create : 'admin/video/create' }, { edit : 'admin/video/edit' }, { permissions : 'admin/permissions' }]">
</vh-menu-user>

@endif

</section>
