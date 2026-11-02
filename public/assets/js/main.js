(function ($) {
  "use strict";

  /*
  |=====================================================================
  | Template Name: Jewlfy
  | Author: Laralink
  | Version: 1.0.0
  |=====================================================================
  |=====================================================================
  | TABLE OF CONTENTS:
  |=====================================================================
  |
  | 01. Preloader
  | 02. Offer Modal
  | 03. Mobile Menu
  | 04. Sticky Header
  | 05. Dynamic Background
  | 06. Swiper Slider
  | 07. Language Select
  | 08. Counter Animation
  | 09. Modal Video
  | 10. Review
  | 11. Tabs
  | 12. Lightgallery
  | 13. Accordian
  | 14. FAQ Filter
  | 15. Product Filter
  | 16. Scroll Up
  | 17. Product Filter Sidebar
  | 18. Ecommerce
  | 19. Countdown Timer
  | 20. Toast Notifications
  | 21. Price Range Slider
  | 22. Shop Layout View
  |
  */

  /*====================================================================
    Scripts initialization
  ======================================================================*/
  $.exists = function (selector) {
    return $(selector).length > 0;
  };

  var angularShell = window.__COQUETERIA_ANGULAR__ === true;

  $(window).on("load", function () {
    preloader();
    if (!angularShell) offerModal();
  });

  $(function () {
    mainNav();
    stickyHeader();
    dynamicBackground();
    swiperInit();
    counterInit();
    modalVideo();
    review();
    tabs();
    lightGallery();
    accordian();
    dataFilterInit();
    productFilterInit();
    if (!angularShell) scrollUp();
    filterSidebar();
    ecommerceInit();
    countdownTimer();
    priceRangeSlider();
    shopLayoutView();
    // Nice Select
    $(".nice_select").niceSelect();

    // Dynamic year as footer text
    if ($.exists(".cs_getting_year")) {
      const date = new Date();
      $(".cs_getting_year").text(date.getFullYear());
    }
  });
  /*=============================================================
   Run on window Scroll
  ===============================================================*/
  $(window).on("scroll", function () {
    stickyHeader();
    if (!angularShell) showScrollUp();
  });
  /*=============================================================
   Run on window resize
  ===============================================================*/
  $(window).on("resize", function () {
    if (!angularShell) resetNavOnDesktop();
  });
  /*=============================================================
    01. Preloader
  ===============================================================*/
  function preloader() {
    var $preloader = $(".cs_preloader");
    if (!$preloader.length) return;
    $preloader.addClass("cs_loaded");
    setTimeout(function () {
      $preloader.remove();
    }, 600);
  }
  /*=============================================================
    02. Offer Modal
  ===============================================================*/
  function offerModal() {
    $("[data-offer-modal]").each(function () {
      var $mount = $(this);
      var cfg = {
        thumb: $mount.data("thumb") || "assets/img/offer-banner-1.jpg",
        badge: $mount.data("badge") || "Limited Time Offer",
        discount: $mount.data("discount") || "30%",
        discountSuffix: $mount.data("discountSuffix") || "OFF",
        title: $mount.data("title") || "On Your First Purchase",
        subtitle:
          $mount.data("subtitle") ||
          "Discover timeless elegance. Enjoy an exclusive discount on our entire jewelry collection.",
        code: $mount.data("code") || "JEWEL30",
        link: $mount.data("link") || "shop.html",
        btn: $mount.data("btn") || "Shop Now",
        delay: parseInt($mount.data("delay"), 10),
        once: $mount.data("once") !== false,
      };
      if (isNaN(cfg.delay)) cfg.delay = 800;
      var storeKey = "offerModalShown:" + (cfg.code || cfg.title);

      var $coupon = cfg.code
        ? '<div class="cs_offer_coupon">Use code <b>' + cfg.code + "</b></div>"
        : "";
      var $modal = $(
        '<div class="cs_offer_modal">' +
          '<div class="cs_offer_modal_overlay" data-offer-close></div>' +
          '<div class="cs_offer_modal_in">' +
          '<button type="button" class="cs_offer_modal_close" data-offer-close aria-label="Close offer">' +
          '<i class="ri-close-line"></i>' +
          "</button>" +
          '<div class="cs_offer_modal_thumb" style="background-image: url(' +
          cfg.thumb +
          ');"></div>' +
          '<div class="cs_offer_modal_content">' +
          '<span class="cs_offer_badge">' +
          cfg.badge +
          "</span>" +
          '<h2 class="cs_offer_discount"><span>' +
          cfg.discount +
          "</span> " +
          cfg.discountSuffix +
          "</h2>" +
          '<h3 class="cs_offer_title">' +
          cfg.title +
          "</h3>" +
          '<p class="cs_offer_subtitle">' +
          cfg.subtitle +
          "</p>" +
          $coupon +
          '<div><a href="' +
          cfg.link +
          '" class="cs_btn_style_1">' +
          cfg.btn +
          "</a></div>" +
          "</div>" +
          "</div>" +
          "</div>",
      );
      var mountId = $mount.attr("id");
      if (mountId) $modal.attr("id", mountId);
      $mount.replaceWith($modal);

      function closeModal() {
        $modal.removeClass("active");
        $("body").css("overflow", "");
      }

      if (cfg.once && sessionStorage.getItem(storeKey)) return;

      // Open shortly after the page has fully loaded.
      setTimeout(function () {
        $modal.addClass("active");
        $("body").css("overflow", "hidden");
        if (cfg.once) sessionStorage.setItem(storeKey, "1");
      }, cfg.delay);

      // Close on overlay / close button click.
      $modal.on("click", "[data-offer-close]", function (e) {
        e.preventDefault();
        closeModal();
      });

      // Close on Escape key.
      $(document).on("keydown", function (e) {
        if (e.key === "Escape" && $modal.hasClass("active")) closeModal();
      });
    });
  }
  /*=============================================================
    03. Mobile Menu
  ===============================================================*/
  function mainNav() {
    if (!angularShell) {
      $(".cs_nav").append('<span class="cs_menu_toggle"><span></span></span>');
    }
    $(".menu-item-has-children").append(
      '<span class="cs_menu_dropdown_toggle"><span></span></span>',
    );
    if (angularShell) {
      $(".cs_menu_dropdown_toggle").on("click", function () {
        $(this).toggleClass("active").siblings("ul").slideToggle();
        $(this).parent().toggleClass("active");
      });
      return;
    }
    $(".cs_menu_toggle").on("click", function () {
      $(this)
        .toggleClass("active")
        .siblings(".cs_nav_list_wrapper")
        .toggleClass("active");
      $(".cs_close_nav").toggleClass("active");
    });

    $(".cs_menu_dropdown_toggle").on("click", function () {
      $(this).toggleClass("active").siblings("ul").slideToggle();
      $(this).parent().toggleClass("active");
    });
    //Header Search Toggle
    $(".cs_search_btn").on("click", function () {
      $(".cs_header_search").addClass("active");
      $(".cs_user_content").slideUp();
    });
    $(".cs_close, .cs_sidenav_overlay").on("click", function () {
      $(".cs_sidenav, .cs_header_search").removeClass("active");
    });
    //Side Header Toggle
    $(".cs_close_nav").on("click", function () {
      $(this)
        .toggleClass("active")
        .parent(".cs_nav_list_wrapper")
        .toggleClass("active");
      $(".cs_menu_toggle").toggleClass("active");
    });
  }
  /*=============================================================
    Reset mobile nav state at the desktop breakpoint
  ===============================================================*/
  function resetNavOnDesktop() {
    if (!window.matchMedia("(min-width: 1200px)").matches) return;
    $(".cs_submenu, .cs_mega_menu").css({
      display: "",
      height: "",
      overflow: "",
    });
    $(".cs_nav_list_wrapper, .cs_menu_toggle, .cs_close_nav").removeClass(
      "active",
    );
    $(".cs_menu_dropdown_toggle, .menu-item-has-children").removeClass(
      "active",
    );
  }
  /*=============================================================
    04. Sticky Header
  ===============================================================*/
  function stickyHeader() {
    var scroll = $(window).scrollTop();
    if (scroll >= 10) {
      $(".cs_sticky_header").addClass("cs_sticky_active");
    } else {
      $(".cs_sticky_header").removeClass("cs_sticky_active");
    }
  }
  /*=============================================================
    05. Dynamic Background
  ===============================================================*/
  function dynamicBackground() {
    $("[data-src]").each(function () {
      var src = $(this).attr("data-src");
      $(this).css({
        "background-image": "url(" + src + ")",
      });
    });
  }
  /*============================================================
    06. Swiper Slider
  ==============================================================*/
  function swiperInit() {
    // Thumbs gallery
    function resolveThumbs($mainEl, selector) {
      if (!selector) return null;
      // Product Thumb
      if (selector === 1 || selector === "1" || selector === true) {
        return $mainEl
          .closest(".cs_product_gallery")
          .find(".cs_product_gallery_thumbs")
          .first();
      }
      var $t = $(selector).first();
      if (!$t.length) {
        var $scope = $mainEl.closest(".slider-section");
        if ($scope.length) $t = $scope.find(selector).first();
      }
      return $t;
    }

    // Build the thumbnail Swiper
    function buildThumbsSwiper($thumbsEl) {
      if (!$thumbsEl || !$thumbsEl.length) return null;
      if (!$thumbsEl.find(".swiper-wrapper").length) return null;

      if ($thumbsEl[0].swiper) {
        $thumbsEl[0].swiper.destroy(true, true);
      }

      var base = parseInt($thumbsEl.data("slides-per-view")) || 4;
      var gap = parseInt($thumbsEl.data("gap")) || 24;
      var thumbsLoop = Boolean(parseInt($thumbsEl.data("loop"), 10));

      // Per-breakpoint count; falls back to the base value when not set.
      function tier(attr) {
        return parseInt($thumbsEl.data(attr)) || base;
      }

      // Vertical Derection
      var isVertical = $thumbsEl.data("direction") === "vertical";
      $thumbsEl
        .toggleClass("cs_thumbs_vertical", isVertical)
        .closest(".cs_product_gallery")
        .toggleClass("cs_gallery_thumbs_vertical", isVertical);

      // A vertical strip with auto height
      if (isVertical) {
        var slideH =
          $thumbsEl.find(".swiper-slide").first().outerHeight() || 135;
        $thumbsEl.css({
          height: base * slideH + (base - 1) * gap + "px",
          overflow: "hidden",
        });
      } else {
        $thumbsEl.css({ height: "", overflow: "" });
      }

      // Slider Arrow Button.
      var showThumbArrows = parseInt($thumbsEl.data("pagination")) === 1;
      var $thumbPrev = null;
      var $thumbNext = null;
      if (showThumbArrows) {
        // Remove any arrows from a previous.
        $thumbsEl.children(".cs_thumbs_arrow").remove();
        var prevIcon = isVertical
          ? "ri-arrow-up-s-line"
          : "ri-arrow-left-s-line";
        var nextIcon = isVertical
          ? "ri-arrow-down-s-line"
          : "ri-arrow-right-s-line";
        $thumbPrev = $(
          '<button type="button" class="cs_thumbs_arrow cs_thumbs_prev" aria-label="Previous thumbnails"><i class="' +
            prevIcon +
            '"></i></button>',
        );
        $thumbNext = $(
          '<button type="button" class="cs_thumbs_arrow cs_thumbs_next" aria-label="Next thumbnails"><i class="' +
            nextIcon +
            '"></i></button>',
        );
        $thumbsEl.append($thumbPrev, $thumbNext);
      }

      var thumbsOptions = {
        direction: isVertical ? "vertical" : "horizontal",
        slidesPerView: base,
        spaceBetween: gap,
        loop: thumbsLoop,
        freeMode: true,
        watchSlidesProgress: true,
        watchOverflow: true,
        breakpoints: {
          0: { slidesPerView: tier("xsm-slides"), spaceBetween: gap },
          431: { slidesPerView: tier("sm-slides"), spaceBetween: gap },
          576: { slidesPerView: tier("mini-tab-slides"), spaceBetween: gap },
          768: { slidesPerView: tier("tab-slides"), spaceBetween: gap },
          992: { slidesPerView: tier("desktop-slides"), spaceBetween: gap },
          1200: {
            slidesPerView: tier("large-desktop-slides"),
            spaceBetween: gap,
          },
          1400: {
            slidesPerView: tier("extra-large-slides"),
            spaceBetween: gap,
          },
        },
      };

      if (showThumbArrows) {
        thumbsOptions.navigation = {
          prevEl: $thumbPrev[0],
          nextEl: $thumbNext[0],
        };
      }

      return new Swiper($thumbsEl[0], thumbsOptions);
    }
    // Thumb Controller hides
    var thumbsTargets = [];
    $(".swiper[data-thumbs]").each(function () {
      var $main = $(this);
      var thumbsAttr = $main.attr("data-thumbs");
      var hideThumbs = !thumbsAttr || thumbsAttr === "0";
      // Thumbnail strip alongside gallery
      var $t = hideThumbs
        ? $main
            .closest(".cs_product_gallery")
            .find(".cs_product_gallery_thumbs")
            .first()
        : resolveThumbs($main, thumbsAttr);

      if ($t && $t.length) {
        thumbsTargets.push($t[0]);
        $t.toggleClass("cs_thumbs_hidden", hideThumbs);
      }
    });

    $(".swiper").each(function () {
      var $swiperEl = $(this);

      // Skip thumbnail strips.
      if ($.inArray(this, thumbsTargets) !== -1) return;

      var $wrapper = $swiperEl.find(".swiper-wrapper");
      var $slides = $wrapper.find(".swiper-slide");
      var totalSlides = $slides.length;

      if (!$wrapper.length) return;

      // ===== DATA ATTRIBUTES =====
      var autoplayVal = Boolean(parseInt($swiperEl.data("autoplay"), 10));
      var loopVal = Boolean(parseInt($swiperEl.data("loop"), 10));
      var centerVal = Boolean(parseInt($swiperEl.data("center"), 10));
      var variableVal = Boolean(parseInt($swiperEl.data("variable-width"), 10));
      var speedVal = parseInt($swiperEl.data("speed")) || 600;
      var isResponsiveMode = $swiperEl.data("slides-per-view") === "responsive";
      var isSingleSlideMode = parseInt($swiperEl.data("slides-per-view")) === 1;

      var slidesPerView = !isResponsiveMode
        ? parseInt($swiperEl.data("slides-per-view")) || 1
        : 1;

      var effect = $swiperEl.data("effect") || "slide";
      var spaceBetween = parseInt($swiperEl.data("gap")) || 24;
      var autoHeight = parseInt($swiperEl.data("auto-height")) === 1;
      var keyboardEnabled = parseInt($swiperEl.data("keyboard")) === 1;
      var mousewheelEnabled = parseInt($swiperEl.data("mousewheel")) === 1;
      var marqueeVal = Boolean(parseInt($swiperEl.data("marquee"), 10));
      var parallaxVal = Boolean(parseInt($swiperEl.data("parallax"), 10));
      var directionVal =
        $swiperEl.data("direction") === "vertical" ? "vertical" : "horizontal";

      // ===== THUMBS GALLERY =====
      var thumbsSwiper = $swiperEl.data("thumbs")
        ? buildThumbsSwiper(resolveThumbs($swiperEl, $swiperEl.data("thumbs")))
        : null;

      // ===== RESPONSIVE VALUES =====
      var xsmSlides =
        parseInt($swiperEl.data("xsm-slides")) ||
        parseInt($swiperEl.data("mobile-slides")) ||
        1;
      var smSlides = parseInt($swiperEl.data("sm-slides")) || xsmSlides;
      var miniTabSlides = parseInt($swiperEl.data("mini-tab-slides")) || 2;
      var tabSlides = parseInt($swiperEl.data("tab-slides")) || miniTabSlides;
      var desktopSlides = parseInt($swiperEl.data("desktop-slides")) || 3;
      var largeDesktopSlides =
        parseInt($swiperEl.data("large-desktop-slides")) || desktopSlides;
      var extraLargeSlides =
        parseInt($swiperEl.data("extra-large-slides")) || largeDesktopSlides;

      var xsmGap = parseInt($swiperEl.data("xsm-gap")) || spaceBetween;
      var smGap = parseInt($swiperEl.data("sm-gap")) || spaceBetween;
      var miniTabGap =
        parseInt($swiperEl.data("mini-tab-gap")) ||
        parseInt($swiperEl.data("tablet-gap")) ||
        spaceBetween;
      var tabGap = parseInt($swiperEl.data("tab-gap")) || spaceBetween;
      var desktopGap = parseInt($swiperEl.data("desktop-gap")) || spaceBetween;
      var largeDesktopGap =
        parseInt($swiperEl.data("large-desktop-gap")) || spaceBetween;
      var extraLargeGap =
        parseInt($swiperEl.data("extra-large-gap")) || spaceBetween;

      // ===== NAVIGATION =====
      var $prevBtn = $swiperEl.find(".slider-prev");
      var $nextBtn = $swiperEl.find(".slider-next");

      if (!$prevBtn.length) {
        $prevBtn = $swiperEl.closest(".slider-section").find(".slider-prev");
      }
      if (!$nextBtn.length) {
        $nextBtn = $swiperEl.closest(".slider-section").find(".slider-next");
      }

      // ===== PAGINATION =====
      var $pagination = $swiperEl.find(".swiper-pagination");
      var paginationType = $swiperEl.data("pagination-type") || "fraction";
      var showPagination = parseInt($swiperEl.data("pagination")) !== 0;

      if (!$pagination.length) {
        $pagination = $swiperEl.siblings(".swiper-pagination");
      }

      // ===== VARIABLE WIDTH =====
      var enableVariableWidth = variableVal === true;

      // ===== OVERRIDE FOR SINGLE SLIDE MODE =====
      if (isSingleSlideMode) {
        isResponsiveMode = false;
      }

      // ===== FIXED slidesPerView =====
      var finalSlidesPerView;

      if (isResponsiveMode && !isSingleSlideMode) {
        finalSlidesPerView = enableVariableWidth ? "auto" : xsmSlides;
      } else {
        finalSlidesPerView = 1;
      }

      // ===== BREAKPOINTS =====
      var breakpointsObj = {};

      if (isResponsiveMode && !isSingleSlideMode) {
        breakpointsObj = enableVariableWidth
          ? {
              0: { slidesPerView: "auto", spaceBetween: xsmGap },
              431: { slidesPerView: "auto", spaceBetween: smGap },
              576: { slidesPerView: "auto", spaceBetween: miniTabGap },
              768: { slidesPerView: "auto", spaceBetween: tabGap },
              992: { slidesPerView: "auto", spaceBetween: desktopGap },
              1200: { slidesPerView: "auto", spaceBetween: largeDesktopGap },
              1400: { slidesPerView: "auto", spaceBetween: extraLargeGap },
            }
          : {
              0: { slidesPerView: xsmSlides, spaceBetween: xsmGap },
              431: { slidesPerView: smSlides, spaceBetween: smGap },
              576: { slidesPerView: miniTabSlides, spaceBetween: miniTabGap },
              768: { slidesPerView: tabSlides, spaceBetween: tabGap },
              992: { slidesPerView: desktopSlides, spaceBetween: desktopGap },
              1200: {
                slidesPerView: largeDesktopSlides,
                spaceBetween: largeDesktopGap,
              },
              1400: {
                slidesPerView: extraLargeSlides,
                spaceBetween: extraLargeGap,
              },
            };
      } else {
        breakpointsObj = {
          0: { slidesPerView: 1, spaceBetween: xsmGap },
          431: { slidesPerView: 1, spaceBetween: smGap },
          576: { slidesPerView: 1, spaceBetween: miniTabGap },
          768: { slidesPerView: 1, spaceBetween: tabGap },
          992: { slidesPerView: 1, spaceBetween: desktopGap },
          1200: { slidesPerView: 1, spaceBetween: largeDesktopGap },
          1400: { slidesPerView: 1, spaceBetween: extraLargeGap },
        };
      }

      // ===== OPTIONS =====
      var swiperOptions = {
        slidesPerView: finalSlidesPerView,
        spaceBetween: spaceBetween,
        direction: directionVal,
        speed: speedVal,
        loop: loopVal,
        autoHeight: autoHeight,
        centeredSlides: centerVal,
        effect: effect,
        parallax: parallaxVal,
        grabCursor: true,
        watchOverflow: true,
        breakpoints: breakpointsObj,

        autoplay: autoplayVal
          ? {
              delay: 3000,
              disableOnInteraction: false,
            }
          : false,
      };

      // ===== DYNAMIC EFFECT CONFIG (data-effect) =====
      switch (effect) {
        case "fade":
          swiperOptions.fadeEffect = { crossFade: true };
          break;
        case "coverflow":
          swiperOptions.coverflowEffect = {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          };
          break;
        case "flip":
          swiperOptions.flipEffect = { slideShadows: true };
          break;
        case "cube":
          swiperOptions.cubeEffect = {
            shadow: true,
            slideShadows: true,
            shadowOffset: 20,
            shadowScale: 0.94,
          };
          break;
        case "cards":
          swiperOptions.cardsEffect = { slideShadows: true };
          break;
        case "creative":
          swiperOptions.creativeEffect = {
            prev: { shadow: true, translate: [0, 0, -400] },
            next: { translate: ["100%", 0, 0] },
          };
          break;
      }

      // ===== THUMBS =====
      if (thumbsSwiper) {
        swiperOptions.thumbs = { swiper: thumbsSwiper };
      }

      // ===== NAVIGATION =====
      if ($prevBtn.length && $nextBtn.length) {
        swiperOptions.navigation = {
          nextEl: $nextBtn[0],
          prevEl: $prevBtn[0],
        };
      }

      // ===== PAGINATION =====
      if (showPagination && $pagination.length) {
        swiperOptions.pagination = {
          el: $pagination[0],
          clickable: true,
          type:
            paginationType === "fraction"
              ? "fraction"
              : paginationType === "progressbar"
                ? "progressbar"
                : "bullets",
          // Slider Controller Index.
          formatFractionCurrent: function (number) {
            return number < 10 ? "0" + number : number;
          },
          formatFractionTotal: function (number) {
            return number < 10 ? "0" + number : number;
          },
        };
      }

      // ===== MARQUEE (continuous horizontal text slider)
      if (marqueeVal) {
        swiperOptions.loop = true;
        swiperOptions.slidesPerView = "auto";
        swiperOptions.allowTouchMove = true;
        swiperOptions.speed = speedVal;
        swiperOptions.autoplay = {
          delay: 0,
          disableOnInteraction: true,
        };
        swiperOptions.navigation = false;
        swiperOptions.pagination = false;
      }

      // ===== DESTROY OLD =====
      if ($swiperEl[0].swiper) {
        $swiperEl[0].swiper.destroy(true, true);
      }

      // ===== VARIABLE WIDTH CSS =====
      if (enableVariableWidth && !isSingleSlideMode) {
        $slides.css({
          width: "auto",
          flexShrink: 0,
        });
        $wrapper.css("display", "flex");
      }

      // ===== INIT =====
      var swiperInstance = new Swiper($swiperEl[0], swiperOptions);

      // ===== MARQUEE: constant (linear) movement =====
      if (marqueeVal) {
        $wrapper.css("transition-timing-function", "linear");
      }

      // ===== ARROW VISIBILITY =====
      function updateArrows() {
        if (!$prevBtn.length || !$nextBtn.length) return;

        if (loopVal) {
          $prevBtn.show();
          $nextBtn.show();
          return;
        }

        var currentView = finalSlidesPerView;

        if (isResponsiveMode && !enableVariableWidth && !isSingleSlideMode) {
          var w = window.innerWidth;

          if (w >= 1400) currentView = extraLargeSlides;
          else if (w >= 1200) currentView = largeDesktopSlides;
          else if (w >= 992) currentView = desktopSlides;
          else if (w >= 768) currentView = tabSlides;
          else if (w >= 576) currentView = miniTabSlides;
          else if (w >= 431) currentView = smSlides;
          else currentView = xsmSlides;
        } else if (isSingleSlideMode) {
          currentView = 1;
        }

        if (totalSlides > currentView) {
          $prevBtn.show();
          $nextBtn.show();
        } else {
          $prevBtn.hide();
          $nextBtn.hide();
        }
      }

      setTimeout(function () {
        swiperInstance.update();
        updateArrows();
      }, 100);

      swiperInstance.on("resize breakpoint slideChange", function () {
        updateArrows();
      });
    });
  }
  /*===========================================================
    08. Counter Animation
  =============================================================*/
  function counterInit() {
    if (!$.exists(".odometer")) return;

    const observer = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const el = $(entry.target);
            el.html(el.data("count-to"));
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.3,
      },
    );

    $(".odometer").each(function () {
      observer.observe(this);
    });
  }
  /*============================================================
    09. Modal Video
  ==============================================================*/
  function modalVideo() {
    if ($.exists(".cs_video_open")) {
      $("body").append(`
        <div class="cs_video_popup">
          <div class="cs_video_popup-overlay"></div>
          <div class="cs_video_popup-content">
            <div class="cs_video_popup-layer"></div>
            <div class="cs_video_popup_container">
              <div class="cs_video_popup-align">
                <div class="embed-responsive embed-responsive-16by9">
                  <iframe class="embed-responsive-item" src="about:blank"></iframe>
                </div>
              </div>
              <div class="cs_video_popup_close"></div>
            </div>
          </div>
        </div>
      `);
      $(document).on("click", ".cs_video_open", function (e) {
        e.preventDefault();
        var video = $(this).attr("href");

        $(".cs_video_popup_container iframe").attr("src", `${video}`);

        $(".cs_video_popup").addClass("active");
      });
      $(".cs_video_popup_close, .cs_video_popup-layer").on(
        "click",
        function (e) {
          $(".cs_video_popup").removeClass("active");
          $("html").removeClass("overflow-hidden");
          $(".cs_video_popup_container iframe").attr("src", "about:blank");
          e.preventDefault();
        },
      );
    }
  }
  /*============================================================
    10. Review
  ==============================================================*/
  function review() {
    $(".cs_rating").each(function () {
      var review = $(this).data("rating");
      var reviewVal = review * 20 + "%";
      $(this).find(".cs_rating_percentage").css("width", reviewVal);
    });
  }
  /*============================================================
    11. Tabs
  ===============================================================*/
  function tabs() {
    $(".cs_tab_links > li > a").on("click", function (e) {
      var currentAttrValue = $(this).attr("href");
      //Tab and slider both activation code
      $(".cs_tabs " + currentAttrValue)
        .addClass("active")
        .siblings()
        .removeClass("active");
      $(this).parents("li").addClass("active").siblings().removeClass("active");
      e.preventDefault();
    });
  }
  /*===========================================================
    12. Lightgallery
  =============================================================*/
  function lightGallery() {
    $(".cs_lightgallery").each(function () {
      $(this).lightGallery({
        selector: ".cs_lightbox_item",
        subHtmlSelectorRelative: false,
        thumbnail: true,
        mousewheel: true,
      });
    });
  }
  /*===========================================================
    13. Accordian
  =============================================================*/
  function accordian() {
    $(".cs_accordian").children(".cs_accordian_body").hide();
    $(".cs_accordian.active").children(".cs_accordian_body").show();
    $(".cs_accordian_head").on("click", function () {
      $(this)
        .parent(".cs_accordian")
        .siblings()
        .children(".cs_accordian_body")
        .slideUp(250);
      $(this).siblings().slideDown(400);
      $(this)
        .parents(".col-lg-6")
        .siblings()
        .find(".cs_accordian_body")
        .slideUp(250);
      /* Accordian Active Class */
      $(this).parents(".cs_accordian").addClass("active");
      $(this).parent(".cs_accordian").siblings().removeClass("active");
      $(this)
        .parents(".col-lg-6")
        .siblings()
        .find(".cs_accordian")
        .removeClass("active");
    });
  }
  /*===========================================================
    14. FAQ Filter
  =============================================================*/
  function dataFilterInit() {
    $(".cs_faq_filter a").on("click", function (e) {
      e.preventDefault();
      var filter = $(this).attr("data-filter");
      $(this).parent("li").addClass("active").siblings().removeClass("active");

      var $items = $(".cs_accordians_style_1 .cs_accordian");
      if (filter === "all") {
        $items.show();
      } else {
        $items.hide();
        $items.filter('[data-filter="' + filter + '"]').show();
      }
    });
  }
  /*===========================================================
    15. Product Filter
  =============================================================*/
  function productFilterInit() {
    // Discover Collections Filter (grid, data-category)
    $(".cs_filter_nav").each(function () {
      var $nav = $(this);
      var $btns = $nav.find(".cs_filter_btn");
      var $grid = $nav
        .closest(".cs_products_filter_tabs")
        .find(".cs_discover_grid");
      var $items = $grid.find(".cs_filter_item");

      $btns.on("click", function () {
        var $btn = $(this);
        if ($btn.hasClass("active")) return;

        var filter = $btn.attr("data-filter");
        $btns.removeClass("active");
        $btn.addClass("active");

        if (filter === "all") {
          $items.show();
        } else {
          $items.hide();
          $items.filter('[data-category~="' + filter + '"]').show();
        }
      });
    });

    // Filterable Product Slider
    $(".cs_product_filter_section").each(function () {
      var $section = $(this);
      var $slider = $section.find(".cs_product_filter_slider");
      if (!$slider.length) return;

      var $wrapper = $slider.find(".swiper-wrapper");
      var $buttons = $section.find(".cs_filter_btn");
      var allSlides = $wrapper.children(".swiper-slide").toArray();

      $buttons.on("click", function () {
        var $btn = $(this);
        if ($btn.hasClass("active")) return;

        var filter = $btn.attr("data-filter");
        $buttons.removeClass("active");
        $btn.addClass("active");

        var swiper = $slider[0].swiper;
        // How many slides fit in the visible area at the current breakpoint.
        var perView =
          swiper && typeof swiper.params.slidesPerView === "number"
            ? swiper.params.slidesPerView
            : 1;
        var minToSlide = Math.ceil(perView) + 1;
        // Split slides into the ones matching the active category and the rest.
        var matching = [];
        var others = [];
        allSlides.forEach(function (slide) {
          if (filter === "all" || $(slide).attr("data-category") === filter) {
            matching.push(slide);
          } else {
            others.push(slide);
          }
        });

        // Rebuild the wrapper: matching slides first, then fill from other
        $wrapper.children(".swiper-slide").detach();
        matching.forEach(function (slide) {
          $wrapper.append(slide);
        });
        for (
          var i = 0;
          i < others.length && matching.length + i < minToSlide;
          i++
        ) {
          $wrapper.append(others[i]);
        }

        // Let Swiper recalculate the filtered items
        if (swiper) {
          // Rebuild loop duplicates for the new set of slides
          if (swiper.params.loop && swiper.loopDestroy) {
            swiper.loopDestroy();
            swiper.loopCreate();
          }
          swiper.update();
          swiper.slideTo(0, 0);
          if (swiper.navigation) swiper.navigation.update();

          // Marquee/autoplay stops after the DOM rebuild
          if (swiper.autoplay) {
            swiper.autoplay.stop();
            swiper.autoplay.start();
          }
        }
      });
    });
  }
  /*===========================================================
    16. Scroll Up
  =============================================================*/
  function scrollUp() {
    $(".cs_scrollup_btn").on("click", function (e) {
      e.preventDefault();
      $("html,body").animate(
        {
          scrollTop: 0,
        },
        0,
      );
    });
  }
  /* For Scroll Up */
  function showScrollUp() {
    let scroll = $(window).scrollTop();
    if (scroll >= 350) {
      $(".cs_scrollup_btn").addClass("show");
    } else {
      $(".cs_scrollup_btn").removeClass("show");
    }
  }

  /*===============================================================
    17. Product Filter Sidebar (off-canvas)
  =================================================================*/
  function filterSidebar() {
    var $sidebar = $("#productFilterSidebar");
    if (!$sidebar.length) return;

    var $overlay = $(".cs_filter_overlay");
    var $toggle = $(".shopFilterToggleBtn");
    var $sidebarToggle = $(".sidebarToggleBtn");

    function openSidebar() {
      $sidebar.addClass("active").attr("aria-hidden", "false");
      $overlay.addClass("active");
      $("body").addClass("cs_no_scroll");
      $toggle.attr("aria-expanded", "true");
    }

    function closeSidebar() {
      $sidebar.removeClass("active").attr("aria-hidden", "true");
      $overlay.removeClass("active");
      $("body").removeClass("cs_no_scroll");
      $toggle.attr("aria-expanded", "false");
    }

    $toggle.on("click", openSidebar);
    $(".cs_filter_close, .cs_filter_overlay").on("click", closeSidebar);
    $(document).on("keydown", function (e) {
      if (e.key === "Escape" && $sidebar.hasClass("active")) closeSidebar();
    });
    $sidebarToggle.on("click", function () {
      $(
        ".cs_product_filter_sidebar, .cs_filter_close, .cs_filter_overlay",
      ).toggleClass("active");
    });
  }
  /*=====================================================
    18. Ecommerce
  =======================================================*/
  function ecommerceInit() {
    function parsePrice(text) {
      return parseFloat(String(text).replace(/[^0-9.]/g, "")) || 0;
    }
    // Star Rating Input
    $(".cs_input_rating i").on("click", function () {
      // Clicked star + all previous: fill them
      $(this)
        .add($(this).prevAll())
        .removeClass("ri-star-line")
        .addClass("ri-star-fill");

      // All following stars: empty them
      $(this).nextAll().removeClass("ri-star-fill").addClass("ri-star-line");
    });
    // Check All
    $("#checkAll").change(function () {
      var isChecked = $(this).prop("checked");
      $('table input[type="checkbox"]').prop("checked", isChecked);
    });
    // Counter
    $(".cs_increment").click(function () {
      var countElement = $(this).siblings(".cs_quantity_input");
      var count = parseInt(countElement.text());
      count++;
      count < 10 ? countElement.text("0" + count) : countElement.text(count);
    });

    $(".cs_decrement").click(function () {
      var countElement = $(this).siblings(".cs_quantity_input");
      var count = parseInt(countElement.text());
      if (count > 1) {
        count--;
        count < 10 ? countElement.text("0" + count) : countElement.text(count);
      }
    });

    //Cart Drawer
    var cartDrawer = initCartDrawer();

    //Resolve the product
    function readProduct($btn) {
      var title = $btn.data("title");
      var price = $btn.data("price");
      var image = $btn.data("image");
      var link = $btn.data("link");
      var qty =
        parseInt(
          $btn.closest(".cs_product_buy").find(".cs_quantity_input").text(),
          10,
        ) || 1;

      if (!title) {
        var $card = $btn.closest(".cs_product_style_1, .cs_product_style_2");
        if ($card.length) {
          // Horizontal Thumbnail card.
          title = $.trim($card.find(".cs_product_title").text());
          price = parsePrice($card.find(".cs_product_price").first().text());
          image = $card.find(".cs_product_img, img").first().attr("src");
          link = $card.find(".cs_product_title a").attr("href");
          qty = 1;
        } else {
          // Main product details block.
          var $main = $(".cs_product_info_main").first();
          title = $.trim($main.find(".cs_product_name").text());
          price = parsePrice($main.find(".cs_product_price").first().text());
          image = $(".cs_product_gallery_main img, .cs_product_gallery img")
            .first()
            .attr("src");
          link = "product-details.html";
        }
      }

      return {
        title: title,
        price: parseFloat(price) || 0,
        image: image || "",
        alt: title,
        link: link || "product-details.html",
        qty: qty,
      };
    }

    // "Add To Cart": open the drawer
    $(document).on("click", ".addToCartBtn", function () {
      var item = readProduct($(this));
      if (!item.title) return;
      if (cartDrawer) {
        cartDrawer.addItem(item);
        return;
      }
      window.location.href =
        "cart.html?add=" + encodeURIComponent(JSON.stringify(item));
    });

    // Wishlist store
    var WISHLIST_KEY = "jewlfy_wishlist";

    function getWishlistItems() {
      try {
        var raw = window.localStorage.getItem(WISHLIST_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    function saveWishlistItems(items) {
      try {
        window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
      } catch (e) {}
    }

    function isInWishlist(items, title) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].title === title) return true;
      }
      return false;
    }

    // Reflect the saved count
    function updateWishlistBadge() {
      $(".cs_wishlist_count").text(getWishlistItems().length);
    }

    // Toggle a heart button's saved state
    function markWishlistButton($btn, active) {
      $btn
        .toggleClass("cs_active", !!active)
        .attr("aria-pressed", active ? "true" : "false");
      $btn
        .find("i")
        .toggleClass("ri-heart-3-fill", !!active)
        .toggleClass("ri-heart-3-line", !active);
    }

    // Mark every heart button whose product is already saved.
    function syncWishlistButtons() {
      var items = getWishlistItems();
      $(".addTowishlistBtn").each(function () {
        var item = readProduct($(this));
        markWishlistButton(
          $(this),
          item.title && isInWishlist(items, item.title),
        );
      });
    }

    // "Add To Wishlist
    $(document).on("click", ".addTowishlistBtn", function () {
      var $btn = $(this);
      var item = readProduct($btn);
      if (!item.title) return;

      var items = getWishlistItems();
      if (isInWishlist(items, item.title)) {
        showToast(item.title + " is already in your wishlist.", "info");
        return;
      }
      // Wishlist entries don't carry a quantity.
      delete item.qty;
      items.push(item);
      saveWishlistItems(items);
      markWishlistButton($btn, true);
      updateWishlistBadge();
      showToast(item.title + " has been added to your wishlist.", "success");
    });

    // Keep the badge and heart icons in sync with storage on every page.
    updateWishlistBadge();
    syncWishlistButtons();

    // Quick View modal
    var quickView = initQuickView();

    function initQuickView() {
      var DEFAULT_DESC =
        "Crafted with precision and timeless elegance, this piece is a refined addition to any collection — designed to be worn every day or saved for the moments that matter.";

      var $modal = null;
      var currentItem = null;

      // Build the modal shell once and wire its controls.
      function build() {
        $modal = $(
          '<div class="cs_quickview" id="quickView" aria-hidden="true">' +
            '<div class="cs_quickview_overlay"></div>' +
            '<div class="cs_quickview_dialog" role="dialog" aria-modal="true" aria-label="Product quick view">' +
            '<button type="button" class="cs_quickview_close" aria-label="Close quick view"><i class="ri-close-line"></i></button>' +
            '<div class="cs_quickview_media">' +
            '<img class="cs_quickview_img" src="" alt="">' +
            '<a href="product-details.html" class="cs_quickview_zoom cs_center cs_radius_100" aria-label="View full details"><i class="ri-expand-diagonal-line"></i></a>' +
            "</div>" +
            '<div class="cs_quickview_body">' +
            '<div class="cs_product_meta">' +
            '<span class="cs_product_tag cs_fs_14">Best Seller</span>' +
            '<span class="cs_product_stock cs_fs_14">In Stock</span>' +
            "</div>" +
            '<h2 class="cs_quickview_title cs_product_name cs_fs_28 cs_semibold mb-0"></h2>' +
            '<div class="cs_product_rating_row">' +
            '<div class="cs_rating" data-rating="5"><div class="cs_rating_percentage"></div></div>' +
            '<span class="cs_quickview_rating_text cs_product_reviews cs_fs_12"></span>' +
            '<span class="cs_product_scarcity cs_fs_12">100+ Sold out this week</span>' +
            "</div>" +
            '<div class="cs_product_price_row">' +
            '<h3 class="cs_quickview_price cs_product_price cs_fs_28 cs_semibold mb-0"></h3>' +
            '<s class="cs_quickview_price_old cs_product_price_old"></s>' +
            "</div>" +
            '<p class="cs_quickview_desc cs_product_desc"></p>' +
            '<div class="cs_product_option cs_quickview_option">' +
            '<h4 class="cs_product_option_title cs_fs_22 cs_medium">Metal finish</h4>' +
            '<div class="cs_product_swatches">' +
            '<button type="button" class="cs_product_swatch active">Yellow Gold</button>' +
            '<button type="button" class="cs_product_swatch">Rose Gold</button>' +
            '<button type="button" class="cs_product_swatch">White Gold</button>' +
            '<button type="button" class="cs_product_swatch">Platinum (+$120)</button>' +
            "</div>" +
            "</div>" +
            '<div class="cs_quickview_actions">' +
            '<span class="cs_quickview_buy_label cs_fs_22 cs_medium">Quantity</span>' +
            '<div class="cs_qty_stepper">' +
            '<button type="button" class="cs_qty_btn cs_qty_minus" aria-label="Decrease quantity"><i class="ri-subtract-line"></i></button>' +
            '<input type="text" class="cs_qty_input" value="1" inputmode="numeric" aria-label="Quantity">' +
            '<button type="button" class="cs_qty_btn cs_qty_plus" aria-label="Increase quantity"><i class="ri-add-line"></i></button>' +
            "</div>" +
            '<button type="button" class="cs_product_btn cs_quickview_cart addToCartBtn">Add To Cart</button>' +
            '<button type="button" class="cs_product_btn cs_quickview_buy_btn cs_quickview_buy">Buy Now</button>' +
            "</div>" +
            '<div class="cs_quickview_share">' +
            '<span class="cs_quickview_share_label cs_fs_22 cs_medium">Share</span>' +
            '<div class="cs_social_btns_style_1 cs_quickview_social cs_mp_0">' +
            '<a href="#" aria-label="Facebook"><i class="ri-facebook-fill"></i></a>' +
            '<a href="#" aria-label="LinkedIn"><i class="ri-linkedin-fill"></i></a>' +
            '<a href="#" aria-label="Instagram"><i class="ri-instagram-line"></i></a>' +
            "</div>" +
            '<button type="button" class="cs_quickview_wishlist" aria-label="Add to wishlist"><i class="ri-heart-3-line"></i><span>Add to Wishlist</span></button>' +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>",
        ).appendTo("body");

        $modal.on("click", ".cs_quickview_overlay, .cs_quickview_close", close);

        // Quantity stepper.
        $modal.on("click", ".cs_qty_minus", function () {
          setQty(getQty() - 1);
        });
        $modal.on("click", ".cs_qty_plus", function () {
          setQty(getQty() + 1);
        });
        $modal.on("change", ".cs_qty_input", function () {
          setQty(getQty());
        });

        // Add the previewed
        $modal.on("click", ".cs_quickview_cart", function () {
          if (!currentItem) return;
          var cartItem = $.extend({}, currentItem, { qty: getQty() });
          close();
          if (cartDrawer) {
            cartDrawer.addItem(cartItem);
            return;
          }
          window.location.href =
            "cart.html?add=" + encodeURIComponent(JSON.stringify(cartItem));
        });

        // Buy Now: checkout page so the order is placed for the product.
        $modal.on("click", ".cs_quickview_buy", function () {
          if (!currentItem) return;
          var cartItem = $.extend({}, currentItem, { qty: getQty() });
          window.location.href =
            "checkout.html?add=" + encodeURIComponent(JSON.stringify(cartItem));
        });

        // Save the previewed product to the wishlist.
        $modal.on("click", ".cs_quickview_wishlist", function () {
          if (!currentItem) return;
          var $btn = $(this);
          var items = getWishlistItems();
          if (isInWishlist(items, currentItem.title)) {
            showToast(
              currentItem.title + " is already in your wishlist.",
              "info",
            );
            return;
          }
          items.push(currentItem);
          saveWishlistItems(items);
          markWishlistButton($btn, true);
          updateWishlistBadge();
          syncWishlistButtons();
          showToast(
            currentItem.title + " has been added to your wishlist.",
            "success",
          );
        });
      }

      function open() {
        $modal.addClass("active").attr("aria-hidden", "false");
        $("body").addClass("cs_no_scroll");
      }

      function close() {
        $modal.removeClass("active").attr("aria-hidden", "true");
        $("body").removeClass("cs_no_scroll");
      }

      // Read the quantity input
      function getQty() {
        var qty = parseInt($modal.find(".cs_qty_input").val(), 10);
        return isNaN(qty) || qty < 1 ? 1 : qty;
      }

      function setQty(value) {
        $modal.find(".cs_qty_input").val(value < 1 ? 1 : value);
      }

      // Populate the modal from a product and open it.
      function show($btn) {
        if (!$modal) build();

        var item = readProduct($btn);
        if (!item.title) return;
        // Quick View products carry no quantity.
        delete item.qty;
        currentItem = item;

        // Prefer a card-supplied description, otherwise use the default.
        var $card = $btn.closest(".cs_product_style_1, .cs_product_style_2");
        var desc =
          $.trim($card.find(".cs_product_short_desc").text()) || DEFAULT_DESC;

        // Carry the card's star rating and review count across to the preview.
        var $cardRating = $card.find(".cs_rating");
        var rating = parseFloat($cardRating.data("rating"));
        if (isNaN(rating)) rating = 5;
        var reviews = parseInt($cardRating.data("reviews"), 10);
        $modal
          .find(".cs_product_rating_row .cs_rating_percentage")
          .css("width", rating * 20 + "%");
        $modal
          .find(".cs_quickview_rating_text")
          .text(
            isNaN(reviews)
              ? rating.toFixed(1)
              : rating.toFixed(1) + " (" + reviews + " reviews)",
          );

        $modal
          .find(".cs_quickview_img")
          .attr("src", item.image)
          .attr("alt", item.title);
        $modal.find(".cs_quickview_title").text(item.title);
        $modal.find(".cs_quickview_price").text(
          "$" +
            (item.price || 0).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
        );
        $modal.find(".cs_quickview_desc").text(desc);
        // Optional strike-through original price, sourced from the card when present.
        var oldPrice = $.trim(
          $btn.data("old-price") ||
            $card.find(".cs_product_price_old, s").first().text(),
        );
        $modal.find(".cs_quickview_price_old").text(oldPrice);
        // Each preview starts at quantity 1.
        setQty(1);
        // Point the image "expand" control at the full product page.
        $modal
          .find(".cs_quickview_zoom")
          .attr("href", item.link || "product-details.html");
        markWishlistButton(
          $modal.find(".cs_quickview_wishlist"),
          isInWishlist(getWishlistItems(), item.title),
        );

        open();
      }

      $(document).on("click", ".quickviewBtn", function () {
        show($(this));
      });

      // Close on Escape.
      $(document).on("keydown", function (e) {
        if (e.key === "Escape" && $modal && $modal.hasClass("active")) close();
      });

      return { show: show, close: close };
    }
    // Product View Layout Toggle
    var $shopLayouts = $(".cs_shop_layout");
    if ($shopLayouts.length) {
      $(document).on("click", ".cs_view_btn", function () {
        var $btn = $(this);
        var view = $btn.attr("data-view");
        if (!view) return;
        $btn.addClass("active").siblings(".cs_view_btn").removeClass("active");
        $shopLayouts.attr("data-view", view);
      });
    }

    // Cart Page
    var $cartForm = $("#cartForm");
    if ($cartForm.length) {
      var $cartEmpty = $(".cs_cart_empty");
      var couponRate = 0;
      // Format a number as a currency string e.g. 1169 -> "$1,169.00"
      function formatMoney(value) {
        return (
          "$" +
          value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      }
      // Read a row's quantity, clamped to a minimum of 1.
      function getQty($row) {
        var qty = parseInt($row.find(".cs_qty_input").val(), 10);
        return isNaN(qty) || qty < 1 ? 1 : qty;
      }
      // Sync a single row's quantity input and line subtotal.
      function updateRow($row) {
        var price = parseFloat($row.data("price")) || 0;
        var qty = getQty($row);
        $row.find(".cs_qty_input").val(qty);
        $row.find(".cs_cart_subtotal").text(formatMoney(price * qty));
      }
      // Recalculate subtotal, discount, total, cart badge and empty state.
      function updateTotals() {
        var subtotal = 0;
        $cartForm.find(".cs_cart_row").each(function () {
          var $row = $(this);
          var price = parseFloat($row.data("price")) || 0;
          subtotal += price * getQty($row);
        });
        var discount = subtotal * couponRate;
        var total = subtotal - discount;
        $cartForm.find(".cs_cart_subtotal_amount").text(formatMoney(subtotal));
        $cartForm.find(".cs_cart_total_amount").text(formatMoney(total));
        // Badge reflects the number of unique products
        $(".cs_cart_count").text($cartForm.find(".cs_cart_row").length);
        // Show a discount line only while a coupon is active.
        var $discountRow = $cartForm.find(".cs_cart_totals_discount");
        if (discount > 0) {
          if (!$discountRow.length) {
            $discountRow = $(
              '<div class="cs_cart_totals_row cs_cart_totals_discount">' +
                "<span>Discount</span>" +
                '<span class="cs_cart_discount_amount"></span>' +
                "</div>",
            );
            $cartForm.find(".cs_cart_totals_grand").before($discountRow);
          }
          $discountRow
            .find(".cs_cart_discount_amount")
            .text("-" + formatMoney(discount));
        } else {
          $discountRow.remove();
        }
        // Toggle the empty-cart message when the last row is removed.
        if ($cartForm.find(".cs_cart_row").length === 0) {
          $cartForm.hide();
          $cartEmpty.prop("hidden", false);
        }
      }

      // Increase quantity
      $cartForm.on("click", ".cs_qty_plus", function () {
        var $row = $(this).closest(".cs_cart_row");
        $row.find(".cs_qty_input").val(getQty($row) + 1);
        updateRow($row);
        updateTotals();
      });

      // Decrease quantity (never below 1)
      $cartForm.on("click", ".cs_qty_minus", function () {
        var $row = $(this).closest(".cs_cart_row");
        var qty = getQty($row);
        if (qty > 1) {
          $row.find(".cs_qty_input").val(qty - 1);
          updateRow($row);
          updateTotals();
        }
      });

      // Keep manual typing numeric, then recalc on commit.
      $cartForm.on("input", ".cs_qty_input", function () {
        this.value = this.value.replace(/[^0-9]/g, "");
      });
      $cartForm.on("change blur", ".cs_qty_input", function () {
        var $row = $(this).closest(".cs_cart_row");
        updateRow($row);
        updateTotals();
      });

      // Remove a product
      $cartForm.on("click", ".cs_remove_btn", function () {
        $(this).closest(".cs_cart_row").remove();
        updateTotals();
      });

      // Apply coupon (demo: "SAVE10" = 10% off)
      $cartForm.on("click", ".cs_apply_coupon", function () {
        var code = $.trim(
          $cartForm.find(".cs_coupon_input").val(),
        ).toUpperCase();
        couponRate = code === "SAVE10" ? 0.1 : 0;
        updateTotals();
      });

      // Update Cart / prevent the form from navigating away.
      $cartForm.on("submit", function (e) {
        e.preventDefault();
        $cartForm.find(".cs_cart_row").each(function () {
          updateRow($(this));
        });
        updateTotals();
      });

      // Build a cart row element from a queued wishlist product.
      function buildCartRow(item) {
        var price = item.price || 0;
        var qty = item.qty && item.qty > 0 ? item.qty : 1;
        var thumb = item.image
          ? '<img src="' + item.image + '" alt="' + (item.alt || "") + '">'
          : "";
        return $(
          '<tr class="cs_cart_row" data-price="' +
            price +
            '">' +
            '<td class="cs_cart_product" data-label="Product">' +
            '<span class="cs_cart_thumb">' +
            thumb +
            "</span>" +
            '<h2 class="cs_product_title cs_fs_22 cs_medium m-0">' +
            '<a href="' +
            (item.link || "product-details.html") +
            '">' +
            item.title +
            "</a>" +
            "</h2>" +
            "</td>" +
            '<td class="cs_cart_price" data-label="Price">' +
            formatMoney(price) +
            "</td>" +
            '<td class="cs_cart_qty" data-label="Quantity">' +
            '<div class="cs_qty_stepper">' +
            '<button type="button" class="cs_qty_btn cs_qty_minus" aria-label="Decrease quantity"><i class="ri-subtract-line"></i></button>' +
            '<input type="text" name="qty[]" class="cs_qty_input" value="' +
            qty +
            '" inputmode="numeric" aria-label="Quantity">' +
            '<button type="button" class="cs_qty_btn cs_qty_plus" aria-label="Increase quantity"><i class="ri-add-line"></i></button>' +
            "</div>" +
            "</td>" +
            '<td class="cs_cart_subtotal" data-label="Subtotal">' +
            formatMoney(price * qty) +
            "</td>" +
            '<td class="cs_cart_remove">' +
            '<button type="button" class="cs_remove_btn" aria-label="Remove ' +
            item.title +
            '"><i class="ri-delete-bin-line"></i></button>' +
            "</td>" +
            "</tr>",
        );
      }

      // Read a product passed from a wishlist "Add To Cart"
      function getAddedProduct() {
        var match = /[?&]add=([^&]+)/.exec(window.location.search);
        if (!match) return null;
        try {
          return JSON.parse(decodeURIComponent(match[1]));
        } catch (e) {
          return null;
        }
      }

      // Add the incoming product
      var added = getAddedProduct();
      if (added && added.title) {
        var $tbody = $cartForm.find(".cs_cart_table tbody");
        var $match = null;
        $tbody.find(".cs_cart_row").each(function () {
          if (
            $.trim($(this).find(".cs_product_title").text()) === added.title
          ) {
            $match = $(this);
            return false;
          }
        });
        if ($match) {
          // Product is already in the cart: bump its quantity only.
          var $input = $match.find(".cs_qty_input");
          $input.val((parseInt($input.val(), 10) || 0) + (added.qty || 1));
          showToast(added.title + " is already in your cart.", "info");
        } else {
          $tbody.append(buildCartRow(added));
          showToast(added.title + " has been added to your cart.", "success");
        }
        // Reveal the cart in case it had previously been emptied.
        $cartForm.show();
        $cartEmpty.prop("hidden", true);
        // Clean the URL so a refresh doesn't add the same product again.
        if (window.history && window.history.replaceState) {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        }
      }
      // Drop empty thumbnails so no broken-image icon shows over the placeholder.
      $cartForm.find(".cs_cart_thumb img").each(function () {
        if (!this.getAttribute("src")) {
          $(this).remove();
        }
      });

      // Initial sync so totals/badge reflect the markup on load.
      $cartForm.find(".cs_cart_row").each(function () {
        updateRow($(this));
      });
      updateTotals();
    }

    // Checkout Page: when reached via a product "Buy Now"
    var $checkoutForm = $(".cs_checkout_form");
    if ($checkoutForm.length) {
      // Read the product passed in via the ?add= query parameter.
      function getCheckoutProduct() {
        var match = /[?&]add=([^&]+)/.exec(window.location.search);
        if (!match) return null;
        try {
          return JSON.parse(decodeURIComponent(match[1]));
        } catch (e) {
          return null;
        }
      }

      function formatCheckoutMoney(value) {
        return (
          "$" +
          (value || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      }

      var buyNow = getCheckoutProduct();
      if (buyNow && buyNow.title) {
        var checkoutQty = parseInt(buyNow.qty, 10);
        if (isNaN(checkoutQty) || checkoutQty < 1) checkoutQty = 1;

        var safeCheckoutTitle = $("<div>").text(buyNow.title).html();
        var checkoutThumb = buyNow.image
          ? '<img src="' + buyNow.image + '" alt="' + safeCheckoutTitle + '">'
          : "";

        // Replace the demo order items with the single purchased product.
        $checkoutForm
          .find(".cs_order_items")
          .html(
            '<li class="cs_order_item">' +
              '<span class="cs_order_thumb">' +
              checkoutThumb +
              "</span>" +
              '<span class="cs_order_item_name">' +
              safeCheckoutTitle +
              "</span>" +
              '<span class="cs_order_item_qty">X' +
              checkoutQty +
              "</span>" +
              "</li>",
          );

        // Recalculate the totals for this single product.
        var checkoutSubtotal = (parseFloat(buyNow.price) || 0) * checkoutQty;
        $checkoutForm.find(".cs_order_totals li").each(function () {
          var $spans = $(this).find("span");
          if ($spans.length < 2) return;
          var label = $.trim($spans.eq(0).text()).toLowerCase();
          if (label.indexOf("subtotal") === 0 || label === "total") {
            $spans.eq(1).text(formatCheckoutMoney(checkoutSubtotal));
          }
        });

        // Clean the URL so a refresh doesn't re-read the same product.
        if (window.history && window.history.replaceState) {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        }
      }
    }

    // Wishlist Page (renders from the saved wishlist store)
    var $wishlist = $("#wishlist");
    if ($wishlist.length) {
      var $wishlistEmpty = $wishlist.siblings(".cs_cart_empty");
      var $wishlistBody = $wishlist.find(".cs_wishlist_table tbody");

      function formatWishlistMoney(value) {
        return (
          "$" +
          (value || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      }

      // On the first ever visit
      if (
        !window.localStorage ||
        window.localStorage.getItem(WISHLIST_KEY) === null
      ) {
        var seeded = [];
        $wishlistBody.find(".cs_cart_row").each(function () {
          var $row = $(this);
          var $img = $row.find(".cs_cart_thumb img");
          seeded.push({
            title: $.trim($row.find(".cs_product_title").text()),
            price: parsePrice($row.find(".cs_cart_price").text()),
            image: $img.attr("src") || "",
            alt: $img.attr("alt") || "",
            link:
              $row.find(".cs_product_title a").attr("href") ||
              "product-details.html",
          });
        });
        saveWishlistItems(seeded);
      }

      // Build a wishlist table row from a stored product.
      function buildWishlistRow(item) {
        var safeTitle = $("<div>").text(item.title).html();
        var thumb = item.image
          ? '<img src="' + item.image + '" alt="' + safeTitle + '">'
          : "";
        return $(
          '<tr class="cs_cart_row">' +
            '<td class="cs_cart_product" data-label="Product">' +
            '<span class="cs_cart_thumb">' +
            thumb +
            "</span>" +
            '<h2 class="cs_product_title cs_fs_22 cs_medium m-0">' +
            '<a href="' +
            (item.link || "product-details.html") +
            '">' +
            safeTitle +
            "</a>" +
            "</h2>" +
            "</td>" +
            '<td class="cs_cart_price" data-label="Unit Price">' +
            formatWishlistMoney(item.price) +
            "</td>" +
            '<td class="cs_wishlist_stock" data-label="Stock Status">' +
            '<span class="cs_stock_in">In Stock</span>' +
            "</td>" +
            '<td class="cs_wishlist_action" data-label="Action">' +
            '<a href="cart.html" class="cs_btn_style_1 cs_primary_bg cs_white_color addToCart">Add To Cart</a>' +
            '<button type="button" class="cs_remove_btn" aria-label="Remove ' +
            safeTitle +
            '"><i class="ri-delete-bin-line"></i></button>' +
            "</td>" +
            "</tr>",
        );
      }

      // Sync the header wishlist badge and toggle the empty state.
      function updateWishlist() {
        var count = $wishlist.find(".cs_cart_row").length;
        $(".cs_wishlist_count").text(count);
        if (count === 0) {
          $wishlist.hide();
          $wishlistEmpty.prop("hidden", false);
        } else {
          $wishlist.show();
          $wishlistEmpty.prop("hidden", true);
        }
      }

      // Render the table from the store.
      function renderWishlist() {
        $wishlistBody.empty();
        getWishlistItems().forEach(function (item) {
          $wishlistBody.append(buildWishlistRow(item));
        });
        updateWishlist();
      }

      // Move a wishlist product into the cart.
      $wishlist.on("click", ".addToCart", function (e) {
        e.preventDefault();
        var $row = $(this).closest(".cs_cart_row");
        var $img = $row.find(".cs_cart_thumb img");
        var item = {
          title: $.trim($row.find(".cs_product_title").text()),
          price: parsePrice($row.find(".cs_cart_price").text()),
          image: $img.attr("src") || "",
          alt: $img.attr("alt") || "",
          link:
            $row.find(".cs_product_title a").attr("href") ||
            "product-details.html",
          qty: 1,
        };

        // Open the drawer when present, otherwise hand the product to the cart.
        if (cartDrawer) {
          cartDrawer.addItem(item);
          return;
        }
        var target = this.getAttribute("href") || "cart.html";
        window.location.href =
          target + "?add=" + encodeURIComponent(JSON.stringify(item));
      });

      // Remove a product from the wishlist (and from storage).
      $wishlist.on("click", ".cs_remove_btn", function () {
        var $row = $(this).closest(".cs_cart_row");
        var title = $.trim($row.find(".cs_product_title").text());
        saveWishlistItems(
          getWishlistItems().filter(function (it) {
            return it.title !== title;
          }),
        );
        $row.remove();
        updateWishlist();
      });

      renderWishlist();
    }
    // Add Progress Bar
    $(".cs_progress").each(function () {
      var progressPercentage = $(this).data("progress") + "%";
      $(this).find(".cs_progress_in").css("width", progressPercentage);
    });

    // Build the empty drawer shell
    function buildDrawerShell() {
      return $(
        '<div class="cs_cart_drawer" id="cartDrawer" aria-hidden="true">' +
          '<div class="cs_cart_drawer_overlay"></div>' +
          '<aside class="cs_cart_drawer_panel" role="dialog" aria-modal="true" aria-label="Shopping cart">' +
          '<div class="cs_cart_drawer_head">' +
          '<h2 class="cs_cart_drawer_title cs_fs_22 cs_medium mb-0">Shopping Cart</h2>' +
          '<button type="button" class="cs_cart_drawer_close" aria-label="Close cart"><i class="ri-close-line"></i></button>' +
          "</div>" +
          '<div class="cs_cart_drawer_body">' +
          '<ul class="cs_cart_drawer_list cs_mp_0"></ul>' +
          '<div class="cs_cart_drawer_empty" hidden>' +
          '<i class="ri-shopping-cart-2-line"></i>' +
          '<p class="mb-0">Your cart is currently empty.</p>' +
          '<a href="shop.html" class="cs_continue_shopping_btn cs_fs_18 cs_medium cs_accent_color mt-2">Continue Shopping.</a>' +
          "</div>" +
          "</div>" +
          '<div class="cs_cart_drawer_foot">' +
          '<div class="cs_cart_drawer_subtotal">' +
          '<span class="cs_cart_drawer_subtotal_label">Subtotal</span>' +
          '<span class="cs_cart_drawer_subtotal_amount">$0.00</span>' +
          "</div>" +
          '<div class="cs_cart_drawer_actions">' +
          '<a href="cart.html" class="cs_cart_drawer_btn">View Cart</a>' +
          '<a href="checkout.html" class="cs_cart_drawer_btn cs_cart_drawer_btn_outline">Checkout</a>' +
          "</div>" +
          "</div>" +
          "</aside>" +
          "</div>",
      );
    }

    // Cart Drawer
    function initCartDrawer() {
      var $drawer = $("#cartDrawer");
      // Inject the drawer to body
      if (!$drawer.length) {
        $drawer = buildDrawerShell().appendTo("body");
      }

      var $list = $drawer.find(".cs_cart_drawer_list");
      var $empty = $drawer.find(".cs_cart_drawer_empty");
      var $subtotal = $drawer.find(".cs_cart_drawer_subtotal_amount");

      function formatMoney(value) {
        return (
          "$" +
          value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        );
      }

      // Read a row's quantity, clamped to a minimum of 1.
      function getQty($row) {
        var qty = parseInt($row.find(".cs_qty_input").val(), 10);
        return isNaN(qty) || qty < 1 ? 1 : qty;
      }

      // Sync a single row's quantity input and its line price.
      function updateRow($row) {
        var price = parseFloat($row.data("price")) || 0;
        var qty = getQty($row);
        $row.find(".cs_qty_input").val(qty);
        $row.find(".cs_cart_drawer_item_price").text(formatMoney(price * qty));
      }

      // Recalculate the subtotal, header badge and empty state.
      function recalc() {
        var subtotal = 0;
        $list.find(".cs_cart_drawer_item").each(function () {
          var $row = $(this);
          subtotal += (parseFloat($row.data("price")) || 0) * getQty($row);
        });
        $subtotal.text(formatMoney(subtotal));

        var count = $list.find(".cs_cart_drawer_item").length;
        $(".cs_cart_count").text(count);

        if (count === 0) {
          $list.prop("hidden", true);
          $empty.prop("hidden", false);
        } else {
          $list.prop("hidden", false);
          $empty.prop("hidden", true);
        }
      }

      function open() {
        $drawer.addClass("active").attr("aria-hidden", "false");
        $("body").addClass("cs_no_scroll");
      }

      function close() {
        $drawer.removeClass("active").attr("aria-hidden", "true");
        $("body").removeClass("cs_no_scroll");
      }

      // Build a drawer row element from a product object.
      function buildItem(item) {
        var price = item.price || 0;
        var qty = item.qty && item.qty > 0 ? item.qty : 1;
        var link = item.link || "product-details.html";
        var safeTitle = $("<div>").text(item.title).html();
        var thumb = item.image
          ? '<img src="' + item.image + '" alt="' + safeTitle + '">'
          : "";
        return $(
          '<li class="cs_cart_drawer_item" data-price="' +
            price +
            '">' +
            '<a href="' +
            link +
            '" class="cs_cart_drawer_thumb">' +
            thumb +
            "</a>" +
            '<div class="cs_cart_drawer_item_main">' +
            '<h3 class="cs_cart_drawer_item_title cs_fs_16 cs_medium mb-0">' +
            '<a href="' +
            link +
            '">' +
            safeTitle +
            "</a></h3>" +
            '<div class="cs_cart_drawer_item_price_row">' +
            '<p class="cs_cart_drawer_item_price mb-0">' +
            formatMoney(price * qty) +
            "</p>" +
            '<button type="button" class="cs_cart_drawer_remove" aria-label="Remove ' +
            safeTitle +
            '"><i class="ri-delete-bin-line"></i></button>' +
            "</div>" +
            "</div>" +
            '<div class="cs_qty_stepper">' +
            '<button type="button" class="cs_qty_btn cs_qty_minus" aria-label="Decrease quantity"><i class="ri-subtract-line"></i></button>' +
            '<input type="text" class="cs_qty_input" value="' +
            qty +
            '" inputmode="numeric" aria-label="Quantity">' +
            '<button type="button" class="cs_qty_btn cs_qty_plus" aria-label="Increase quantity"><i class="ri-add-line"></i></button>' +
            "</div>" +
            "</li>",
        );
      }

      // Add a product: bump the quantity of a matching row, or append a new one.
      function addItem(item) {
        if (!item || !item.title) return;

        var $match = null;
        $list.find(".cs_cart_drawer_item").each(function () {
          if (
            $.trim($(this).find(".cs_cart_drawer_item_title").text()) ===
            item.title
          ) {
            $match = $(this);
            return false;
          }
        });

        if ($match) {
          var add = item.qty && item.qty > 0 ? item.qty : 1;
          $match.find(".cs_qty_input").val(getQty($match) + add);
          updateRow($match);
        } else {
          $list.append(buildItem(item));
        }

        // No toast here: the drawer sliding open is the confirmation.
        recalc();
        open();
      }

      // Quantity controls.
      $drawer.on("click", ".cs_qty_plus", function () {
        var $row = $(this).closest(".cs_cart_drawer_item");
        $row.find(".cs_qty_input").val(getQty($row) + 1);
        updateRow($row);
        recalc();
      });
      $drawer.on("click", ".cs_qty_minus", function () {
        var $row = $(this).closest(".cs_cart_drawer_item");
        var qty = getQty($row);
        if (qty > 1) {
          $row.find(".cs_qty_input").val(qty - 1);
          updateRow($row);
          recalc();
        }
      });
      $drawer.on("input", ".cs_qty_input", function () {
        this.value = this.value.replace(/[^0-9]/g, "");
      });
      $drawer.on("change blur", ".cs_qty_input", function () {
        var $row = $(this).closest(".cs_cart_drawer_item");
        updateRow($row);
        recalc();
      });

      // Remove a product.
      $drawer.on("click", ".cs_cart_drawer_remove", function () {
        $(this).closest(".cs_cart_drawer_item").remove();
        recalc();
      });

      // Close interactions: close button, overlay click and the Escape key.
      $drawer.on(
        "click",
        ".cs_cart_drawer_close, .cs_cart_drawer_overlay",
        close,
      );
      $(document).on("keydown", function (e) {
        if (e.key === "Escape" && $drawer.hasClass("active")) close();
      });

      // Open the drawer from the header cart icon instead of leaving the page.
      $('.cs_header_action[aria-label="Cart"]').on("click", function (e) {
        e.preventDefault();
        open();
      });

      // Initial sync so the static markup's totals/badge are correct on load.
      $list.find(".cs_cart_drawer_item").each(function () {
        updateRow($(this));
      });
      recalc();

      return { addItem: addItem, open: open, close: close };
    }
  }
  /*=====================================================
    19. Countdown Timer
  =======================================================*/
  function countdownTimer() {
    if (!$.exists(".cs_countdown")) return;
    // Pad single digits with a leading zero.
    function pad(value) {
      return value < 10 ? "0" + value : "" + value;
    }

    $(".cs_countdown").each(function () {
      var $timer = $(this);
      // The Time is provided in the HTML via data-countdown
      var target = new Date($timer.data("countdown")).getTime();
      if (isNaN(target)) return;
      var $units = {
        weeks: $timer.find('[data-unit="weeks"]'),
        days: $timer.find('[data-unit="days"]'),
        hours: $timer.find('[data-unit="hours"]'),
        minutes: $timer.find('[data-unit="minutes"]'),
        seconds: $timer.find('[data-unit="seconds"]'),
      };
      // When there is no weeks unit in the markup, fold the weeks into days.
      var hasWeeks = $units.weeks.length > 0;

      function render(weeks, days, hours, minutes, seconds) {
        $units.weeks.text(pad(weeks));
        $units.days.text(pad(days));
        $units.hours.text(pad(hours));
        $units.minutes.text(pad(minutes));
        $units.seconds.text(pad(seconds));
      }

      function tick() {
        var distance = target - new Date().getTime();

        if (distance <= 0) {
          clearInterval(interval);
          render(0, 0, 0, 0, 0);
          $timer.addClass("cs_countdown_ended");
          return;
        }

        var totalSeconds = Math.floor(distance / 1000);
        var weeks, days;
        if (hasWeeks) {
          weeks = Math.floor(totalSeconds / (7 * 24 * 60 * 60));
          days = Math.floor(
            (totalSeconds % (7 * 24 * 60 * 60)) / (24 * 60 * 60),
          );
        } else {
          weeks = 0;
          days = Math.floor(totalSeconds / (24 * 60 * 60));
        }
        var hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
        var minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
        var seconds = totalSeconds % 60;
        render(weeks, days, hours, minutes, seconds);
      }

      tick();
      var interval = setInterval(tick, 1000);
    });
  }

  /*===================================================
    20. Toast Notifications
  =====================================================*/
  function showToast(message, type) {
    type = type || "success";
    var $container = $(".cs_toast_container");
    if (!$container.length) {
      $container = $(
        '<div class="cs_toast_container" aria-live="polite"></div>',
      ).appendTo("body");
    }
    var icon =
      type === "info"
        ? '<i class="ri-information-line"></i>'
        : '<i class="ri-checkbox-circle-line"></i>';
    var $toast = $(
      '<div class="cs_toast cs_toast_' +
        type +
        '" role="status">' +
        '<span class="cs_toast_icon">' +
        icon +
        "</span>" +
        '<span class="cs_toast_msg"></span>' +
        '<button type="button" class="cs_toast_close" aria-label="Dismiss"><i class="ri-close-line"></i></button>' +
        "</div>",
    );
    $toast.find(".cs_toast_msg").text(message);
    $container.append($toast);

    // Trigger the enter transition on the next frame.
    window.requestAnimationFrame(function () {
      $toast.addClass("cs_toast_show");
    });

    function dismiss() {
      $toast.removeClass("cs_toast_show");
      window.setTimeout(function () {
        $toast.remove();
      }, 300);
    }
    $toast.find(".cs_toast_close").on("click", dismiss);
    window.setTimeout(dismiss, 3500);
  }
  /*=====================================================
    21. Price Range Slider
  =======================================================*/
  function priceRangeSlider() {
    $(".cs_price_slider").each(function () {
      var $slider = $(this);
      var $track = $slider.find(".cs_price_slider_track");
      var $range = $slider.find(".cs_price_slider_range");
      var $minHandle = $slider.find(".cs_price_slider_handle_min");
      var $maxHandle = $slider.find(".cs_price_slider_handle_max");
      if (!$track.length || !$minHandle.length || !$maxHandle.length) return;

      // Bounds & defaults (overridable via data-* attributes).
      var min = parseFloat($slider.data("min"));
      var max = parseFloat($slider.data("max"));
      if (isNaN(min)) min = 10;
      if (isNaN(max)) max = 2000;
      var step = parseFloat($slider.data("step")) || 10;
      var currency = $slider.data("currency");
      if (currency === undefined || currency === null) currency = "$";

      var from = parseFloat($slider.data("from"));
      var to = parseFloat($slider.data("to"));
      if (isNaN(from)) from = min;
      if (isNaN(to)) to = max;

      // The value label lives outside the slider, in the group footer.
      var $value = $slider
        .closest(".cs_filter_group")
        .find(".cs_price_slider_value");

      function format(num) {
        return currency + Math.round(num).toLocaleString("en-US");
      }

      function clamp(num) {
        return Math.min(max, Math.max(min, num));
      }

      function snap(num) {
        var snapped = min + Math.round((num - min) / step) * step;
        return clamp(snapped);
      }

      function percent(num) {
        return ((num - min) / (max - min)) * 100;
      }

      function render() {
        var minPct = percent(from);
        var maxPct = percent(to);
        $minHandle.css("left", minPct + "%");
        $maxHandle.css("left", maxPct + "%");
        $range.css({ left: minPct + "%", right: 100 - maxPct + "%" });
        if ($value.length) {
          $value.text("Price: " + format(from) + " — " + format(to));
        }
        $slider.trigger("cs:pricechange", [from, to]);
      }

      // Convert a pointer's page X position to a value within [min, max].
      function valueFromEvent(e) {
        var rect = $track[0].getBoundingClientRect();
        var clientX =
          e.touches && e.touches.length ? e.touches[0].clientX : e.clientX;
        var ratio = rect.width ? (clientX - rect.left) / rect.width : 0;
        ratio = Math.min(1, Math.max(0, ratio));
        return snap(min + ratio * (max - min));
      }

      function startDrag($handle, isMin) {
        return function (e) {
          e.preventDefault();
          $handle.addClass("cs_dragging");

          function onMove(ev) {
            var val = valueFromEvent(ev);
            if (isMin) {
              from = Math.min(val, to);
            } else {
              to = Math.max(val, from);
            }
            render();
          }

          function onUp() {
            $handle.removeClass("cs_dragging");
            $(document)
              .off("mousemove touchmove", onMove)
              .off("mouseup touchend touchcancel", onUp);
          }

          $(document)
            .on("mousemove touchmove", onMove)
            .on("mouseup touchend touchcancel", onUp);
        };
      }

      $minHandle.on("mousedown touchstart", startDrag($minHandle, true));
      $maxHandle.on("mousedown touchstart", startDrag($maxHandle, false));

      // Clicking the track moves the nearest handle to that point.
      $track.on("mousedown touchstart", function (e) {
        if ($(e.target).is($minHandle) || $(e.target).is($maxHandle)) return;
        var val = valueFromEvent(e);
        if (Math.abs(val - from) <= Math.abs(val - to)) {
          from = Math.min(val, to);
        } else {
          to = Math.max(val, from);
        }
        render();
      });

      render();
    });
  }
  /*=====================================================
    22. Shop Layout View — view switcher
  =====================================================*/
  function shopLayoutView() {
    var $layout = $(".cs_shop_layout");
    if (!$layout.length) return;

    var allowed = ["list", "2", "3", "4", "5", "6"];

    function setView(view) {
      $layout.attr("data-view", view);
      $(".shopViewBtn")
        .removeClass("active")
        .filter('[data-view="' + view + '"]')
        .addClass("active");
    }

    // Honour the layout requested via the menu links
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("view") || params.get("cols");
    if (initial && allowed.indexOf(initial) !== -1) {
      setView(initial);
    }

    $(".shopViewBtn").on("click", function () {
      var view = $(this).attr("data-view");
      if (allowed.indexOf(view) === -1) return;
      setView(view);

      // Keep the URL in sync without reloading the page.
      var next = new URLSearchParams(window.location.search);
      next.delete("view");
      next.delete("cols");
      if (view === "list") {
        next.set("view", "list");
      } else {
        next.set("cols", view);
      }
      var query = next.toString();
      window.history.replaceState(
        null,
        "",
        query ? "?" + query : window.location.pathname,
      );
    });
  }
})(jQuery); // End of use strict
