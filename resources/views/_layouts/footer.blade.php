        <section class="footer p-0 z-30 {{ ($is_scroll) ? '' : 'footer--sticky'}}" id="footer">
            <div class="container">
            	
            		<div class="footer-nav-list m-t-20 has-text-grey s-10 center-text">
            			&copy; 2018 Francois Coppey
            		</div>
            </div>
        </section>

    </div><!--app-->

        <script type="text/javascript">

            var is = {
                mobile : '{{ $agent->isMobile() }}' == '1',
                tablet : '{{ $agent->isTablet() }}' == '1'
            };

        </script>

        <script type="text/javascript" src="/js/footer.js"></script>
        <script type="text/javascript" src="/js/app.js"></script>

        @yield('js_footer')
        
    </body>
</html>
