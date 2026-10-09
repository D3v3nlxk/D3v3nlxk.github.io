let dispose;
let mounted;
document.addEventListener('pjax:send', () => { dispose?.(); });

export function mount() {
  const room = document.getElementById('music-room');
  if (!room || mounted === room) return;
  dispose?.();
  mounted = room;
  const data = JSON.parse(room.querySelector('#music-data').textContent);
  const queue = [...data.songs.map((t, i) => ({ ...t, key: `song-${i}` })),
    ...data.playlist.tracks.map((t, i) => ({ ...t, key: `playlist-${i}` }))].filter(t => t.audio);
  const audio = room.querySelector('audio');
  const player = room.querySelector('.listening-player');
  const message = room.querySelector('.player-message');
  const state = room.querySelector('.player-state');
  const previous = room.querySelector('.player-previous');
  const next = room.querySelector('.player-next');
  const abort = new AbortController();
  const options = { signal: abort.signal };
  let selected = -1;
  let version = 0;
  let timer;
  let disposed = false;
  previous.disabled = next.disabled = true;

  function resetTimer() { clearTimeout(timer); }
  function failed() {
    if (disposed || selected < 0) return;
    resetTimer();
    player.classList.add('has-error');
    player.classList.remove('is-playing');
    state.textContent = 'TRY THE ORIGINAL';
    message.textContent = 'This track is unavailable here. Open the original platform or choose another track.';
    updateRows(false);
  }
  function updateRows(playing) {
    room.querySelectorAll('[data-track-row]').forEach(row => {
      const active = row.dataset.trackRow === queue[selected]?.key;
      row.classList.toggle('is-selected', active);
      const button = row.querySelector('button.track-play');
      if (!button) return;
      const title = row.querySelector('.track-title').textContent;
      button.setAttribute('aria-label', `${active && playing ? 'Pause' : 'Play'} ${title}`);
      button.setAttribute('aria-pressed', String(active && playing));
      button.querySelector('.track-play-glyph').textContent = active && playing ? 'Ⅱ' : '▶';
    });
  }
  async function play(index) {
    if (disposed || !queue.length) return;
    const requestVersion = ++version;
    selected = (index + queue.length) % queue.length;
    const track = queue[selected];
    audio.pause();
    resetTimer();
    audio.src = track.audio;
    room.querySelector('.now-title').textContent = track.title;
    room.querySelector('.now-artist').textContent = track.artist;
    const source = room.querySelector('.now-source');
    source.href = track.url;
    source.hidden = false;
    const cover = document.createElement('img');
    cover.alt = '';
    cover.className = 'no-lightbox';
    cover.src = `${track.cover}?v=2`;
    cover.onerror = () => { cover.onerror = null; cover.src = '/img/music/cover-fallback.svg'; };
    room.querySelector('.record-label').replaceChildren(cover);
    previous.disabled = next.disabled = false;
    player.classList.remove('has-error');
    state.textContent = 'LOADING';
    message.textContent = `Loading ${track.title}…`;
    updateRows(false);
    timer = setTimeout(() => {
      if (requestVersion !== version || disposed) return;
      audio.pause();
      failed();
      // Cancel a stalled request so it cannot unexpectedly play later.
      audio.removeAttribute('src');
      audio.load();
    }, 15000);
    try { await audio.play(); }
    catch (error) {
      if (requestVersion !== version || disposed) return;
      if (error.name === 'NotAllowedError') {
        resetTimer();
        state.textContent = 'READY';
        message.textContent = 'Press play to continue listening.';
      } else if (error.name !== 'AbortError') failed();
    }
  }
  room.addEventListener('click', event => {
    const button = event.target.closest('button[data-track]');
    if (!button) return;
    const index = queue.findIndex(t => t.key === button.dataset.track);
    if (index === selected && !audio.paused) audio.pause();
    else if (index === selected && audio.getAttribute('src') && !audio.error) {
      audio.play().catch(error => { if (error.name !== 'AbortError') failed(); });
    } else play(index);
  }, options);
  previous.addEventListener('click', () => play(selected - 1), options);
  next.addEventListener('click', () => play(selected + 1), options);
  audio.addEventListener('playing', () => {
    resetTimer();
    player.classList.remove('has-error');
    player.classList.add('is-playing');
    state.textContent = 'NOW PLAYING';
    message.textContent = 'Now playing. Take your time.';
    updateRows(true);
  }, options);
  audio.addEventListener('pause', () => {
    if (!audio.paused) return;
    resetTimer();
    player.classList.remove('is-playing');
    if (!player.classList.contains('has-error') && selected >= 0) {
      state.textContent = 'PAUSED';
      message.textContent = 'Paused. Continue whenever you like.';
    }
    updateRows(false);
  }, options);
  audio.addEventListener('error', () => { if (audio.error) failed(); }, options);
  audio.addEventListener('ended', () => play(selected + 1), options);
  dispose = () => {
    disposed = true;
    version++;
    resetTimer();
    abort.abort();
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    mounted = undefined;
    dispose = undefined;
  };
}
