"""Apply English interface copy after rebuilding the static gallery or music pages."""
from pathlib import Path
import re

COPY = dict(line.split('|', 1) for line in '''首页|Home
时间轴|Archive
标签|Tags
分类|Categories
清单|Explore
照片|Photography
音乐|Music
多媒体|Multimedia
友链|Friends
友情链接|Friends & Links
关于|About
打开导航菜单|Open navigation menu
保持好奇，|Stay curious.
探索技术的边界|Explore what comes next
记录逆向工程、CTF 与人工智能的学习旅程。|Notes on reverse engineering, CTF challenges, and artificial intelligence.
在代码与生活之间，收集每一个值得分享的发现。|Discoveries worth sharing, between code and everyday life.
阅读文章|Read the blog
认识一下|About me
探索 · 记录 · 分享|EXPLORE · CREATE · SHARE
向下探索 ↓|Explore below ↓
全部文章|All posts
逆向工程|Reverse engineering
人工智能|Artificial intelligence
CTF 手记|CTF notes
一份持续生长的个人技术手记|An evolving collection of ideas and discoveries
全部归档|View archive
保持好奇，持续生长。|Stay curious. Keep growing.
按时间，慢慢积累。|A growing collection, one post at a time.
回到顶部 ↑|Back to top ↑
小伙伴|Friends
老师傅|People I learn from
逆向师傅的博客|A blog about reverse engineering
密码师傅的博客|A blog about cryptography
大二网络安全小菜鸡|Cybersecurity student, always learning
VISUAL JOURNAL / 光影手记|VISUAL JOURNAL / PHOTOGRAPHY
光影手记|Photography
光影之间，皆是日常|Everyday life, in a different light
把目光从屏幕移开，|Look beyond the screen.
把沿途的片刻留在这里。|Keep a few moments along the way.
翻开我的摄影集|Explore the gallery
01 本相册 · 08 张照片|01 ALBUM · 08 PHOTOGRAPHS
2024 / 校园 · 城市 · 日常|2024 / CAMPUS · CITY · EVERYDAY LIFE
期末考完去南校的随拍。|A walk around South Campus after the final exams.
翻开这本相册|Open the album
8 张照片|8 photographs
摄影 / D3v3n|Photography / D3v3n
← 全部相册|← All albums
← 返回相册|← Back to gallery
从白昼走到灯火亮起，|From daylight to city lights,
目之所及，皆可珍藏。|moments worth keeping.
点击照片，放大观看 ↗|Select a photograph to explore ↗
沿途所见 / THE SERIES|ALONG THE WAY / THE SERIES
这些片刻，下次再看。|Until the next moment.
THE LISTENING ROOM / 音乐角落|THE LISTENING ROOM / MUSIC
音乐角落|The listening room
把喜欢，留在耳边|Keep your favorites close
写代码的时候，放空的时候。|For focused work and wandering thoughts.
总有一首歌，刚好合适。|There is a song for every moment.
留一点时间，只用来听歌。|Make a little time to listen.
选一首歌，慢慢听|Pick a song. Stay a while.
选一首，听一会儿|Pick a song. Stay a while.
选择右侧歌曲开始播放。|Choose a track to start listening.
← 上一首|← Previous
下一首 →|Next →
中文歌|Chinese favorites
英文歌|English favorites
04 首单曲|04 TRACKS
熟悉的旋律，换一种心情。|Familiar melodies, a fresh state of mind.
你喜欢的声音，都在这里。|A place for your favorite sounds.
网易云|NetEase Music
QQ 音乐|QQ Music
原平台 ↗|Open source ↗
原平台收听 ↗|Listen on platform ↗
完整歌单 ↗|Full playlist ↗
NETEASE / 我的歌单|NETEASE / MY PLAYLIST
展示已获取的 10 首歌曲，最新内容以原歌单为准。|A preview of 10 tracks. Open the original playlist for the latest selection.
部分歌曲需在原平台登录或收听。|Some tracks require listening or signing in on the original platform.
点击歌曲名称或右侧箭头，可直接前往原平台收听。|Select a track title or its arrow to listen on the original platform.
BEYOND THE BLOG / 多媒体|BEYOND THE BLOG / MULTIMEDIA
在文字之外|Beyond the written word
影像、声音，还有生活的片刻。|Films, sounds, and moments from everyday life.
换一种方式，分享同样的热爱。|Different formats. The same curiosity.
02 个分享空间|02 PLACES TO CONNECT
哔哩哔哩|Bilibili
小红书|REDnote
视频 / 投稿|VIDEOS / CREATIONS
图文 / 日常|STORIES / EVERYDAY LIFE
我的投稿视频与影像记录。|My videos and visual stories.
欢迎来 B 站看看，也欢迎留下你的想法。|Watch on Bilibili and join the conversation.
浏览我的投稿|Watch my videos
生活里的另一面，也在这里。|Another side of life, shared here.
逛逛我的主页，一起发现日常中的小美好。|Find a little inspiration in the everyday.
前往我的主页|Visit my profile
日常|Everyday
值得记录|Worth keeping
一些片刻|Little moments
也可以，在这里停留|More to explore
在不同的地方，继续分享。|Keep exploring, wherever you find me.
记录路过的风景与生活。|Scenes and stories from along the way.'''.splitlines())

COPY.update({
    '上一首': 'Previous track', '下一首': 'Next track',
    '向下浏览文章': 'Explore the posts', '文章主题': 'Filter by topic',
    '我的多媒体主页': 'My multimedia profiles', '摄影相册': 'Photo albums',
    '音乐分区': 'Music collections', '音乐播放器': 'Music player', '音乐播放控制': 'Playback controls',
    '前往我的哔哩哔哩投稿视频主页（新窗口）': 'Visit my Bilibili videos (opens in a new tab)',
    '前往我的小红书主页（新窗口）': 'Visit my REDnote profile (opens in a new tab)',
    '浏览南校之行相册，共 8 张照片': 'Explore South Campus: 8 photographs',
    '南校之行，8 张照片': 'South Campus: 8 photographs',
})

def translate(value):
    stripped = value.strip()
    if stripped in COPY:
        return value.replace(stripped, COPY[stripped])
    for source, target in COPY.items():
        if stripped == source + " | D3v3n's Blog":
            return target + " | D3v3n's Blog"
    for source, target in [('前往原平台收听 ', 'Listen on the original platform: '), ('在QQ 音乐收听 ', 'Listen on QQ Music: '), ('在网易云收听 ', 'Listen on NetEase Music: '), ('播放 ', 'Play '), ('放大查看：', 'Enlarge photo: ')]:
        if value.startswith(source): return target + value[len(source):]
    return value

def localize(s):
    # Keep scripts, article bodies, URLs, and personal titles intact.
    parts = re.split(r'(<script\b.*?</script>|<style\b.*?</style>|<article\b.*?</article>)', s, flags=re.S)
    for i, part in enumerate(parts):
        if part.startswith(('<script', '<style', '<article')):
            continue
        part = re.sub(r'(?<=>)([^<>]+)(?=<)', lambda m: translate(m[0]), part)
        part = re.sub(r'(aria-label|title|placeholder|content)="([^"]*)"', lambda m: m[1]+'="'+translate(m[2])+'"', part)
        parts[i] = part
    s = ''.join(parts)
    for source, target in COPY.items():
        s = s.replace("title: '"+source+"'", "title: '"+target+"'")
    s = s.replace('<article class="post-content" id="article-container">', '<article class="post-content" id="article-container" lang="zh-CN">')
    s = s.replace('<html lang="zh-CN"', '<html lang="en"').replace('content="zh_CN"','content="en_US"')
    s = s.replace('/js/editorial.js?v=3','/js/editorial.js?v=4')
    return s

if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    for p in root.rglob('*.html'):
        if '.git' not in p.parts:
            old = p.read_text()
            new = localize(old)
            if old != new: p.write_text(new)
