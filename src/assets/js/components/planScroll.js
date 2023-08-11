import $ from 'jquery';
import imagesLoaded from "imagesloaded";
export default function planScroll(){
  const elements = document.querySelectorAll('[data-plan-scroll]');
  if( elements ){
    elements.forEach(ele => {
      const id = ele.dataset.planScroll;
      const isFixed = $(ele).parents('.nav-nav-layer');
      ele.addEventListener('click', ()=>{
        const $target = $(id);
        const locationHeight = $('.location').height() || 0;
        const appBannerHeight = (function(){
          const $appBanner = $('#app_banner');
          if( $appBanner.css('display') === 'none' ){
            return 0;
          } else {
            return $appBanner.height() || 0;
          }
        })();
        const fixedH = (isFixed.get(0)) ? isFixed.height() : 0;
        if( $target.get(0) ){
          const preloadImages = $("[data-original]", $($target).prevAll());
          function complateFunction(){
            const targetOffsetTop = $target.offset().top;
            $('html, body').stop().animate({
              'scrollTop' : targetOffsetTop - locationHeight - appBannerHeight - fixedH
            }, 500);
          }
          if( preloadImages.length ){
            imagesLoaded(preloadImages, function( instance ) {
              complateFunction();
            });
            $.each(preloadImages, function(index,img){
              $(img).attr('src', img.dataset.original).removeAttr('data-original');
            });
          } else {
            complateFunction();
          }

        }
        return false;
      });

    });
  }
};