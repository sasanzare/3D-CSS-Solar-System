window.addEventListener('load', function() {

  var body = document.body,
      universe = document.getElementById('universe'),
      solarsys = document.getElementById('solar-system');

  // Class helpers
  function addClass(el, cls) { el.classList.add(cls); }
  function removeClass(el, cls) { el.classList.remove(cls); }
  function toggleClass(el, cls) { el.classList.toggle(cls); }

  var init = function() {
    removeClass(body, 'view-2D');
    removeClass(body, 'opening');
    addClass(body, 'view-3D');
    setTimeout(function() {
      removeClass(body, 'hide-UI');
      addClass(body, 'set-speed');
    }, 2000);
  };

  var setView = function(view) {
    universe.className = view;
  };

  document.getElementById('toggle-data').addEventListener('click', function(e) {
    toggleClass(body, 'data-open');
    toggleClass(body, 'data-close');
    e.preventDefault();
  });

  document.getElementById('toggle-controls').addEventListener('click', function(e) {
    toggleClass(body, 'controls-open');
    toggleClass(body, 'controls-close');
    e.preventDefault();
  });

  var dataLinks = document.querySelectorAll('#data a');
  for (var i = 0; i < dataLinks.length; i++) {
    dataLinks[i].addEventListener('click', function(e) {
      var ref = this.className;
      solarsys.className = ref;
      var siblings = this.parentNode.querySelectorAll('a');
      for (var j = 0; j < siblings.length; j++) {
        removeClass(siblings[j], 'active');
      }
      addClass(this, 'active');
      e.preventDefault();
    });
  }

  document.querySelector('.set-view').addEventListener('click', function() {
    toggleClass(body, 'view-3D');
    toggleClass(body, 'view-2D');
  });
  document.querySelector('.set-zoom').addEventListener('click', function() {
    toggleClass(body, 'zoom-large');
    toggleClass(body, 'zoom-close');
  });
  document.querySelector('.set-speed').addEventListener('click', function() {
    setView('scale-stretched set-speed');
  });
  document.querySelector('.set-size').addEventListener('click', function() {
    setView('scale-s set-size');
  });
  document.querySelector('.set-distance').addEventListener('click', function() {
    setView('scale-d set-distance');
  });

  init();

});
