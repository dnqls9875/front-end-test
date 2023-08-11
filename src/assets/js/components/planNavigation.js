import ElementScrollWatcher from './element-scroll-watcher';
import $ from 'jquery';

const set = {
  root: window,
  isResize: true,
  isScroll: true,
  isScrollActive: true,
  fixElementClass : '.nav-nav-layer', // fixed 되는 영역
  fixedClass : 'fixed', // fixed 될때 추가되는 클래스
  anchorActiveClass : 'on', // 활성화 시 추가될 클래스
  deActivePercentY:100,
  activePercentY:80,
  activeDelay:1,
  on: {
    scroll : null, // scroll callback
    resize : null, // resize callback
    active : null, // intersectionObserve active callback
    deActive : null // intersectionObserve deActive callback
  },
  bodyStyleWidth: 1280,
  isRelation: true // true 인경우 해당 영역을 기준으로 나가고 들어오는 것을 체크 / false 인 경우 해당 영역위치에서 다음 영역 위치까지를 계산하여 체크.
}

class planNavigation{
  constructor(root, options){
    const option = {...set, ...options};
    const container = getEle(root);
    const fixLayer = container.querySelector(option.fixElementClass);
    const items = container.querySelectorAll('[data-plan-anchor]');
    const observes = (()=>{
      const obs = [];
      items.forEach( (ele, index) => {
        // const target = document.querySelector(ele.dataset.planAnchor);
        const id = ele.dataset.planAnchor.replace('#', '');
        const target = document.getElementById(id);
        if( target ){
          target.classList.add('observeCheck');
          target.dataset.planAnchorIndex = index;
        }
        obs.push(target);
      });
      return obs;
    })();
    const instance = this;
    if( option.isScrollActive ){
      const esw = new ElementScrollWatcher('.observeCheck', {
        root: window,
        activeDelay: option.activeDelay,
        deActivePercentY:option.deActivePercentY,
        activePercentY:option.activePercentY,
        // direct : function(ele){
        //   instance.active(parseInt( ele.dataset.planAnchorIndex, 10), ele, this);
        // },
        scroll(element){
          if( option.isRelation ){
            const containerRect = fixLayer.getBoundingClientRect();
            const top = containerRect.y + containerRect.height + option.root.innerHeight / 2;
            const eleRect = element.getBoundingClientRect();
            const index = parseInt( element.dataset.planAnchorIndex, 10);
            if( top > eleRect.y && eleRect.y > 0 ){
              instance.active(parseInt( index, 10), element, this);
            }
            if( top < eleRect.y && eleRect.y > 0 && items[index].classList.contains(option.anchorActiveClass) ) {
              instance.active(parseInt( index, 10)-1, element, this);
            }
          }
        }
      });
    }

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



    Object.assign(this,{
      option,
      container,
      fixLayer,
      observes,
      items,
      app,
    });

    $(window).on('scroll.planNavEvent', function(){
      instance.scroll();
    });

    $(window).on('resize.planNavEvent', function(){
      instance.scroll();
    });

    window.setTimeout(function(){
      instance.scroll();
    }, 100);
    items.forEach(ele => {
      ele.addEventListener('click', ()=>{
        $(items).removeClass('on');
        $(ele).addClass('on');
        window.setTimeout(function(){
          $(window).scrollTop( $(window).scrollTop() - 60 );
        }, 1);
      }, true);
    })
  };
  active(activeIndex, ele, esw){
    const {items, option} =this;
    const isGroup = (()=>{
      if( items[activeIndex] !== undefined ){
        return items[activeIndex].dataset.planScrollGroup||'';
      } else {
        return ''
      }
    })();
    items.forEach( (ele, index) =>{
      if( index === activeIndex ){
        ele.classList.add(option.anchorActiveClass);
      } else if(isGroup && ele.dataset.planScrollGroup === isGroup) {
        ele.classList.add(option.anchorActiveClass);
      } else {
        ele.classList.remove(option.anchorActiveClass);
      }
    } );

  };
  scroll(){
    const {app, container, fixLayer, option} = this;
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
    // 앱에서도 모바일 웹과 동일하게 44 헤더가 붙음.
    const topHeight = isMobile ?44 : 0;
    // const topHeight = (app) ? 0 : (isMobile ?44 : 0);
    const $container = $(container);
    const $layer = $(fixLayer);
    const offsetY = $container.offset().top;
    const scrollY = $(window).scrollTop();
    const scrollX = $(window).scrollLeft();
    const windowWidth = $(window).width();
    const bannerHeight = appBannerChecker() + topHeight;

    if (scrollY >= offsetY - bannerHeight) {
      $container.css('height', $layer.height());
      $layer.addClass(option.fixedClass);
      if(bannerHeight){
        $layer.css('top', bannerHeight);
      }
      if (windowWidth <= option.bodyStyleWidth && !isMobile) {
        $layer.css('margin-left', (option.bodyStyleWidth - windowWidth) / 2 - scrollX);
      } else {
        $layer.css('margin-left', '');
      }
    } else {
      $container.css('height', '');
      $layer.removeClass(option.fixedClass);
      $layer.css({
        'margin-left': '',
        'top': ''
      });
    }
  }
}
/**
 *
 * @param {String | HTMLElement} str
 * @returns HTMLElement
 */
function getEle(str){
  return (typeof str === 'string') ? document.querySelector(str) : str;
}
function PlanNavigation(container, options){
  return new planNavigation(container, options);
}

export default PlanNavigation;