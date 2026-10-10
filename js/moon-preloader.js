/* Moon on mirrored water — Spine 3.8 intro, locally hosted. */
(() => {
  'use strict';
  const box = document.getElementById('loading-box');
  if (!box || window.moonPreloader) return;
  if (!['/', '/index.html'].includes(location.pathname)) { box.classList.add('loaded'); return; }
  const canvas = box.querySelector('canvas');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let active = false, ready = false, finished = false, frame = 0, deadline;
  let previousOverflow = '', renderer, pending, started = 0;
  function hide() {
    if (!active) return;
    active = false;
    clearTimeout(deadline);
    cancelAnimationFrame(frame);
    box.classList.add('loaded');
    box.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = previousOverflow;
    box.tabIndex = -1;
    if (document.activeElement === box) box.blur();
  }
  function end() { ready = true; if (finished || reduced.matches) hide(); }
  function draw(now) {
    if (!active || !renderer) return;
    try {
      const { gl, shader, batch, painter, matrix, skeleton, state, duration } = renderer;
      const elapsed = Math.min((now - started) / 1000, duration);
      state.update(Math.max(0, elapsed - renderer.elapsed));
      renderer.elapsed = elapsed;
      state.apply(skeleton);
      skeleton.updateWorldTransform();
      const ratio = Math.min(devicePixelRatio || 1, 2);
      const width = Math.round(canvas.clientWidth * ratio), height = Math.round(canvas.clientHeight * ratio);
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      gl.viewport(0, 0, width, height);
      // Keep the complete 16:9 composition visible on portrait screens too.
      const aspect = width / height;
      const worldWidth = Math.max(1600, 900 * aspect), worldHeight = worldWidth / aspect;
      matrix.ortho2d(-worldWidth / 2, -worldHeight / 2, worldWidth, worldHeight);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      shader.bind(); shader.setUniformi(spine.webgl.Shader.SAMPLER, 0);
      shader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, matrix.values);
      batch.begin(shader); painter.draw(batch, skeleton); batch.end(); shader.unbind();
      box.classList.add('animation-ready');
      if (elapsed >= duration) { finished = true; if (ready) hide(); return; }
      frame = requestAnimationFrame(draw);
    } catch (error) { fail(error); }
  }
  function fail(error) {
    console.warn('Intro unavailable; opening the page.', error);
    finished = true;
    hide();
  }
  function loadRenderer() {
    if (pending) return pending;
    pending = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/lib/spine/spine-webgl.js'; script.async = true;
      script.onerror = () => reject(new Error('Spine runtime failed to load'));
      script.onload = () => {
        try {
          const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: true });
          if (!gl) throw new Error('WebGL unavailable');
          const assets = new spine.webgl.AssetManager(gl);
          // Local previews use retained copies; deployed pages load assets from OSS.
          const localPreview = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
          const assetOrigin = localPreview ? '' : 'https://d3v3nblog.oss-cn-shenzhen.aliyuncs.com';
          const base = assetOrigin + '/img/moon-intro/act54side_nc_intro';
          assets.loadText(base + '.json'); assets.loadTextureAtlas(base + '.atlas');
          const loadDeadline = performance.now() + 7500;
          const poll = () => {
            if (performance.now() > loadDeadline) { reject(new Error("Intro assets timed out")); return; }
            if (assets.hasErrors()) { reject(new Error(JSON.stringify(assets.getErrors()))); return; }
            if (!assets.isLoadingComplete()) { setTimeout(poll, 40); return; }
            try {
              const reader = new spine.SkeletonJson(new spine.AtlasAttachmentLoader(assets.get(base + '.atlas')));
              const data = reader.readSkeletonData(JSON.parse(assets.get(base + '.json')));
              const skeleton = new spine.Skeleton(data);
              const state = new spine.AnimationState(new spine.AnimationStateData(data));
              const painter = new spine.webgl.SkeletonRenderer(gl); painter.premultipliedAlpha = false;
              resolve({ gl, assets, skeleton, state, painter, elapsed: 0,
                shader: spine.webgl.Shader.newTwoColoredTextured(gl),
                batch: new spine.webgl.PolygonBatcher(gl), matrix: new spine.webgl.Matrix4(),
                duration: data.findAnimation('intro').duration });
            } catch (error) { reject(error); }
          };
          poll();
        } catch (error) { reject(error); }
      };
      document.head.appendChild(script);
    });
    return pending;
  }
  let generation = 0;
  function start() {
    const current = ++generation;
    cancelAnimationFrame(frame); clearTimeout(deadline);
    if (!active) previousOverflow = document.body.style.overflow;
    active = true; ready = false; finished = reduced.matches;
    box.classList.remove('loaded', 'animation-ready'); box.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    deadline = setTimeout(hide, 8000);
    if (reduced.matches) return;
    loadRenderer().then(value => {
      if (!active || current !== generation) return;
      renderer = value; renderer.elapsed = 0;
      renderer.skeleton.setToSetupPose(); renderer.state.clearTracks();
      renderer.state.setAnimation(0, 'intro', false);
      started = performance.now(); frame = requestAnimationFrame(draw);
    }).catch(fail);
  }
  window.moonPreloader = { start, end, hide };
  box.addEventListener('click', hide);
  box.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); hide(); }
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') hide(); });
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); hide(); });
  reduced.addEventListener('change', () => { if (reduced.matches) hide(); });
  document.addEventListener('pjax:send', hide);
  document.addEventListener('pjax:error', hide);
  window.addEventListener('pageshow', event => { if (event.persisted) hide(); });
  window.addEventListener('pagehide', hide);
  start();
  // Third-party widgets must not hold the entry animation open.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', end, { once: true });
  else end();
})();
