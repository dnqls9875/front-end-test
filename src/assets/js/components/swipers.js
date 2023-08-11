import Swiper from "swiper";
import imagesLoaded from "imagesloaded";
import { debounce } from "lodash";

const swipersOptions = {
  isResize : false,
  isLocal : false,
  resizeClass : '.plan-vw-resize',
  resizeBaseWidth : 750,
  resizeDebounceSec : 500
}

/**
 * class swipers
 */
class swipers {
  constructor(root, settings){
    const rootElement = getEle(root);
    const option = {...swipersOptions, ...settings.options};
    const swipers = settings.items.map((item, index) => {
      return SwiperGenerator(item, index, option.isLocal);
    });

    Object.assign(this, {
      rootElement,
      swipers,
      option,
      windowResize: null
    });



    if( option.isResize ) {
      this.initResize();
    } else {
      this.initSwiper();
    }
  };
  initResize(){
    const {option} = this;
    const resizeImage = document.querySelectorAll(option.resizeClass);
    imagesLoaded(resizeImage, ()=>{
      resizeImage.forEach(img => {
        const wrap = document.querySelector('#wrap');
        const naturalWidth = img.naturalWidth;
        const value = naturalWidth / option.resizeBaseWidth * 100;
        const w = value * ( wrap.clientWidth / 100 );
        img.dataset.vwwidth = value;
        img.style.width = w+'px';
      });

      this.windowResize = debounce(()=>{
        this.updates();
      }, option.resizeDebounceSec);
      window.addEventListener('resize', this.windowResize);
      this.initSwiper();
    });
  };
  initSwiper(){
    const {swipers} = this;
    swipers.forEach(swiper => {
      swiper.init();
    });
  };
  updates(){
    const { swipers, option } = this;
    const resizeImage = document.querySelectorAll(option.resizeClass);
    const wrap = document.querySelector('#wrap');
    resizeImage.forEach(img =>{
      const w = img.dataset.vwwidth * ( wrap.clientWidth / 100 );
      img.style.width = w+'px';
    });
    swipers.forEach(swiper => {
      if( swiper.autoplay.running ){
        swiper.autoplay.stop();
        swiper.update();
        swiper.autoplay.start();
      } else {
        swiper.update();
      }
    });
  };
  getSwiper(index){
    const {swipers} = this;
    return swipers[index];
  };

  destroy(){
    const {swipers} = this;
    swipers.forEach(swiper => {
      swiper.destroy();
    });
    this.swipers = null;
    this.rootElement = null;
    if( this.windowResize !== null ){
      window.removeEventListener('resize', this.windowResize);
      this.windowResize = null;
    }
  };
}

/**
 *
 * @param {Object} item
 * @returns Swiper
 */
function SwiperGenerator(item, index, isLocal){
  const swiperDefault = {
    speed: 400,
    spaceBetween: 0,
    loop: true,
    touchEventsTarget: 'container',
    setWrapperSize: true,
    init: false,
    preloadImages: false,
    lazy: {
      loadPrevNext: true,
    },
    autoHeight: true,
      autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true,
    }
  };


  const option = {...swiperDefault, ...item.options};
  const area = getEle(item.area);
  const container =  area.classList.contains('.swiper-container') ? area : area.querySelector('.swiper-container');
  area.dataset.swipersIndex = index;
  if( isLocal ) {
    option.navigation.nextEl = getEle(option.navigation.nextEl, area);
    option.navigation.prevEl = getEle(option.navigation.prevEl, area);
    option.pagination.el = getEle(option.pagination.el, area);
    if( option.pagination.type === 'custom' ){
      option.pagination.renderCustom = function(swiper, current, total){
        $(swiper.pagination.$el).find('.swiper-img-pagination-item').removeClass('active')
          .eq(current - 1).addClass('active');
      };
    }
  }

  const swiper = new Swiper(container, option);

  if( option.pagination.type === 'custom' ){
    $(area).on('click', function(event){
      const target = $(event.target).closest('.swiper-img-pagination-item');
      if( target.get(0) ){
        swiper.slideTo(target.index() + 1);
      }
    })
  }
  return swiper;
}

/**
 *
 * @param {String | HTMLElement} str
 * @returns HTMLElement
 */
function getEle(str, root){
  const _root = root ? root : document;
  return (typeof str === 'string') ? _root.querySelector(str) : str;
}

/**
 *
 * @param {String | HTMLElement} root
 * @param {Object} settings
 * @returns SwipersObject
 */
function Swipers(root, settings){
  if( !root ) {
    console.error('root argument is essentials!');
  } else {
    return new swipers(root, settings);
  }
}


export default Swipers;