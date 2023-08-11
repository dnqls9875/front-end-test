var getParam = function(key){
	var _parammap = {};
	document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
			function decode(s) {
					return decodeURIComponent(s.split("+").join(" "));
			}
			_parammap[decode(arguments[1])] = decode(arguments[2]);
	});
	return _parammap[key];
};
$(function(){
// var device = getParam('device');
//$('.inc_source').load('inc_'+device+'/'+getParam('plan')+'.html');
var device = document.querySelector('.is-mobile') ? 'm' : 'pc';

var flag = true, sizeName = 'px', mobile = (device == 'm')? true : false, btnLeft, btnTop, btnWidth, btnHeight, copyCss;
$('body').append('<textarea id="planCopyText" style="width:1px;height:1px;position:fixed;left:-9000px;top:-9000px;"></textarea>');

$('body').append('<div id="imagesGuide" style="display:block; width:0; height:0; z-index:999; position:fixed; background: #90e253; opacity:.3; left:0; top: 0;"></div>');

// $('body').append('<div id="flagGuide" style="display:block; width:0; height:0; z-index:9999; position:fixed; background: #0e1ab0; opacity:.5; left:0; top: 0;"></div>');
setTimeout(function(){


	var imgTarget = undefined;
	var guideElement = undefined;
	$('body')
		.on('keydown', function(event){
			if( event.ctrlKey && imgTarget){
				var rect = imgTarget.getBoundingClientRect();
				var src = imgTarget.getAttribute('src').split('/');
				$('#imagesGuide').text(src[src.length-1]);
				$('#imagesGuide').stop().css({
					width: rect.width,
					height: rect.height,
					top: rect.top,
					left: rect.left,
					display: 'block'
				});
			}
		})
		.on('keyup', function(){
			$('#imagesGuide').fadeOut('fast');
		})
	$('.ctns img')
		.on('mouseenter', function(e){
			imgTarget = e.target;
		})
		.on('mouseleave', function(){
			imgTarget = undefined;
		});

	$('.wrap,.ctns').on('click',function(e){
		// if(e.target.tagName != 'IMG'){
		// 	console.log('not img!');
		// 	return;
		// }
		var ctns = $(e.target).closest('.ctns');
		var tergetImg = e.target;
		var tergetImgRect = tergetImg.getBoundingClientRect();
		flag = !flag;
		if(mobile){
			sizeName = '%'
		}
		if(flag){
			console.log('%c' + ((flag) ? 'end' : 'start'),'text-shadow:3px 3px 3px rgba(0,0,0,0.2); color:#2bb835;');
		}else{
			console.log('%c' + ((flag) ? 'end' : 'start'),'text-shadow:3px 3px 3px rgba(0,0,0,0.2); color:#b8602b;');
		}

		if(flag){
			btnWidth = e.offsetX - btnLeft;
			btnHeight = e.offsetY - btnTop;
			$('body').off('mousemove.moveEvent');


			if(mobile){
				btnWidth = ((btnWidth / $(e.target).width()) * 100).toFixed(1);
				btnHeight = ((btnHeight / $(e.target).height()) * 100).toFixed(1);
				btnLeft = ((btnLeft / $(e.target).width()) * 100).toFixed(1);
				btnTop = ((btnTop / $(e.target).height()) * 100).toFixed(1);
			} else {
				btnWidth = btnWidth.toFixed(0);
				btnHeight = btnHeight.toFixed(0);
				btnLeft = btnLeft.toFixed(0);
				btnTop = btnTop.toFixed(0);
			}
			copyCss = 'width:' + Math.max(0, btnWidth) + sizeName + '; height:' + Math.max(0,btnHeight) + sizeName + '; top:' + Math.max(0,btnTop) + sizeName + '; left:' + Math.max(0, btnLeft) + sizeName + ';';
			if(window.clipboardData){
				window.clipboardData.setData("Text",copyCss);
			}else{
				$('#planCopyText').text('style="' + copyCss + '"').select();
				document.execCommand('copy');
				console.log('%c' + 'style="' + copyCss + '"','text-shadow:3px 3px 3px rgba(0,0,0,0.2); color:#3352db;');
			}
			guideElement.text(copyCss)
			guideElement = undefined;
		}else{
			btnLeft = e.offsetX;
			btnTop = e.offsetY;
			guideElement = $('<div style="display:block; width:0; height:0; z-index:9999; position:absolute; background: #0e1ab0; opacity:.5; left:0; top: 0; color:#fff;"></div>');
			guideElement.on('click', function(){
				$(this).remove();
			});
			$(tergetImg).parent().append(guideElement);
			guideElement.css({
				"display": "block",
				'left':  btnLeft,
				'top': btnTop
			});
			$('body').on('mousemove.moveEvent', function(event){
				guideElement.css({
					'width': Math.max(0, event.offsetX - btnLeft-1),
					'height': Math.max(0, event.offsetY - btnTop-1)
				});
			});
		}
	});
},500);
});