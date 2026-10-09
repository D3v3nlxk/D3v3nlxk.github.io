"""Build the listening room while preserving the five original music source IDs."""
from internationalize import localize
from pathlib import Path
from html import escape as e
import json,re
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'data/music.json').read_text())
songs=data['songs'];playlist=data['playlist'];tracks=playlist['tracks']
def duration(seconds):return f'{seconds//60:02}:{seconds%60:02}'
def rows(items,group):
 out=[]
 for i,t in enumerate(items):
  platform='QQ 音乐' if t['server']=='tencent' else '网易云'
  action=f'<button class="track-play" type="button" data-track="{group}-{i}" aria-label="播放 {e(t["title"])}"><span class="track-index">{i+1:02}</span><span class="track-play-glyph" aria-hidden="true">▶</span></button>' if t['audio'] else f'<a class="track-play external-track" href="{e(t["url"])}" target="_blank" rel="noopener" aria-label="在{platform}收听 {e(t["title"])}"><span class="track-index">{i+1:02}</span><span class="track-play-glyph" aria-hidden="true">↗</span></a>'
  availability='' if t['audio'] else f'<a class="track-availability" href="{e(t["url"])}" target="_blank" rel="noopener">原平台收听 ↗</a>'
  cover=f'<img src="{t["cover"]}" class="track-cover no-lightbox" alt="" width="52" height="52" loading="lazy">' if group=='song' else ''
  out.append(f'''<li class="music-track" data-track-row="{group}-{i}" data-source-id="{t['id']}" data-server="{t['server']}">{action}{cover}<div class="track-copy"><a href="{e(t['url'])}" target="_blank" rel="noopener" class="track-title">{e(t['title'])}</a><span class="track-artist">{e(t['artist'])}</span>{availability}</div><span class="track-platform">{platform}</span><span class="track-duration">{duration(t['duration'])}</span><a class="track-source" href="{e(t['url'])}" target="_blank" rel="noopener" aria-label="前往原平台收听 {e(t['title'])}">↗</a></li>''')
 return '\n'.join(out)
header='''<section class="music-heading"><div><p class="eyebrow">THE LISTENING ROOM / 音乐角落</p><h1>把喜欢，留在耳边<span class="accent">。</span></h1><p class="music-serif">A soundtrack for everyday life.</p></div><p class="music-heading-note">写代码的时候，放空的时候。<br>总有一首歌，刚好合适。</p></section>'''
body=f'''<div class="music-room" id="music-room"><aside class="listening-player" aria-label="音乐播放器"><div class="player-topline"><span>ON THE RECORD</span><span class="player-state">READY TO LISTEN</span></div><div class="record-stage" aria-hidden="true"><div class="vinyl-record"><div class="record-label"><span>D3v3n.</span><small>SIDE A / FAVORITES</small><i></i></div></div><span class="record-needle"></span></div><div class="now-playing"><p class="eyebrow">NOW PLAYING</p><h2 class="now-title">选一首，听一会儿</h2><p class="now-artist">你喜欢的声音，都在这里。</p></div><audio class="room-audio" controls preload="none" aria-label="音乐播放控制"></audio><div class="player-actions"><button type="button" class="player-previous" aria-label="上一首">← 上一首</button><a class="now-source" hidden target="_blank" rel="noopener">原平台 ↗</a><button type="button" class="player-next" aria-label="下一首">下一首 →</button></div><p class="player-message" role="status" aria-live="polite">选择右侧歌曲开始播放。</p><p class="player-footnote">部分歌曲需在原平台登录或收听。</p></aside>
<div class="music-library"><nav class="music-jumps" aria-label="音乐分区"><a href="#中文歌">中文歌 <span>{len(songs):02}</span></a><a href="#英文歌">英文歌 <span>PLAYLIST</span></a><span class="library-caption">SAVED FOR A GOOD DAY</span></nav>
<section class="music-section" aria-labelledby="中文歌"><div class="music-section-heading"><div><p class="eyebrow">SIDE A / ON REPEAT</p><h2 id="中文歌">中文歌</h2></div><span>{len(songs):02} 首单曲</span></div><ol class="music-tracks">{rows(songs,'song')}</ol></section>
<section class="music-section english-section" aria-labelledby="英文歌"><div class="music-section-heading"><div><p class="eyebrow">SIDE B / A DIFFERENT MOOD</p><h2 id="英文歌">英文歌</h2></div><a href="{e(playlist['url'])}" target="_blank" rel="noopener">完整歌单 ↗</a></div><a class="playlist-cover-card" href="{e(playlist['url'])}" target="_blank" rel="noopener" data-source-id="{playlist['id']}" data-server="netease" data-type="playlist"><img src="{playlist['cover']}" class="no-lightbox" alt="英文歌单封面" width="80" height="80" loading="lazy"><div><span>NETEASE / 我的歌单</span><h3>{e(playlist['title'].split(' | ')[0])}</h3><p>熟悉的旋律，换一种心情。</p></div><span aria-hidden="true">↗</span></a><ol class="music-tracks playlist-tracks">{rows(tracks,'playlist')}</ol><p class="playlist-note">展示已获取的 {len(tracks)} 首歌曲，最新内容以原歌单为准。</p></section></div>
<script type="application/json" id="music-data">{json.dumps(data,ensure_ascii=False).replace('<',chr(92)+'u003c')}</script></div><div class="music-endnote"><span>留一点时间，只用来听歌。</span><span>PRESS PLAY. SLOW DOWN.</span></div><noscript><p>点击歌曲名称或右侧箭头，可直接前往原平台收听。</p></noscript>'''
p=ROOT/'music/index.html';s=p.read_text()
s=s.replace('isToc: true', 'isToc: false')
s=s.replace('class="page" id="body-wrap"','class="page music-page" id="body-wrap"')
a=s.index('</nav>')+len('</nav>');b=s.index('</header>',a);s=s[:a]+header+s[b:]
a=s.index('<main');b=s.index('</main>',a)+len('</main>');s=s[:a]+f'<main class="layout music-layout" id="content-inner"><div id="page"><div id="article-container">{body}</div></div></main>'+s[b:]
s=re.sub(r'<div class="js-pjax"><script>if \(!window\.MathJax\) .*?</script></div>','<div class="js-pjax"></div>',s,flags=re.S)
# This page now uses the browser audio player; it needs neither APlayer nor Meting.
s=re.sub(r'<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/aplayer@1.10.1/.*?</script><script src="https://cdn.jsdelivr.net/npm/butterfly-extsrc@1.1.3/metingjs/dist/Meting.min.js"></script>','',s,flags=re.S)
if 'id="music-style"' not in s:s=s.replace('</head>','<link rel="stylesheet" href="/css/music.css?v=2" id="music-style"></head>')
# Music hosts may redirect audio to HTTP. Request the HTTPS equivalent on secure pages.
if 'upgrade-insecure-requests' not in s:s=s.replace('</head>','<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"></head>')
# These five small covers are part of the visible music directory, not deferred widgets.
s=s.replace('loading="lazy"', 'loading="eager"')
s=re.sub(r'(src="/img/music/[^"?]+)(")',
         lambda match: match[1] + "?v=2\" onerror=\"this.onerror=null;this.src='/img/music/cover-fallback.svg'\"", s)
p.write_text(localize(s))
print('Built music page: 4 original songs + original playlist 2829816518.')
