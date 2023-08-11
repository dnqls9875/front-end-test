import 'intersection-observer';
import $ from 'jquery';
import Swipers from './components/swipers';
import planToggle from './components/planToggle';
import planScroll from './components/planScroll';
import PlanNavigation from './components/planNavigation';
import planIframe from './components/planIframe';

if( document.querySelector('.plan-wide') ) {
  const container = document.querySelector('#container');
  if(container){
    container.style.width = '1240px';
    const styleBlock = document.createElement('style');
    const styles = `
      #temp-prd-list {width:946px;margin: 0 auto;}
      .wingbnr{top:910px;display:none;}
    `;
    styleBlock.innerHTML = styles;
    document.querySelector('.plan-wide').appendChild(styleBlock);
  }
  // container.style.backgroundColor = '#fff';
}
function pad(number) {
  return (number < 10 && number != '00') || number === 0 ? '0' + number : number;
};

function planDateCompare(yyyy, mm, dd, h, m, s){
  var serverTime = window.Echotoday || new Date();

  var setDate = function(year, month, day, hour, minute, second) {
    var returnDate = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hour, 10),
      parseInt(minute, 10),
      parseInt(second, 10),
    );
    return returnDate;
  };

  var dateToFullString = function(date) {
    return parseInt(
      date.getFullYear() +
        '' +
        pad(date.getMonth()) +
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds()),
      10,
    );
  }

  return dateToFullString(serverTime) >= dateToFullString(setDate(yyyy, mm, dd, h, m, s))
}

const planTimer = {
  element : document.querySelector('[data-plan-timer]'),
  end : null,
  now : window.Echotoday || new Date(),
  timer : null,
  countdown(ms){
    const day = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hour = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minute = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const second = Math.floor((ms % (1000 * 60)) / 1000);
    return {
      day : Math.max(day,0),
      hour : Math.max(hour,0),
      minute : Math.max(minute,0),
      second : Math.max(second,0),
    }
  },
  stringToTime(str){
    const timeArray = str.split('-');
    if( timeArray.length > 6 ) {
      return false;
    } else {
      return new Date(
        parseInt(timeArray[0], 10),
        parseInt(timeArray[1], 10) - 1,
        parseInt(timeArray[2], 10),
        parseInt(timeArray[3], 10),
        parseInt(timeArray[4], 10),
        parseInt(timeArray[5], 10),
      );
    }
  },
  displayTimer(){
    const {countdown, element} = this;
    this.timer -= 1000;
    let displayTime = countdown(this.timer);
    let htm = `
        <span class="plan-countdown-number">${displayTime.day}</span>
        <span class="plan-countdown-number">${pad(displayTime.hour)}</span>
        <span class="plan-countdown-number">${pad(displayTime.minute)}</span>
        <span class="plan-countdown-number">${pad(displayTime.second)}</span>
    `
    element.innerHTML = htm;
  },
  init(){
    const {element, displayTimer, stringToTime, now } = this;
    if(element){
      this.end = stringToTime(element.dataset.planTimer);
      this.timer = this.end - now;
      window.setInterval(displayTimer.bind(this), 1000);
    }
  },
}

$(function(){
  planToggle();
  planScroll();
  planTimer.init();
});

$(window).load(function(){
  if( document.querySelector('[data-plan-iframe]') ){
    planIframe.planIframeAutoInit();
  }

  if(document.querySelector('.plan-swiper-mobile-iframe')){
    var iframeSwiper = Swipers('plan', {
      options: {
        isResize: false,
        isLocal: true,
      },
      items: [
        {
          area: '.plan-swiper-mobile-iframe',
        },
      ],
    });
  }
})




window.planDateCompare = planDateCompare;
window.planSwipers = Swipers;
window.PlanNavigation = PlanNavigation;
window.PlanFrame = planIframe;