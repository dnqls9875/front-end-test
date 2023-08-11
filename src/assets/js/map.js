// var getParam = function (key) {
//   var _parammap = {};
//   document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
//     function decode(s) {
//       return decodeURIComponent(s.split("+").join(" "));
//     }
//     _parammap[decode(arguments[1])] = decode(arguments[2]);
//   });
//   return _parammap[key];
// };
$(function () {
  // var device = getParam('device');
  //$('.inc_source').load('inc_'+device+'/'+getParam('plan')+'.html');
  // var device = document.querySelector('.is-mobile') ? 'm' : 'pc';
  var device = "m";
  var flag = true,
    sizeName = "px",
    mobile = device == "m" ? true : false,
    btnLeft,
    btnTop,
    btnWidth,
    btnHeight,
    copyCss;
  $("body").append(
    '<textarea id="planCopyText" style="width:1px;height:1px;position:fixed;left:-9000px;top:-9000px;"></textarea>'
  );
  setTimeout(function () {
    $(".kolon-cttd-inner").click(function (e) {
      if (e.target.tagName != "IMG") {
        console.log("not img!");
        return;
      }
      flag = !flag;
      if (mobile) {
        sizeName = "%";
      }
      if (flag) {
        console.log(
          "%c" + (flag ? "end" : "start"),
          "text-shadow:3px 3px 3px rgba(0,0,0,0.2); color:#2bb835;"
        );
      } else {
        console.log(
          "%c" + (flag ? "end" : "start"),
          "text-shadow:3px 3px 3px rgba(0,0,0,0.2); color:#b8602b;"
        );
      }
      if (flag) {
        btnWidth = e.offsetX - btnLeft;
        btnHeight = e.offsetY - btnTop;
        if (mobile) {
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
        copyCss =
          "width:" +
          btnWidth +
          sizeName +
          "; height:" +
          btnHeight +
          sizeName +
          "; top:" +
          btnTop +
          sizeName +
          "; left:" +
          btnLeft +
          sizeName +
          ";";
        if (window.clipboardData) {
          window.clipboardData.setData("Text", copyCss);
        } else {
          $("#planCopyText")
            .text('style="' + copyCss + '"')
            .select();
          document.execCommand("copy");
          console.log(
            "%c" + 'style="' + copyCss + '"',
            "text-shadow:3px 3px 3px rgba(0,0,0,0.2); color:#3352db;"
          );
        }
      } else {
        btnLeft = e.offsetX;
        btnTop = e.offsetY;
      }
    });
  }, 500);
});
