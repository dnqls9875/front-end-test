
const planIframe = {
  iframeGenerator,
  planIframeAutoInit,
  postIframeSize(){} // 캐시로 불필요하게 실행시 오류 방지를 위해 임시로 넣어둠.
};


// 문자를 포함하는 랜덤 문자열을 리턴함.
function randomString(length = 5) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// iframeGenerator 기본 옵션
const defaultOptions={
  target:document.querySelector('#planIframeWrap'),
  src:"//img.lfmall.co.kr/file/WAS/display/Planning/plan_design/iframe/html/pc.html",
  className:"plan-auto-iframe",
  id:"planIframe",
  loading:"eager",
  isRandomParm:true,
  isMobile:false,
  callback:undefined
}

// iframe html 을 생성함.
// 캐시 문제 등으로 원본 html 이 수정 되어도 새로 고쳐 지지 않는 문제가 있기 때문에, src 속성에 난수 파라미터를 추가함.
function iframeGenerator(options){
  let opt = {...defaultOptions, ...options};
  const randomNum = opt.isRandomParm ? `?${randomString()}` : '';
  const width = '100%';
  const style = opt.isMobile ? 'height:100%;position:absolute;top:0;left:0' : 'height:820px';
  const htm = `<iframe
      src="${opt.src}${randomNum}"
      scrolling="no"
      id="${opt.id}"
      class="${opt.className}"
      loading="${opt.loading}"
      style="width:${width}; ${style}"
    ></iframe>`;
  if( opt.target ) {
    opt.target.innerHTML = htm;
    if(opt.isMobile){
      opt.target.style.position = 'relative';
      opt.target.style.paddingBottom = '136%';
    }
    if( typeof opt.callback === 'function' ) {
      opt.callback();
    }
  }
}


function planIframeAutoInit(){

  const mobileSrc = "//img.lfmall.co.kr/file/WAS/display/Planning/plan_design/iframe/html/mobile.html";
  const pcSrc = "//img.lfmall.co.kr/file/WAS/display/Planning/plan_design/iframe/html/pc.html";
  const target = document.querySelector('[data-plan-iframe]');
  const isMobile = target.dataset.planIframeMobile === "true";
  const src = (()=>{
    if( isMobile ) {
      return target.dataset.planIframe || mobileSrc;
    } else {
      return target.dataset.planIframe || pcSrc;
    }
  })();



  const className = target.dataset.planIframeClass || 'plan-auto-iframe';
  const id = target.dataset.planIframeId || 'planIframe';
  const loading = target.dataset.planIframeLoading || 'eager';
  const isRandomParm = (()=>{
    if( target.dataset.planIframeRandomParam ){
      return target.dataset.planIframeRandomParam === 'true';
    } else {
      return true;
    }
  })();

  if( target && !target.querySelector('iframe') ){
    iframeGenerator({
      target,
      src,
      className,
      id,
      loading,
      isRandomParm,
      isMobile,
    });
  }
}

export default planIframe;
