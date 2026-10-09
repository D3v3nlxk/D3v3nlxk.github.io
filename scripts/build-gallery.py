"""Update existing static photography pages from data/gallery.json (no dependencies)."""
from internationalize import localize
from pathlib import Path
from html import escape
import json
import re

ROOT = Path(__file__).resolve().parents[1]
album = json.loads((ROOT / 'data/gallery.json').read_text())
photos = album['photos']
url = album['path']
count = len(photos)

def img(p, eager=False, sizes='(max-width: 700px) 88vw, 45vw'):
    return (f'<img class="no-lightbox" src="{p["preview"]}" '
            f'srcset="{p["preview"]} {p["previewWidth"]}w, {p["large"]} {p["width"]}w" '
            f'sizes="{sizes}" width="{p["previewWidth"]}" height="{p["previewHeight"]}" '
            f'alt="{escape(p["alt"])}" loading="{"eager" if eager else "lazy"}" '
            f'{"fetchpriority=high" if eager else ""} decoding="async">')

def figure(p, lead=False):
    return f'''<figure class="photo-frame{' photo-lead' if lead else ''}" id="photo-{p['id']}" style="--photo-ratio:{p['width'] / p['height']:.6f}">
<a class="photo-open" href="{p['large']}" data-pswp-width="{p['width']}" data-pswp-height="{p['height']}" data-original="{escape(p['original'])}" data-photo-title="{escape(p['title'])}" target="_blank" rel="noopener" aria-label="放大查看：{escape(p['title'])}">
{img(p, lead, '(max-width: 700px) 88vw, (max-width: 1350px) 90vw, 1200px' if lead else '(max-width: 700px) 88vw, 40vw')}
<span class="photo-expand" aria-hidden="true">↗</span></a>
<figcaption><span><b>{p['id']}</b> {escape(p['title'])}</span><span class="photo-file">{p['filename']}</span></figcaption></figure>'''

index_header = '''<section class="photo-heading"><div><p class="eyebrow">VISUAL JOURNAL / 光影手记</p><h1>光影之间，皆是日常<span class="accent">。</span></h1><p class="photo-heading-serif">A few moments, kept.</p></div><p class="photo-heading-note">把目光从屏幕移开，<br>记录路过的风景与生活。</p></section>'''
index_body = f'''<section class="photo-collection" aria-label="摄影相册"><div class="photo-section-label"><span>THE COLLECTION</span><span>01 本相册 · {count:02} 张照片</span></div>
<a class="album-feature" href="{url}" aria-label="浏览{album['title']}相册，共 {count} 张照片"><div class="album-cover">{img(photos[0], True, '(max-width: 700px) 88vw, 65vw')}<span class="cover-label">PHOTO ESSAY — 001</span></div><div class="album-summary"><span class="album-number">01</span><div><p class="eyebrow">{album['year']} / 校园 · 城市 · 日常</p><h2>{album['title']}</h2><p class="album-description">{album['description']}。<br>从白昼走到灯火亮起，<br>把沿途的片刻留在这里。</p></div><div class="album-open"><span>翻开这本相册</span><span aria-hidden="true">↗</span></div></div></a></section>
<section class="photo-glimpses" aria-labelledby="glimpses-title"><div class="photo-section-label"><h2 id="glimpses-title">一些片刻</h2><span>FRAGMENTS OF THE DAY</span></div><div class="glimpse-grid">'''+''.join(f'<a href="{url}#photo-{p["id"]}" class="glimpse"><div>{img(p)}</div><span><b>{p["id"]}</b> {p["title"]} <i aria-hidden="true">↗</i></span></a>' for p in [photos[2],photos[4],photos[7]])+'''</div></section><div class="photo-endnote"><span>目之所及，皆可珍藏。</span><span>THROUGH MY LENS.</span></div>'''
album_header = f'''<section class="photo-heading album-heading"><a class="photo-back" href="/Gallery/">← 全部相册</a><div class="album-title-row"><div><p class="eyebrow">PHOTO ESSAY / 001</p><h1>{album['title']}<span class="photo-title-count">{count:02}</span></h1><p class="photo-heading-serif">From daylight to city lights.</p></div><div class="album-intro"><p>{album['description']}。</p><span>{album['year']} <b>·</b> {count} 张照片 <b>·</b> 摄影 / D3v3n</span></div></div></section>'''
album_body = f'''<section class="photo-series" data-photography aria-label="{album['title']}，{count} 张照片">{figure(photos[0], True)}
<div class="photo-section-label series-label"><span>沿途所见 / THE SERIES</span><span>点击照片，放大观看 ↗</span></div><div class="photo-grid">'''+''.join(figure(p) for p in photos[1:])+'''</div></section><div class="photo-endnote"><a href="/Gallery/">← 返回相册</a><span>这些片刻，下次再看。</span><a href="#page-header">回到顶部 ↑</a></div>'''

for path,header,body in [(ROOT/'Gallery/index.html',index_header,index_body),(ROOT/url.strip('/')/'index.html',album_header,album_body)]:
    text=path.read_text()
    text=text.replace('class="page" id="body-wrap"','class="page photography-page" id="body-wrap"')
    # Preserve theme navigation and scripts while replacing the photography layout only.
    start=text.index('</nav>')+len('</nav>');end=text.index('</header>',start)
    text=text[:start]+header+text[end:]
    start=text.index('<main');end=text.index('</main>',start)+len('</main>')
    text=text[:start]+f'<main class="layout photo-layout" id="content-inner"><div id="page"><div id="article-container">{body}</div></div></main>'+text[end:]
    # These pages contain no formulas. Keep the PJAX slot but skip MathJax startup.
    text=re.sub(r'<div class="js-pjax"><script>if \(!window\.MathJax\) .*?</script></div>',
                '<div class="js-pjax"></div>', text, flags=re.S)
    if '/css/photography.css' not in text:
        text=text.replace('</head>','<link rel="stylesheet" href="/css/photography.css?v=2" id="photography-style"></head>')
    path.write_text(localize(text))
print(f'Updated gallery landing page and album ({count} photos).')
