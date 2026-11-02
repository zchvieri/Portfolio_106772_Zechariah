'use strict';

/* =====================================================
   Portfolio JavaScript - 10 simple features
   1.  Mobile menu toggle
   2.  Smooth scrolling
   3.  Highlight current section in the navigation
   4.  Back to top button
   5.  Dark / light mode (saved with localStorage)
   6.  Project category filter
   7.  Project counter ("Showing X of 5 projects")
   8.  Escape key closes the mobile menu
   9.  Contact form validation
   10. Message character counter
   ===================================================== */

// Tell CSS that JavaScript is running
document.documentElement.classList.add('js');

/* ---------- 1. Mobile menu toggle ---------- */
function initMenuToggle() {
  const button = document.getElementById('menu-toggle');
  const icon = document.getElementById('menu-icon');
  const list = document.getElementById('nav-list');
  if (!button || !icon || !list) return;

  function setMenu(isOpen) {
    list.classList.toggle('open', isOpen);
    button.setAttribute('aria-expanded', String(isOpen));
    button.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    icon.textContent = isOpen ? '✕' : '☰';
  }

  button.addEventListener('click', () => setMenu(!list.classList.contains('open')));

  // Close the menu after choosing a link
  list.addEventListener('click', (event) => {
    if (event.target.tagName === 'A') setMenu(false);
  });
}

/* ---------- 2. Smooth scrolling ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ---------- 3. Highlight current section ---------- */
function initActiveNav() {
  const links = document.querySelectorAll('#nav-list a');
  const sections = document.querySelectorAll('main section[id]');

  function highlight() {
    let current = '';
    sections.forEach((section) => {
      // A section is "current" once its top passes the header
      if (window.scrollY >= section.offsetTop - 120) current = section.id;
    });

    links.forEach((link) => {
      if (link.getAttribute('href') === '#' + current) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  window.addEventListener('scroll', highlight, { passive: true });
  highlight();   // run once when the page opens
}

/* ---------- 4. Back to top button ---------- */
function initBackToTop() {
  const button = document.getElementById('back-to-top');
  if (!button) return;

  window.addEventListener('scroll', () => {
    button.hidden = window.scrollY < 400;
  }, { passive: true });

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- 5. Dark / light mode ---------- */
function initThemeToggle() {
  const button = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  if (!button || !icon) return;

  function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    icon.textContent = isDark ? '☀️' : '🌙';
    button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  // Use the saved choice (if the browser allows it), otherwise light mode
  let saved = null;
  try {
    saved = localStorage.getItem('theme');
  } catch (error) {
    saved = null;
  }
  applyTheme(saved === 'dark' ? 'dark' : 'light');

  button.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem('theme', next);
    } catch (error) {
      console.warn('Could not save theme:', error.message);
    }
  });
}

/* ---------- 6. Project category filter ---------- */
function initProjectFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const projects = document.querySelectorAll('.project');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      // Mark the clicked button as active
      buttons.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');

      // Show only the projects in the chosen category
      const filter = button.dataset.filter;
      projects.forEach((project) => {
        project.hidden = !(filter === 'all' || project.dataset.category === filter);
      });
    });
  });
}

/* ---------- 7. Project counter ---------- */
function initProjectCounter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const projects = document.querySelectorAll('.project');
  const counter = document.getElementById('project-count');
  if (!counter) return;

  // Count the projects that are not hidden and show the number
  function updateCounter() {
    const visible = Array.from(projects).filter((project) => !project.hidden).length;
    counter.textContent = 'Showing ' + visible + ' of ' + projects.length + ' projects';
  }

  // This listener is added after the filter's listener, so it runs after the filter has finished
  buttons.forEach((button) => button.addEventListener('click', updateCounter));
  updateCounter();
}

/* ---------- 8. Escape key closes the mobile menu ---------- */
function initEscapeKey() {
  const button = document.getElementById('menu-toggle');
  const list = document.getElementById('nav-list');
  if (!button || !list) return;

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && list.classList.contains('open')) {
      button.click();   // reuse the menu button so the icon and labels update
      button.focus();
    }
  });
}

/* ---------- 9. Contact form validation ---------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const success = document.getElementById('form-success');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Each rule returns an error message, or '' when the value is fine
  // (the message can be any length, it just cannot be empty)
  const rules = {
    name: (value) => (value === '' ? 'Please enter your name.' : ''),
    email: (value) => (emailPattern.test(value) ? '' : 'Please enter a valid email, like name@example.com.'),
    message: (value) => (value === '' ? 'Please write a message.' : '')
  };

  function checkField(field) {
    const error = rules[field.name](field.value.trim());
    document.getElementById(field.id + '-error').textContent = error;
    field.classList.toggle('invalid', error !== '');
    field.setAttribute('aria-invalid', String(error !== ''));
    return error === '';
  }

  const fields = form.querySelectorAll('input, textarea');
  fields.forEach((field) => field.addEventListener('blur', () => checkField(field)));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    success.textContent = '';

    let firstInvalid = null;
    fields.forEach((field) => {
      if (!checkField(field) && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // Front-end only: there is no server, so we just show a message
    success.textContent = 'Thank you ';
    form.reset();
    document.getElementById('message-count').textContent = '0 / 500 characters';
  });
}

/* ---------- 10. Message character counter ---------- */
function initMessageCounter() {
  const message = document.getElementById('message');
  const counter = document.getElementById('message-count');
  if (!message || !counter) return;

  message.addEventListener('input', () => {
    counter.textContent = message.value.length + ' / ' + message.maxLength + ' characters';
  });
}

/* ---------- Start when the page is ready ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initMenuToggle();
  initSmoothScroll();
  initActiveNav();
  initBackToTop();
  initThemeToggle();
  initProjectFilter();
  initProjectCounter();
  initEscapeKey();
  initContactForm();
  initMessageCounter();
});
