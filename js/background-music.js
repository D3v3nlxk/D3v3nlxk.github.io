/* A single player outside PJAX's replaced DOM; no visible controls. */
(() => {
  if (window.blogBackgroundMusic) return;
  const tracks = ['https://d3v3nblog.oss-cn-shenzhen.aliyuncs.com/audio/p3r/m_avg2_act54side.wav', 'https://d3v3nblog.oss-cn-shenzhen.aliyuncs.com/audio/p3r/m_sys_act54side.wav'];
  const audio = new Audio();
  window.blogBackgroundMusic = audio;
  let index = 0;
  audio.preload = 'metadata';
  audio.src = tracks[index];
  const play = () => {
    if (audio.paused) audio.play().catch(() => { /* Retry on a user gesture when autoplay is blocked. */ });
  };
  audio.addEventListener('ended', () => {
    index = (index + 1) % tracks.length;
    audio.src = tracks[index];
    play();
  });
  document.addEventListener('pointerdown', play, { passive: true });
  document.addEventListener('keydown', event => {
    if (!event.metaKey && !event.ctrlKey && !event.altKey) play();
  });
  play();
})();
