/* XD ORIGAMI LTD - site behaviour: mobile menu, smooth scroll, legal dialogs */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Current year in footer */
  var year = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = year;
  });

  /* Mobile menu */
  var toggle = document.getElementById('menu-toggle');
  var menu = document.getElementById('mobile-menu');

  function setMenu(open) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.classList.toggle('hidden', !open);
    var label = toggle.querySelector('.sr-only');
    if (label) label.textContent = open ? 'Close menu' : 'Open menu';
    var iconOpen = toggle.querySelector('.icon-open');
    var iconClose = toggle.querySelector('.icon-close');
    if (iconOpen) iconOpen.classList.toggle('hidden', open);
    if (iconClose) iconClose.classList.toggle('hidden', !open);
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768) setMenu(false);
    });
  }

  /* Smooth scroll for in-page links */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var hash = link.getAttribute('href');
      if (!hash || hash.length < 2) return;
      var target = document.getElementById(hash.slice(1));
      if (!target) return;

      e.preventDefault();
      setMenu(false);
      target.scrollIntoView({
        behavior: reduceMotion.matches ? 'auto' : 'smooth',
        block: 'start'
      });

      if (history.pushState) history.pushState(null, '', hash);

      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* Legal dialogs (Privacy Policy, Terms of Service) */
  var lastOpener = null;

  document.querySelectorAll('[data-dialog-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dialog = document.getElementById(btn.getAttribute('data-dialog-open'));
      if (!dialog) return;
      lastOpener = btn;
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
      document.documentElement.classList.add('dialog-open');
      var closeBtn = dialog.querySelector('[data-dialog-close]');
      if (closeBtn) closeBtn.focus();
    });
  });

  document.querySelectorAll('dialog').forEach(function (dialog) {
    dialog.querySelectorAll('[data-dialog-close]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        closeDialog(dialog);
      });
    });

    /* Click on the backdrop closes the dialog */
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) closeDialog(dialog);
    });

    /* Esc is handled natively by <dialog>; tidy up afterwards */
    dialog.addEventListener('close', function () {
      document.documentElement.classList.remove('dialog-open');
      if (lastOpener) {
        lastOpener.focus();
        lastOpener = null;
      }
    });

    /* Fallback Esc handling for browsers without showModal */
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && typeof dialog.showModal !== 'function') {
        closeDialog(dialog);
      }
    });
  });

  function closeDialog(dialog) {
    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
      document.documentElement.classList.remove('dialog-open');
      if (lastOpener) {
        lastOpener.focus();
        lastOpener = null;
      }
    }
  }
})();
