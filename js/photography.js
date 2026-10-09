import PhotoSwipeLightbox from '/lib/photoswipe/photoswipe-lightbox.esm.min.js';

let lightbox;
let observer;
let mounted;
let generation = 0;

function cleanUp() {
  generation++;
  lightbox?.destroy();
  observer?.disconnect();
  lightbox = observer = mounted = undefined;
}
document.addEventListener('pjax:send', cleanUp);

// Balance each row using known dimensions; do not wait for image downloads.
function balanceRows(grid) {
  const frames = [...grid.children];
  const width = grid.clientWidth;
  if (!width) return;
  if (window.innerWidth <= 700) {
    grid.classList.remove('is-balanced');
    return;
  }
  const gap = 20;
  const target = width > 1000 ? 360 : 290;
  const ratios = frames.map(frame => Number(frame.style.getPropertyValue('--photo-ratio')));
  const costs = Array(frames.length + 1).fill(Infinity);
  const groups = [];
  costs[frames.length] = 0;
  for (let start = frames.length - 1; start >= 0; start--) {
    let sum = 0;
    for (let end = start; end < Math.min(start + 4, frames.length); end++) {
      sum += ratios[end];
      const height = (width - gap * (end - start)) / sum;
      const cost = (height - target) ** 2 + costs[end + 1];
      if (cost < costs[start]) {
        costs[start] = cost;
        groups[start] = end + 1;
      }
    }
  }
  for (let start = 0; start < frames.length;) {
    const end = groups[start];
    const total = ratios.slice(start, end).reduce((a, b) => a + b, 0);
    const height = (width - gap * (end - start - 1)) / total;
    for (let i = start; i < end; i++) {
      // Round down slightly to avoid wrapping caused by fractional CSS pixels.
      frames[i].style.setProperty('--frame-width', `${Math.floor(height * ratios[i] * 100) / 100}px`);
    }
    start = end;
  }
  grid.classList.add('is-balanced');
}

function loadLightboxStyles() {
  let link = document.getElementById('photoswipe-style');
  if (link?.sheet) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (!link) {
      link = document.createElement('link');
      link.id = 'photoswipe-style';
      link.rel = 'stylesheet';
      link.href = '/lib/photoswipe/photoswipe.css';
      document.head.append(link);
    }
    link.addEventListener('load', resolve, { once: true });
    link.addEventListener('error', reject, { once: true });
  });
}

export async function mount() {
  const gallery = document.querySelector('[data-photography]');
  if (!gallery || mounted === gallery) return;
  cleanUp();
  mounted = gallery;
  const currentGeneration = generation;
  const grid = gallery.querySelector('.photo-grid');
  balanceRows(grid);
  observer = new ResizeObserver(() => balanceRows(grid));
  observer.observe(grid);
  gallery.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => img.closest('.photo-frame').classList.add('photo-image-error'));
    img.addEventListener('load', () => img.closest('.photo-frame').classList.remove('photo-image-error'));
    if (img.complete && !img.naturalWidth) img.closest('.photo-frame').classList.add('photo-image-error');
  });
  try { await loadLightboxStyles(); } catch { return; } // Direct image links remain available.
  if (currentGeneration !== generation || !gallery.isConnected) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  lightbox = new PhotoSwipeLightbox({
    gallery,
    children: 'a.photo-open',
    pswpModule: () => import('/lib/photoswipe/photoswipe.esm.min.js'),
    bgOpacity: 1,
    showHideAnimationType: reduceMotion ? 'none' : 'zoom',
    showAnimationDuration: reduceMotion ? 0 : 260,
    hideAnimationDuration: reduceMotion ? 0 : 220,
    paddingFn: viewport => ({ top: 65, bottom: 70, left: viewport.x < 700 ? 0 : 55, right: viewport.x < 700 ? 0 : 55 }),
    closeTitle: 'Close (Esc)',
    zoomTitle: 'Zoom in / out',
    arrowPrevTitle: 'Previous photo',
    arrowNextTitle: 'Next photo',
    errorMsg: 'This photo could not load. Close and try again.',
    indexIndicatorSep: ' / '
  });
  const instance = lightbox;
  instance.on('uiRegister', () => {
    instance.pswp.ui.registerElement({
      name: 'photo-caption',
      order: 9,
      isButton: false,
      appendTo: 'root',
      onInit: (element, pswp) => {
        const title = document.createElement('span');
        const original = document.createElement('a');
        original.textContent = 'View original ↗';
        original.target = '_blank';
        original.rel = 'noopener';
        element.append(title, original);
        const update = () => {
          const anchor = pswp.currSlide.data.element;
          title.textContent = anchor.dataset.photoTitle;
          original.href = anchor.dataset.original;
        };
        pswp.on('change', update);
      }
    });
  });
  instance.init();
}
