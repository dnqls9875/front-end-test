import $ from 'jquery';

export default function planToggle(){
  const elements = document.querySelectorAll('[data-plan-toggle]');
  if( elements ){
    elements.forEach(ele => {
      const id = ele.dataset.planToggle;
      const $target = $(id);
      ele.addEventListener('click', (event)=> {
        const isActive = ele.classList.contains('active');
        if( isActive ){
          ele.classList.remove('active');
          $target.removeClass('active')
            .slideUp('fast');
        } else {
          ele.classList.add('active');
          $target.slideDown('fast', ()=>{
            $target.addClass('active')
          });
        }
        event.preventDefault();
        return false;
      });
    });
  }
};