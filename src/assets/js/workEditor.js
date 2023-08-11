// 업무용 작업환경 파일.
// LF 배포 금지.
import planIframe from './components/planIframe';
const updateParam = 'v220427';
const base64 = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
const baseLF = '//img.lfmall.co.kr/file/WAS/display/Planning/';
const pc_css_src = `${baseLF}/plan_design/css/pc/default.css?${updateParam}`;
const mc_css_src = `${baseLF}/plan_design/css/m/default.css?${updateParam}`;
const js_src = `${baseLF}plan_design/js/planCommon.v2.js?${updateParam}`
function pad(n){
  return parseInt(n, 10) >= 10 ? n : `0${n}`;
}

function stringToHTML (str, custom) {
	var parser = new DOMParser();
	var doc = parser.parseFromString(str, 'text/html');
  if( custom ){
    return doc.body;
  } else {
    return doc.body.childNodes[0];
  }
};

const ctnsTemplate = (data) =>{
  const type = data.displayType === 'mobile' ? 'm' : 'w';
  const imgSrc = `${baseLF}${data.planNumber}${data.customDirectory}/${data.planNumber}_${type}_${pad(data.index+1)}.${data.ext}`;
  if( data.isLazy ){
    return `
    <div class="ctns">
      <div class="fix">
        <img
          src="${base64}"
          data-original="${imgSrc}"
          class="full-image plan-lazy"
          alt=""
        />
      </div>
    </div>
    `;
  } else {
    return `
    <div class="ctns">
      <div class="fix">
        <img src="${imgSrc}" class="full-image" alt="" />
      </div>
    </div>
    `;
  }
}

class swiperCtns {
  constructor(){
    const state = {
      display: false,
      imageExg: '',
      imageLen : 0,
      isLazy : false,
      spaceBetween: 0,
      slidesPerView: 1,
    }
  }
  html(){
    return `
<div class="plan-swiper plan-swiper-01 plan-swiper--right">
  <!-- Slider main container -->
  <div class="swiper-container">
    <!-- Additional required wrapper -->
    <div class="swiper-wrapper">
      <!-- Slides -->
      <div class="swiper-slide">
        <img src="//img.lfmall.co.kr/file/WAS/display/Planning/63665/63665_w_s_04_01.jpg" alt="" />
      </div>
    </div>
  </div>
  <div class="swiper-button-prev img-bg"></div>
  <div class="swiper-button-next img-bg"></div>
  <div class="swiper-pagination"></div>
</div>
    `;
  }
}

class couponCtns {

}

class cornerCtns {

}

class prdBtnCtns {

}

const options = {
  planNumber : '00000',
  displayType: 'pc',
  customDirectory: '',
  index : 0,
  ext: 'jpg',
  lazyIndex: 4,
  isLazy: false
}

class createCtns {
  constructor(set){
    const option = {...options, ...set};
    const html = ctnsTemplate(option);
    const dom = stringToHTML(html);

    Object.assign(this,{
      option,
      html,
      dom
    });

    this.event();
  }
  event(){
    const {option, dom} = this;
    dom.addEventListener('mouseenter', ()=>{
      tools.show(dom, option.index);
    });
  }
  iframe(){
    const mc = this.option.displayType === 'mobile' ? 'data-plan-iframe-mobile="true"' : '';
    this.html = `<div data-plan-iframe ${mc}></div>`;
    // this.dom.remove();
    this.dom = stringToHTML(this.html);
    // this.event();
  }
  swiper(){

  }
  nav(){

  }
  getDom(){
    const {dom} = this;
    return dom;
  }
  getHtml(){
    const {html} = this;
    return html;
  }
}


const workEditor = {
  ctns : [],
  states: {
    lazyIndex : 4,
    isLazyScript: false,
    isWide : true,
    planNumber : '',
    displayType : 'pc'
  },
  inputs : {
    planNumber : document.querySelector('#planNumber'),
    displayType: document.querySelector('input[name="displayType"]'),
    imagesLength : document.querySelector('#imagesLength'),
    customDirectory: document.querySelector('#customDirectory'),
    isLazyCheck : document.querySelector('#isLazy'),
    isWide : document.querySelector('#isWide'),
  },
  eles:{
    previewArea : document.querySelector('.preview'),
    btnDone : document.querySelector('#btnDone'),
    btnCopy : document.querySelector('#btnCopy'),
  },

  create(){
    const {inputs, states} = this;
    states.isWide = inputs.isWide.checked;
    states.isLazyCheck = inputs.isLazyCheck.checked;
    states.lazyIndex = states.isLazyCheck ? 4 : 10000;
    states.displayType = inputs.displayType.value;
    states.isLazyScript = states.isLazyCheck;
    states.planNumber = inputs.planNumber.value;
    if( inputs.planNumber.value === '' ){
      alert('기획전 번호를 입력 하세요.');
      return false;
    }
    if( inputs.imagesLength.value === '' ){
      alert('이미지 총 개수를 입력 하세요.')
      return false;
    }

    let index = 0;
    let max = parseInt(inputs.imagesLength.value, 10);

    for( index; index<max; index++ ){
      this.ctns.push(new createCtns({
        planNumber: inputs.planNumber.value,
        displayType : inputs.displayType.value,
        customDirectory: inputs.customDirectory.value,
        index,
        isLazy : states.lazyIndex < index,
        lazyIndex : states.lazyIndex
      }));
    }
    this.preview();
  },

  init(){
    const {eles} =this;
    eles.btnDone.addEventListener('click', this.create.bind(this));

    eles.btnCopy.addEventListener('click', this.copyHtml.bind(this));
  },
  copyHtml(){
    const fullhtml = this.fullHtml();
    if(window.clipboardData){
      window.clipboardData.setData("Text", fullhtml );
    } else {
      var tempElem = document.createElement('textarea');
      tempElem.value = fullhtml;
      document.body.appendChild(tempElem);

      tempElem.select();
      document.execCommand("copy");
      document.body.removeChild(tempElem);
    }
  },
  scriptBlock(){
    return `
    <script>
    $(function(){
      ${this.swiperScript()}
      ${this.lazyScript()}
    })
    </script>
    `;
  },
  swiperScript(){
    return '';
  },
  wrapHtml(insert){
    const {states} = this;
    const cssSrc = states.displayType === 'pc' ? pc_css_src : mc_css_src;
    const isMobile = states.displayType === 'mobile' ? 'is-mobile' : '';
    const wideClass = states.isWide && states.displayType === 'pc' ? 'plan-wide' : '';
    return `
  <link rel="stylesheet" href="${cssSrc}" />
  <div class="plan ${isMobile} ${wideClass} plan-${states.planNumber}">
    ${insert?insert():''}
  </div>
  <script type="text/javascript" src="${js_src}"></script>
    `
  },
  fullHtml(){
    const {ctns} = this;
    return `
    ${this.wrapHtml( ()=>{
      return ctns.map((val)=>{
        return val.getHtml();
      }).join('')
    } )}
    ${this.scriptBlock()}
    `
  },
  preview(){
    const {eles,states, ctns} = this;
    // const wrap = stringToHTML(this.wrapHtml(), true);
    eles.previewArea.innerHTML = this.wrapHtml();
    const plan = eles.previewArea.querySelector('.plan');
    const scriptBlock = this.scriptBlock();
    ctns.forEach( (element)=>{
      plan.appendChild(element.getDom());
    });

    if( states.isLazyScript ){
      $('.plan-lazy').lazyload({
        effect: 'fadeIn',
        threshold: 500,
        load: function () {
          $(this).removeAttr('data-original');
        },
      });
    }
  },
  lazyScript(){
    if( this.states.isLazyScript ){
      return `
    $('.plan-lazy').lazyload({
      effect: 'fadeIn',
      threshold: 500,
      load: function () {
        $(this).removeAttr('data-original');
      },
    });
      `
    } else {
      return '';
    }
  }
}

const tools = {
  ele : document.querySelector('.tools'),
  addIframeBtn : document.querySelector('#addIframe'),
  closeBtn : document.querySelector('#toolsClose'),
  target : '',
  show(element, index){
    if( parseInt(this.ele.dataset.index) !== index  ){
      this.target = element;
      this.ele.classList.add('active');
      this.ele.dataset.index = index;
      this.pos();
    }
  },
  pos(){
    const rect = this.target.getBoundingClientRect();
    this.ele.style.left = `${rect.x}px`;
    this.ele.style.width = `${rect.width}px`;
    this.ele.style.top = `${rect.y}px`;
    this.ele.style.height = `${rect.height}px`;
  },
  hide(){
    this.target = '';
    this.ele.classList.remove('active');
  },
  init(){
    this.closeBtn.addEventListener('click', ()=>{
      tools.hide();
    });
    this.addIframeBtn.addEventListener('click', ()=>{
      if( this.ele.dataset.index !== ''){
        const index = parseInt(this.ele.dataset.index, 10);
        workEditor.ctns[index].iframe();
        const htm = workEditor.ctns[index].getDom();
        this.target.after(htm);
        this.target.remove();
        this.hide();
        planIframe.planIframeAutoInit();
        this.addIframeBtn.remove();
      }
    });

    window.addEventListener('scroll', ()=>{
      if( this.target !== '' ){
        this.pos();
      }
    })
  }
}




tools.init();
workEditor.init();