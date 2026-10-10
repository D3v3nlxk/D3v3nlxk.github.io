/* Local artwork, loaded one slide at a time; compatible with PJAX. */
(() => {
  let cleanup = () => {}, listPromise;
  function mount() {
    cleanup();
    const root = document.querySelector('[data-cover-slideshow]');
    if (!root) return;
    const images = [...root.querySelectorAll('.cover-slide')];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const abort = new AbortController();
    const previous = root.querySelector('[data-cover-prev]');
    const fitEdge = () => {
      const fraction = matchMedia('(max-width:600px)').matches ? .08 : .15;
      const run = fraction * root.clientWidth * previous.offsetHeight / root.clientHeight;
      root.style.setProperty('--edge-run', `${run}px`);
      root.style.setProperty('--edge-left', `${fraction * root.clientWidth / 2 - run / 2}px`);
      const rise = fraction === .08 ? 0 : .11 * root.clientHeight;
      root.style.setProperty('--bottom-angle', `${-Math.atan2(rise, root.clientWidth) * 180 / Math.PI}deg`);
      root.style.setProperty('--cover-right-inset', `${Math.max(0, root.getBoundingClientRect().right - document.documentElement.clientWidth)}px`);
    };
    const resize = new ResizeObserver(fitEdge);
    resize.observe(root);
    window.addEventListener('resize', fitEdge, { signal: abort.signal });
    fitEdge();
    let disposed = false, slides = [], index = 0, front = 0, timer, pending = false;
    let paused = reduced.matches;
    const schedule = () => {
      clearTimeout(timer);
      if (!disposed && !paused && !document.hidden && slides.length > 1) timer = setTimeout(() => change(1), 6000);
    };
    async function change(direction) {
      if (pending || slides.length < 2 || disposed) return;
      clearTimeout(timer); pending = true;
      const next = (index + direction + slides.length) % slides.length;
      const image = images[1 - front];
      try {
        image.src = slides[next];
        await image.decode();
        if (disposed) return;
        image.classList.add('is-active'); images[front].classList.remove('is-active');
        front = 1 - front; index = next;
      } catch (_) { /* Keep the last working cover when a file cannot load. */ }
      finally { pending = false; schedule(); }
    }
    root.querySelector('[data-cover-prev]').addEventListener('click', () => change(-1), { signal: abort.signal });
    root.querySelector('[data-cover-next]').addEventListener('click', () => change(1), { signal: abort.signal });
    document.addEventListener('visibilitychange', schedule, { signal: abort.signal });
    reduced.addEventListener('change', () => { paused = reduced.matches; schedule(); }, { signal: abort.signal });
    listPromise ||= fetch('/data/ambience-covers.json?v=3').then(r => { if (!r.ok) throw new Error('Cover list unavailable'); return r.json(); }).catch(() => []);
    listPromise.then(list => { if (!disposed) { slides = list; schedule(); } });
    cleanup = () => { disposed = true; clearTimeout(timer); resize.disconnect(); abort.abort(); };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
  document.addEventListener('pjax:send', () => cleanup());
  document.addEventListener('pjax:complete', mount);
})();
