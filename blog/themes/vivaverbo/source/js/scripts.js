(function () {
  'use strict';

  var sidebar, toolbar, menuButton, searchField, modalMask, catMenu, subsButton,
    postMenu, facebookID = '175199016196268', subsVisible = false;

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function removeClass(el, className) {
    if (el.classList) {
      el.classList.remove(className);
    } else {
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
  }

  function addClass(el, className) {
    if (el.classList) {
      el.classList.add(className);
    } else {
      el.className += ' ' + className;
    }
  }

  function toggleClass(el, className) {
    var classes, existingIndex;

    if (el.classList) {
      el.classList.toggle(className);
    } else {
      classes = el.className.split(' ');
      existingIndex = classes.indexOf(className);

      if (existingIndex >= 0) {
        classes.splice(existingIndex, 1);
      } else {
        classes.push(className);
      }

      el.className = classes.join(' ');
    }
  }

  function hasClass(el, className) {
    if (el.classList) {
      return el.classList.contains(className);
    }
    return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
  }

  function killEvent(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  function hideMenus() {
    if (postMenu) {
      postMenu.style.display = 'none';
    }
    removeClass(catMenu, 'dropdown');
  }

  function menuClick(event) {
    killEvent(event);

    sidebar.style.display = 'block';
    modalMask.style.display = 'block';
    window.setTimeout(function () {
      removeClass(sidebar, 'hidden');
      removeClass(modalMask, 'hidden');
    });
  }

  function globalClick() {
    hideMenus();
    addClass(sidebar, 'hidden');
    addClass(modalMask, 'hidden');
    // addClass(subDialog, 'hidden');
    window.setTimeout(function () {
      sidebar.style.display = 'none';
      modalMask.style.display = 'none';
      // subDialog.style.display = 'none';
    }, 550);
  }

  function searchClick(event) {
    var open = hasClass(toolbar, 'search-open');

    killEvent(event);
    hideMenus();

    if (open) {
      removeClass(toolbar, 'opening-search');
      searchField.blur();
      window.setTimeout(function () {
        removeClass(toolbar, 'search-open');
      }, 450);
    } else {
      addClass(toolbar, 'opening-search');
      searchField.focus();
      window.setTimeout(function () {
        addClass(toolbar, 'search-open');
      }, 450);
    }
  }

  function catClick(event) {
    killEvent(event);
    hideMenus();
    toggleClass(catMenu, 'dropdown');
  }

  // function subscribe() {
  //   killEvent(event);
  //
  //   addClass(sidebar, 'hidden');
  //   subDialog.style.display = 'block';
  //   modalMask.style.display = 'block';
  //   window.setTimeout(function () {
  //     removeClass(subDialog, 'hidden');
  //     removeClass(modalMask, 'hidden');
  //   });
  // }

  function share(proveedor, permalink, texto, caption) {
    var settings, windowSettings, url;

    settings = {
      facebook: {
        baseURL: 'https://www.facebook.com/dialog/feed?app_id=%fid&link=%u&name=%c&description=%t&display=popup&caption=vivaverbo.com',
        height: 325,
        width: 540,
        maxText: 4977,
        windowName: 'fbWindow'
      },
      google: {
        baseURL: 'https://plus.google.com/share?url=%u',
        height: 460,
        width: 600,
        windowName: 'goWindow'
      },
      twitter: {
        baseURL: 'https://twitter.com/intent/tweet?url=%u&text=%t&via=vivaverbo',
        height: 300,
        width: 600,
        maxText: 117,
        windowName: 'twWindow'
      }
    };

    windowSettings = 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes';
    windowSettings += ',height=' + settings[proveedor].height;
    windowSettings += ',width=' + settings[proveedor].width;

    url = settings[proveedor].baseURL;
    // Generamos el texto del item y terminamos de montar la URL a cargar
    if (settings[proveedor].maxText && texto) {
      if (texto.length > settings[proveedor].maxText) {
        texto = texto.slice(0, settings[proveedor].maxText - 1) + '…';
      }
      url = url.replace('%t', encodeURIComponent(texto));
    } else {
      url = url.replace('%t', '');
    }
    url = url.replace('%u', encodeURIComponent(permalink));
    url = url.replace('%fid', facebookID);

    if (caption) {
      url = url.replace('%c', caption);
    }

    window.open(url, settings[proveedor].windowName, windowSettings);

    return false;
  }

  function postMenuClick(event) {
    killEvent(event);
    hideMenus();
    postMenu.style.display = 'block';
  }

  function onScroll() {
    if (window.scrollY > 56) {
      if (!subsVisible) {
        removeClass(subsButton, 'hidden');
        subsVisible = true;
      }
    } else {
      if (subsVisible) {
        addClass(subsButton, 'hidden');
        subsVisible = false;
      }
    }
  }

  function subsClick() {
    ga('send', 'pageview', '/subscriptionForm', {
      'title': 'Formulario de suscripción',
      'hitCallback': function() {
        window.open('http://eepurl.com/b18WXj', '_blank');
      }
    });
  }

  ready(function () {
    var searchButton, catButton, postMenuButton, noClose, html;

    html = document.querySelector('html');
    sidebar = document.querySelector('.sidebar');
    modalMask = document.querySelector('.mask-modal');
    noClose = document.querySelector('.no-close');
    toolbar = document.querySelector('.toolbar');
    menuButton = document.querySelector('.toolbar .menu-btn');
    postMenuButton = document.querySelector('.post .post-menu-btn');
    postMenu = document.querySelector('.post .dropdown-menu');
    subsButton = document.querySelector('.toolbar .subscribe-btn');
    searchButton = document.querySelector('.toolbar .search-btn');
    searchField = document.querySelector('.search .textfield');
    catButton = document.querySelector('.toolbar .cat-dropdown');
    catMenu = document.querySelector('.toolbar .secciones');
    // subDialog = document.querySelector('.dialog.subscribe');
    // subscribes = document.querySelectorAll('.subscribe');

    window.addEventListener('scroll', onScroll);
    menuButton.addEventListener('click', menuClick);
    html.addEventListener('click', globalClick);
    noClose.addEventListener('click', killEvent);
    searchButton.addEventListener('click', searchClick);
    catButton.addEventListener('click', catClick);
    subsButton.addEventListener('click', subsClick);
    if (postMenuButton) {
      postMenuButton.addEventListener('click', postMenuClick);
    }

    // for (i = 0; i < subscribes.length; i += 1) {
    //   subscribes[i].addEventListener('click', subscribe);
    // }

    window.vivaverbo = {
      share: share
    };
  });
}());
