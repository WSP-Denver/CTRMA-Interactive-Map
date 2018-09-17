var ctrmaInteractiveMap = function () {

  // SVG PAN-ZOOM Options and event handlers for mobile
  var options = {
    fit: 1,
    contain: true,
    center: 1,
    zoomScaleSensitivity: 0.2,
    customEventsHandler: {
      haltEventListeners: [
        "touchstart",
        "touchend",
        "touchmove",
        "touchleave",
        "touchcancel"
      ],
      init: function (options) {
        var instance = options.instance,
          initialScale = 1,
          pannedX = 0,
          pannedY = 0;

        // Init Hammer
        // Listen only for pointer and touch events
        this.hammer = Hammer(options.svgElement, {
          inputClass: Hammer.SUPPORT_POINTER_EVENTS ?
            Hammer.PointerEventInput : Hammer.TouchInput
        });

        // Enable pinch
        this.hammer.get("pinch").set({
          enable: true
        });

        // Handle double tap
        this.hammer.on("doubletap", function (ev) {
          instance.zoomIn();
        });

        // Handle pan
        this.hammer.on("panstart panmove", function (ev) {
          // On pan start reset panned variables
          if (ev.type === "panstart") {
            pannedX = 0;
            pannedY = 0;
          }

          // Pan only the difference
          instance.panBy({
            x: ev.deltaX - pannedX,
            y: ev.deltaY - pannedY
          });
          pannedX = ev.deltaX;
          pannedY = ev.deltaY;
        });

        // Handle pinch
        this.hammer.on("pinchstart pinchmove", function (ev) {
          // On pinch start remember initial zoom
          if (ev.type === "pinchstart") {
            initialScale = instance.getZoom();
            instance.zoom(initialScale * ev.scale);
          }

          instance.zoom(initialScale * ev.scale);
        });

        // Prevent moving the page on some devices when panning over SVG
        options.svgElement.addEventListener(
          "touchmove",
          function (e) {
            e.preventDefault();
          }
        );
      },

      destroy: function () {
        this.hammer.destroy();
      }
    }
  };

  // SVG PAN-ZOOM Controls
  var panZoom = svgPanZoom("#cmrtaMap", options),
    zoomI = document.getElementById("zoom-in"),
    zoomO = document.getElementById("zoom-out"),
    reset = document.getElementById("reset");

  panZoom.resize();
  panZoom.center();

  zoomI.addEventListener("click", function (ev) {
    ev.preventDefault();
    panZoom.zoomIn();
  });

  zoomO.addEventListener("click", function (ev) {
    ev.preventDefault();
    panZoom.zoomOut();
  });

  reset.addEventListener("click", function (ev) {
    ev.preventDefault();
    panZoom.resetZoom();
  });

  window.onresize = function (event) {
    panZoom.resize();
    // panZoom.fit();
    panZoom.center();
  };

  // Close button on description box
  var descriptionBox = document.getElementById("description-box"),
    closeToggle = document.getElementsByClassName("closeToggle"),
    closeHeader = document.getElementById("closeBtn");

  var closeDescription = function () {
    var isOpen = descriptionBox.classList.contains("slide-in");
    descriptionBox.setAttribute("class", isOpen ? "slide-out" : "slide-in");
  };

  for (var i = 0; i < closeToggle.length; i++) {
    closeToggle[i].addEventListener("click", closeDescription, false);
  }

  // Load the html include file for the toll lane
  function loadMapInfo(url, element, color) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", url, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        element.innerHTML = this.responseText;
        didYouKnow(color);
        showSlides(slideIndex);
        sliderItems();
      }
    };
  };

  // Super Basic Slideshow
  var slideIndex = 1;

  function advanceSlides(n) {
    showSlides((slideIndex += n));
  };

  function showSlides(n) {
    var i;
    var x = document.getElementsByClassName("project-slides");
    if (n > x.length) {
      slideIndex = 1;
    }
    if (n < 1) {
      slideIndex = x.length;
    }
    for (i = 0; i < x.length; i++) {
      x[i].style.display = "none";
    }
    if (x.length !== 0) {
      x[slideIndex - 1].style.display = "block";
    }
  };

  // Next and Previous controls for slideshow
  var sliderItems = function () {
    var sliderClass = document.getElementsByClassName("project-slides-btn");

    var sliderControls = function () {
      if (hasClass(this, "left")) {
        advanceSlides(-1);
      } else if (hasClass(this, "right")) {
        advanceSlides(1);
      }
    }
    
    for (var i = 0; i < sliderClass.length; i++) {
      sliderClass[i].addEventListener("click", sliderControls);
    };

  };

  // Set background color based on project phase for did you know box
  function didYouKnow(color) {
    var youKnow = document.getElementById("didYouKnow");
    youKnow.setAttribute("class", color);
  };

  // Helper function to get an elements class attribute
  function hasClass(element, cls) {
    return (
      (" " + element.getAttribute("class") + " ").indexOf(" " + cls + " ") > -1
    );
  };

  var enabledClass = document.getElementsByClassName("enabled");

  // When a toll area is clicked slide open the #description-box and display the proper color for construction phase
  var enabledItems = function () {
    var isOpen = descriptionBox.classList.contains("slide-in");
    var mapinfo = document.getElementById("mapInfo");
    descriptionBox.setAttribute("class", isOpen ? "slide-out" : "slide-in");

    if (hasClass(this, "construction")) {
      loadMapInfo("/include/" + this.id + ".html", mapinfo, "orange");
      descriptionBox.setAttribute("class", "slide-in");
      closeHeader.scrollIntoView();
      closeHeader.setAttribute("class", "orange");
    } else if (hasClass(this, "development")) {
      loadMapInfo("/include/" + this.id + ".html", mapinfo, "green");
      descriptionBox.setAttribute("class", "slide-in");
      closeHeader.scrollIntoView();
      closeHeader.setAttribute("class", "green");
    } else {
      loadMapInfo("/include/" + this.id + ".html", mapinfo, "blue");
      descriptionBox.setAttribute("class", "slide-in");
      closeHeader.scrollIntoView();
      closeHeader.setAttribute("class", "blue");
    }
  };

  for (var i = 0; i < enabledClass.length; i++) {
    enabledClass[i].addEventListener("click", enabledItems);
  };

};