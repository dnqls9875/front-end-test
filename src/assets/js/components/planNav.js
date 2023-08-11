import $ from 'jquery';

export default function planNav(bodyStyleWidth=1280){
  // 모바일 app 체크
  // pc, mobile 의 경우 false.
  // app 인경우 true
  const app = (function(){
    try{
      if(isApp === 'true' || (navigator.userAgent.match('LF@LFmall'))) {
        return true;
      }
    } catch(e) {
      console.log('isApp not exist');
      return false;
    }
  })();
  // 모바일 app 설치 베너가 있을 경우에 대한 높이값 산출.
  const appBannerChecker = ()=>{
    if( !app && $('#app_banner').get(0) ){
      if( $('#app_banner').css('display') === 'block' ) {
        return 51;
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  };

  const isMobile = $('.is-mobile').get(0);

  const planNav = $('.plan-nav');

  if( !planNav.get(0) ){
    return false;
  } else {
    const planNavLayer = planNav.find('.nav-nav-layer');
    const planNavItems = planNav.find('.plan-nav-item');
    const topHeight = (app) ? 0 : (isMobile ?44 : 0);

    function planScrollChecker() {
      const offsetY = planNav.offset().top;
      const scrollY = $(window).scrollTop();
      const scrollX = $(window).scrollLeft();
      const windowWidth = $(window).width();
      const bannerHeight = appBannerChecker() + topHeight;
      if (scrollY >= offsetY - bannerHeight) {
        planNav.css('height', planNavLayer.height());
        planNavLayer.addClass('fixed');
        if(bannerHeight){
          planNavLayer.css('top', bannerHeight);
        }
        if (windowWidth <= bodyStyleWidth && !isMobile) {
          planNavLayer.css('margin-left', (bodyStyleWidth - windowWidth) / 2 - scrollX);
        } else {
          planNavLayer.css('margin-left', '');
        }
      } else {
        planNav.css('height', '');
        planNavLayer.removeClass('fixed');
        planNavLayer.css({
          'margin-left': '',
          'top': ''
        });
      }
    }


    planNavItems.on('click', function(){
      planNavItems.removeClass('on')
      $(this).addClass('on');
      window.setTimeout(function(){
        $(window).scrollTop( $(window).scrollTop() - 60 );
      }, 1);
    });

    $(window).on('scroll.planNavEvent', function(){
      planScrollChecker();
    });

    $(window).on('resize.planNavEvent', function(){
      planScrollChecker();
    });

    window.setTimeout(function(){
      planScrollChecker();
    }, 100);

  }
}
