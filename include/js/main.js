const ctrmaInteractiveMap = function () {

  let slideIndex = 1;
  const descriptionBox = document.getElementById('description-box');
  const closeHeader = document.getElementById('closeBtn');
  let currentToll = null;

  // SVG PAN-ZOOM Options and event handlers for mobile
  const options = {
    fit: 1,
    contain: true,
    center: 1,
    zoomScaleSensitivity: 0.2,
    customEventsHandler: {
      haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel'],
      init: function (options) {
        const instance = options.instance,
          initialScale = 1,
          pannedX = 0,
          pannedY = 0;

        // Init Hammer
        // Listen only for pointer and touch events
        this.hammer = Hammer(options.svgElement, {
          inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput,
        });

        // Enable pinch
        this.hammer.get('pinch').set({
          enable: true,
        });

        // Handle double tap
        this.hammer.on('doubletap', function (ev) {
          instance.zoomIn();
        });

        // Handle pan
        this.hammer.on('panstart panmove', function (ev) {
          // On pan start reset panned variables
          if (ev.type === 'panstart') {
            pannedX = 0;
            pannedY = 0;
          }

          // Pan only the difference
          instance.panBy({
            x: ev.deltaX - pannedX,
            y: ev.deltaY - pannedY,
          });
          pannedX = ev.deltaX;
          pannedY = ev.deltaY;
        });

        // Handle pinch
        this.hammer.on('pinchstart pinchmove', function (ev) {
          // On pinch start remember initial zoom
          if (ev.type === 'pinchstart') {
            initialScale = instance.getZoom();
            instance.zoom(initialScale * ev.scale);
          }

          instance.zoom(initialScale * ev.scale);
        });

        // Prevent moving the page on some devices when panning over SVG
        options.svgElement.addEventListener('touchmove', function (e) {
          e.preventDefault();
        });
      },

      destroy: function () {
        this.hammer.destroy();
      },
    },
  };

  // SVG PAN-ZOOM Controls
  const panZoom = svgPanZoom('#cmrtaMap', options),
    zoomI = document.getElementById('zoom-in'),
    zoomO = document.getElementById('zoom-out'),
    reset = document.getElementById('reset');

  panZoom.resize();
  panZoom.center();

  zoomI.addEventListener('click', function (ev) {
    ev.preventDefault();
    panZoom.zoomIn();
  });

  zoomO.addEventListener('click', function (ev) {
    ev.preventDefault();
    panZoom.zoomOut();
  });

  reset.addEventListener('click', function (ev) {
    ev.preventDefault();
    panZoom.resetZoom();
  });

  window.onresize = function (event) {
    panZoom.resize();
    // panZoom.fit();
    panZoom.center();
  };

  const getClosest = function (elem, selector) {
    for (; elem && elem !== document; elem = elem.parentNode) {
      if (elem.matches(selector)) return elem;
    }
    return null;
  };

  // Load the html include file for the toll lane
  function loadMapInfo(url, element, color) {
    const xhttp = new XMLHttpRequest();
    xhttp.open('GET', url, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        element.innerHTML = this.responseText;
        didYouKnow(color);
        showSlides(slideIndex);
        paginationInit()
        const images = document.querySelectorAll('.lazy-load');
        const observer = lozad(images);
        observer.observe();
      }
    };
  }

  const closeDescription = function (event) {
    event.preventDefault();
    const isOpen = descriptionBox.classList.contains('slide-in');
    let currentTollFocus = currentToll.querySelector('[aria-labelledby]')
    descriptionBox.blur();
    currentTollFocus.focus();
    descriptionBox.setAttribute('class', isOpen ? 'slide-out' : 'slide-in');
    descriptionBox.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
  };

  // Set background color based on project phase for did you know box
  function didYouKnow(color) {
    var youKnow = document.getElementById('didYouKnow');
    youKnow.setAttribute('class', color);
  }

  // Helper function to get an elements class attribute
  function hasClass(element, cls) {
    return (' ' + element.getAttribute('class') + ' ').indexOf(' ' + cls + ' ') > -1;
  }

  // When a toll area is clicked slide open the #description-box and display the proper color for construction phase
  const enabledItems = function (ev, tollRoad) {
    ev.preventDefault();

    const isOpen = descriptionBox.classList.contains('slide-in');
    const mapinfo = document.getElementById('mapInfo');
    descriptionBox.focus();
    descriptionBox.setAttribute('class', isOpen ? 'slide-out' : 'slide-in');
    descriptionBox.setAttribute('aria-hidden', isOpen ? 'true' : 'false');


    if (hasClass(tollRoad, 'construction')) {
      loadMapInfo('/include/' + tollRoad.id + '.html', mapinfo, 'orange');
      descriptionBox.setAttribute('class', 'slide-in');
      closeHeader.scrollIntoView();
      closeHeader.setAttribute('class', 'orange');
    } else if (hasClass(tollRoad, 'development')) {
      loadMapInfo('/include/' + tollRoad.id + '.html', mapinfo, 'green');
      descriptionBox.setAttribute('class', 'slide-in');
      closeHeader.scrollIntoView();
      closeHeader.setAttribute('class', 'green');
    } else {
      loadMapInfo('/include/' + tollRoad.id + '.html', mapinfo, 'blue');
      descriptionBox.setAttribute('class', 'slide-in');
      closeHeader.scrollIntoView();
      closeHeader.setAttribute('class', 'blue');
    }
  };

  // Next/previous controls
  const advanceSlides = (index) => {
    slideIndex += index;
    showSlides(slideIndex);
    updatePagination(slideIndex);
  }

  const currentSlide = (dot) => {
    dot.preventDefault();
    const currentDot = dot.target.getAttribute('data-slide-number')
    showSlides(slideIndex = currentDot);
    updatePagination(slideIndex = currentDot);
  }

  const showSlides = (index) => {
    let i;
    const slides = document.getElementsByClassName("project-slides");
    if (index > slides.length) { slideIndex = 1 }
    if (index < 1) { slideIndex = slides.length }
    for (i = 0; i < slides.length; i++) {
      slides[i].setAttribute('aria-hidden', true);
      slides[i].id = `slide${i + 1}`;
    }
    slides[slideIndex - 1].setAttribute('aria-hidden', false);
  }

  const updatePagination = (index) => {
    const pagination = document.getElementsByClassName("slideshow-pagination-dot");
    for (let i = 0; i < pagination.length; i++) {
      pagination[i].className = pagination[i].className.replace(" active", "");
    }
    pagination[slideIndex - 1].className += " active";
  }

  const paginationInit = () => {
    const paginationContainer = document.querySelector(".slideshow-pagination");

    if (!paginationContainer) return;

    const slides = document.querySelectorAll(".project-slides");
    const paginationDot = document.createElement("button");
    paginationDot.className = "slideshow-pagination-dot";
    const paginationText = document.createElement("span");
    paginationText.className = "screen-reader-text";
    paginationDot.appendChild(paginationText);

    for (let i = 0; i < slides.length; i++) {
      let slideNum = i + 1;
      paginationDot.setAttribute('data-slide-number', slideNum);
      paginationDot.setAttribute('aria-controls', 'slide' + slideNum);
      paginationText.textContent = `Go to Slide ${slideNum} of ${slides.length}`;
      var dupDot = paginationDot.cloneNode(true);
      paginationContainer.appendChild(dupDot);
    };

    const dots = document.querySelectorAll(".slideshow-pagination-dot");
    const firstDot = dots[0];
    firstDot.className += " active";
  }

  const clickHandler = (event) => {

    if (event.target.classList.contains('prev')) {
      advanceSlides(-1)
    }
    if (event.target.classList.contains('next')) {
      advanceSlides(1)
    }
    if (event.target.classList.contains('slideshow-pagination-dot')) {
      currentSlide(event)
    }

    if (event.target.tagName === 'path' || event.target.tagName === 'rect' || event.target.tagName === 'a') {
      currentToll = getClosest(event.target, '.enabled')
      if (currentToll) {
        enabledItems(event, currentToll);
      }
    }

    if (event.target.classList.contains('project-slides-btn')) {
      sliderControls(event);
    }

    if (event.target.classList.contains('closeToggle')) {
      closeDescription(event);
    }
    return
  }

  document.documentElement.addEventListener('click', clickHandler, false);

};
