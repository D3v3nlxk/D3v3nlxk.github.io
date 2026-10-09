/* Small progressive enhancements; articles and navigation work without this file. */
(() => {
  function initEditorial() {
    if (document.querySelector('.multimedia-page') && !document.getElementById('multimedia-style')) {
      const style = document.createElement('link');
      style.id = 'multimedia-style';
      style.rel = 'stylesheet';
      style.href = '/css/multimedia.css?v=1';
      document.head.append(style);
    }
    if (document.querySelector('.music-page')) {
      if (!document.getElementById('music-style')) {
        const style = document.createElement('link');
        style.id = 'music-style';
        style.rel = 'stylesheet';
        style.href = '/css/music.css?v=2';
        document.head.append(style);
      }
      import('/js/music.js?v=3').then(module => module.mount()).catch(() => {
        const message = document.querySelector('.player-message');
        if (message) message.textContent = 'The player could not load. Select a track title to listen on the original platform.';
      });
    }
    if (document.querySelector('.photography-page')) {
      if (!document.getElementById('photography-style')) {
        const style = document.createElement('link');
        style.id = 'photography-style';
        style.rel = 'stylesheet';
        style.href = '/css/photography.css?v=2';
        document.head.append(style);
      }
      if (document.querySelector('[data-photography]')) {
        import('/js/photography.js?v=2').then(module => module.mount()).catch(() => {
          // Photo links still open directly if the enhancement cannot load.
        });
      }
    }
    const path = window.location.pathname.replace(/index\.html$/, '');
    document.querySelectorAll('#nav .site-page').forEach(link => {
      const href = link.getAttribute('href');
      if (href === path || (href !== '/' && path.startsWith(href))) {
        link.setAttribute('aria-current', 'page');
      } else link.removeAttribute('aria-current');
    });
    const menu = document.querySelector('#toggle-menu a');
    if (menu) {
      menu.setAttribute('role', 'button');
      menu.setAttribute('aria-label', 'Open navigation menu');
      menu.setAttribute('aria-controls', 'sidebar-menus');
      menu.setAttribute('aria-expanded', String(document.querySelector('#sidebar-menus')?.classList.contains('open')));
      menu.onkeydown = event => {
        if (event.key === ' ') { event.preventDefault(); menu.click(); }
      };
    }
    document.querySelectorAll('a[href="#journal"]').forEach(link => {
      link.onclick = event => {
        if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const target = document.getElementById('journal');
        if (!target) return;
        event.preventDefault();
        const inset = document.getElementById('nav').getBoundingClientRect().height + 20;
        const top = target.getBoundingClientRect().top + window.scrollY - inset;
        if (location.hash !== '#journal') history.pushState(history.state, '', '#journal');
        window.scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      };
    });
    const filters = document.querySelector('.journal-filters');
    if (!filters || filters.dataset.ready) return;
    filters.dataset.ready = 'true';
    const posts = [...document.querySelectorAll('#recent-posts > .recent-post-item')];
    const total = String(posts.length).padStart(2, '0');
    document.querySelector('.journal-count').textContent = total;
    filters.querySelector('[data-filter="all"] span').textContent = total;
    filters.addEventListener('click', event => {
      const button = event.target.closest('button[data-filter]');
      if (!button) return;
      const filter = button.dataset.filter;
      let count = 0;
      posts.forEach(post => {
        const tags = [...post.querySelectorAll('.article-meta__tags')].map(tag => tag.textContent.trim());
        post.hidden = filter !== 'all' && !tags.includes(filter);
        if (!post.hidden) count++;
      });
      filters.querySelectorAll('button').forEach(item => {
        item.classList.toggle('is-active', item === button);
        item.setAttribute('aria-pressed', String(item === button));
      });
      document.querySelector('.journal-count').textContent = String(count).padStart(2, '0');
      filters.querySelector('.journal-filter-caption').textContent = `${count} ${count === 1 ? "post" : "posts"}`;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initEditorial);
  else initEditorial();
  document.addEventListener('pjax:complete', initEditorial);
  const observeMenu = () => {
    const sidebar = document.querySelector('#sidebar-menus');
    if (!sidebar) return;
    new MutationObserver(() => {
      document.querySelector('#toggle-menu a')?.setAttribute('aria-expanded', String(sidebar.classList.contains('open')));
    }).observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && sidebar.classList.contains('open')) document.querySelector('#menu-mask')?.click();
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observeMenu);
  else observeMenu();
})();
