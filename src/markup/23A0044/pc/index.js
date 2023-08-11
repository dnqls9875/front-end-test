(function () {
  $.cachedScript = function (url, options) {
    // Allow user to set any option except for dataType, cache, and url
    options = $.extend(options || {}, {
      dataType: "script",
      cache: true,
      url: url,
    });

    // Use $.ajax() since it is more flexible than $.getScript
    // Return the jqXHR object so we can chain callbacks
    return jQuery.ajax(options);
  };

  $.cachedScript("https://unpkg.com/aos@2.3.4/dist/aos.js").done(function () {
    // code
    AOS.init({
      duration: 1000,
    });
    window.setTimeout(function () {
      AOS.refresh();
    }, 500);
  });

  // https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js

  if (window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
  }

  // navigation
  const fixedAreaStart = document.querySelector(
    ".kolon-cttd-guide--navigation"
  );
  const fixedAreaEnd = document.querySelector(".kolon-plan-end");
  const uiElements = document.querySelectorAll(".kolon-cttd-guide--hide");
  const stickyArea = document.querySelector(".kolon-cttd-tab");
  const fixedArea = stickyArea.querySelector(".kolon-cttd-tab__inner");
  const links = stickyArea.querySelectorAll(".kolon-cttd-tab__link");
  const fixedClass = "isFixed";
  const headerH = 71; // 코오롱몰 기획전 상세 상단 고정 헤더 영역 높이.
  let active = 0;
  window.addEventListener("scroll", function () {
    const boxY = fixedAreaStart.getBoundingClientRect().top;
    const boxH = fixedAreaEnd
      ? fixedAreaEnd.getBoundingClientRect().top - boxY
      : null;
    const stickyH = stickyArea.getBoundingClientRect().height;
    const scrollY = window.scrollY || window.pageYOffset;
    const boxOffsetY = boxY + scrollY;

    if (boxY - headerH < 0) {
      fixedArea.classList.add(fixedClass);
      if (boxH) {
        if (boxOffsetY + boxH - stickyH - headerH < scrollY) {
          fixedArea.style.top =
            -Math.min(stickyH + 10, scrollY - (boxOffsetY + boxH - stickyH)) +
            "px";
        } else {
          fixedArea.style.top = headerH + "px";
        }
      }
    } else {
      fixedArea.classList.remove(fixedClass);
    }

    uiElements.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const prevItem = uiElements[index + 1] || fixedAreaEnd;

      const y = rect.top - stickyH - headerH - 2;
      const h = prevItem ? prevItem.getBoundingClientRect().top - rect.top : 0;
      if (fixedAreaEnd) {
        if (y < 0 && -h < y) {
          active = index;
        }
      } else {
        if (y < 0) {
          active = index;
        }
      }
    });

    links.forEach((item, index) => {
      if (index === active) {
        item.parentElement.classList.add("active");
      } else {
        item.parentElement.classList.remove("active");
      }
    });
  });

  links.forEach((item) => {
    item.addEventListener("click", function (event) {
      const targetID = item.getAttribute("href");
      const target = document.querySelector(targetID);
      const addY = stickyArea.getBoundingClientRect().height;
      _scrollTo(target, addY);
      event.preventDefault();
      return false;
    });
  });

  function _scrollTo(target, addY) {
    const addYpos = addY || 0;
    const scrollY = window.scrollY || window.pageYOffset;
    const targetOffsetTop =
      target.getBoundingClientRect().top + scrollY - addYpos - headerH;
    $("html, body").animate(
      {
        scrollTop: targetOffsetTop,
      },
      "fast"
    );
  }

  $(".kolon-cttd-guide--navigation").parents(".kfOgUl").css("z-index", "5");

  $(".kolon-cttd-info__btn").on("click", function (event) {
    const target = this.dataset.info;
    $(target).slideToggle("fast");
    $(this).toggleClass("active");
    event.preventDefault();
    return false;
  });

  const io = new IntersectionObserver(
    (entrys) => {
      entrys.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) {
          target.classList.add("io-animation");
        } else {
          target.classList.remove("io-animation");
        }
      });
    },
    {
      root: null,
      threshold: 0.1,
      rootMargin: "10%",
    }
  );
  const ioElements = document.querySelectorAll("[data-io]");
  ioElements.forEach((item) => {
    io.observe(item);
  });
})();
