# D3v3n · BLOG

本次采用浅色杂志风，在 Butterfly 静态页面上新增独立设计层。原有文章地址、正文、代码高亮、数学公式、媒体页与友链继续使用现有结构。

## 视觉方向

- 暖白纸面 `#f8f7f3`、炭黑文字 `#242722`、陶土橙强调色 `#b74b2d`，以细分隔线和留白建立层次。
- 中文使用系统字体，英文引言使用 Georgia 斜体，日期与栏目编号使用等宽字体；无需额外下载字体。
- 桌面内容最大宽度 1200px，首页采用双栏首屏、精选文章与双栏文章列表；手机采用单栏布局。
- 首页几何插画为内联 SVG，精选文章插画为本地 SVG，避免新增图片外链依赖。

## 页面与交互

- 首页：个人介绍、文章入口、最新手记，以及全部 / 逆向工程 / CTF / 人工智能筛选。
- 文章页：统一浅色标题区域，清晰的正文层级、代码块和目录。保留原主题目录、复制和阅读功能。
- 归档、标签、关于和媒体页：使用统一导航、色彩、标题与页脚。
- 友链：三栏 / 两栏 / 单栏响应式卡片，保留头像加载失败回退，包含“夏槿的小屋”。
- 保留深色模式，并提供键盘焦点样式与减少动态效果设置。

## 维护位置

- `css/editorial.css`：配色、排版、布局与响应式规则。
- `js/editorial.js`：主题筛选、导航状态，以及 PJAX 跳转后的重新初始化。
- `index.html`：首页介绍、几何插画与文章列表。
- `img/p3r/moon-water.png`：当前精选文章插画。
- 27 个 HTML 页面均引入上述样式与脚本。

当前仓库只有生成后的静态文件。以后若从 Hexo 源项目重新生成，需要把设计层引入迁移到主题布局或自定义注入配置，并迁移首页结构，否则生成操作会覆盖这些 HTML 修改。

本地预览：在仓库根目录运行 `python3 -m http.server 8765 --bind 127.0.0.1`，访问 `http://127.0.0.1:8765/`。

## 摄影集板块

`/Gallery/` 使用大幅相册封面、介绍与片段预览；`/Gallery/南校之行/` 使用主图、保留原始比例的均衡分行布局和 PhotoSwipe 全屏查看。手机端为大图单栏，桌面根据宽高比计算每行宽度。原图片地址仍可通过全屏查看中的“查看原图”访问。

- `data/gallery.json`：相册信息、图片标题、替代文本、原图地址，以及预览图和高清图的实际宽高。
- `scripts/build-gallery.py`：从数据重建现有两个相册页面的正文和标题区；运行 `python3 scripts/build-gallery.py`。不改动全站导航及主题脚本。
- `css/photography.css`：相册专用排版，选择器隔离在摄影板块内。
- `js/photography.js`：分行算法、PhotoSwipe、中文控件与图片说明，支持 PJAX 进入和离开时的初始化及清理。
- `lib/photoswipe/`：PhotoSwipe 5.4.4，MIT 许可，本地部署，Core 按需加载。
- `img/gallery/south-campus/`：保留原始比例的 WebP 预览图（最长边 1200px）和全屏图（最长边 2400px）。通过现有 OSS 图片处理接口生成，未修改原图。

新增照片时，先添加两种尺寸的图片并填写 `data/gallery.json`，再运行生成脚本。标题是可编辑的展示文案；原文件编号也保留在照片下方。脚本不依赖 Hexo 或 npm。新增相册时需扩展当前单相册数据结构和生成脚本。

## 音乐板块与原内容核对

音乐配置与 `89e2128:music/index.html` 核对一致：网易云单曲 `2124385868`、`1335942780`、`2034187125`，QQ 音乐单曲 `000FSUIt42nDS4`，网易云英文歌单 `2829816518`。旧版依赖 `api.i-meto.com` 获取整块播放器内容；本次检查该接口连续超时，而原 HTML 中的空播放器没有失败提示。

现在歌曲名称、歌手、封面、时长和原平台链接均静态输出。英文区展示原歌单接口当前返回的 10 首歌曲，并保留完整歌单入口；不宣称这些条目等于用户未来看到的全部动态歌单内容。歌曲是否可在站内播放由平台公开音频入口决定；失败会显示提示，不清空歌曲列表。QQ 单曲保留原平台收听入口，不尝试绕过登录或付费限制。

- `data/music.json`：原始来源 ID、核实后的歌曲元数据、封面与原平台地址。
- `scripts/build-music.py`：生成音乐页，运行 `python3 scripts/build-music.py`。
- `css/music.css`：桌面左侧唱片播放器、右侧歌曲列表；手机单栏；深浅主题和减少动态效果支持。
- `js/music.js`：原生音频播放、暂停/继续、上/下一首、超时与错误提示；PJAX 离开时停止播放并取消请求。
- `img/music/`：本地封面与失败时的唱片占位图。两张 PNG 使用正确扩展名，静态封面直接加载。

不保存会过期的音频签名、不下载歌曲文件。音乐页已移除不再使用的 Meting / APlayer 初始化和数学公式脚本；旧侧栏目录初始化关闭，改用页面内的中文歌 / 英文歌导航。

音乐播放状态修正：`2124385868` 和 `2034187125` 的公开外链实际返回 HTML 错误页，不能作为音频使用，现与 QQ 单曲一起明确显示“原平台收听”，并从站内播放队列排除。`1335942780`（九万字）已验证实际播放、暂停恢复及错误后切回。恢复站内播放需先核实原平台提供了可用音频，再更新数据中的 `audio` 字段。

导航下拉菜单以“清单”触发项中心定位，导航间距使用外边距，避免内部留白影响下拉菜单锚点。已检查 1440、1024、900px 下菜单及三个子项的中心一致。

## 多媒体板块

原 `/movies/` 地址保留，页面标题与全站桌面、手机导航统一改名为“多媒体”。原 B 站投稿主页 `https://space.bilibili.com/524158220/video` 保留，并新增小红书主页 `https://www.xiaohongshu.com/user/profile/66252f6200000000070064a5`。

页面使用两个平台入口卡片，配有本地 SVG / CSS 装饰图形；不依赖平台截图或外部字体图标。下方提供站内摄影集、音乐角落入口。外部主页在新窗口打开，没有自动嵌入第三方内容。

维护位置为 `movies/index.html` 与 `css/multimedia.css`。`js/editorial.js` 负责首次通过 PJAX 进入时引入专用样式。页面无侧栏目录与公式内容，因此关闭旧目录初始化，移除该页 MathJax 初始化。

## English interface

全站导航、栏目介绍、操作文案及无障碍标签使用英文。文章正文、文章标题、歌名、作者名和友链站名保留原文；中文文章正文单独标记 zh-CN。`scripts/internationalize.py` 统一维护英文界面文案，相册及音乐生成脚本自动调用，避免重新生成后退回中文。

## P3R visual theme (2026-10-09)

Current visual direction: electric blue, cyan, navy and white; angled composition, heavy italic headings, and the locally extracted 月落镜水 artwork. `css/p3r.css` overrides the earlier editorial layout across all 27 pages, including articles, archives, friends and the media sections. Light and dark reading surfaces remain available. Homepage content is in `index.html`; artwork is `img/p3r/moon-water.png`.

The former text preloader is replaced by `js/moon-preloader.js` and `css/moon-preloader.css`. It plays the original 4.1-second `intro` animation using the locally hosted Spine 3.8 runtime in `lib/spine/` and JSON/Atlas/PNG in `img/moon-intro/`. It runs only on direct homepage entry (including reload), with click-anywhere dismissal, Enter/Space/Escape, reduced motion, and an 8-second maximum wait. The canvas is contained in a 16:9 area on portrait screens. Static page content does not depend on WebGL; errors dismiss the cover. A CSS fallback also hides it if the controller cannot load, and a noscript rule hides it when JavaScript is disabled.

Assets were copied from `/Users/dongwen/Desktop/project/skland-package/月落镜水资源`. The artwork is from Arknights × Persona 3 Reload; original rights remain with their owners. The Spine runtime license and copyright notice are retained in `lib/spine/LICENSE`. Runtime source: https://github.com/EsotericSoftware/spine-runtimes/tree/3.8/spine-ts . The browser renders the extracted Spine animation, not Unity's additional shader/particle effects.

Verified with local Chrome: desktop and mobile layouts of homepage, article, archive, music, gallery, multimedia and friends; actual PJAX navigation; intro rendering, click-to-enter, reduced motion and missing-animation recovery. Third-party CDN resources were isolated during deterministic tests (the existing Fancybox integration cannot initialize when its CDN is blocked). No site deployment was performed.

## Homepage concert cover rotation (2026-10-09)

`img/p3r/ambience/` contains 13 original PNG backgrounds copied from the user’s 音律联觉主题资源/背景 directory. `data/ambience-covers.json` defines their order. `js/cover-slideshow.js` rotates the homepage hero every 6 seconds and synchronizes the featured cover; it provides previous/next/pause controls, pauses for hidden tabs, defaults to paused under reduced motion, and cleans up on PJAX departure. Only the current/next cover is requested as needed. The P3R frame, palette and typography are unchanged.

Only root `index.html` includes the intro markup, CSS and controller. Direct subpage visits do not load Spine; PJAX navigation, including returning home, never starts the intro. Homepage reloads play it again.

## Angled article panels and click-to-enter intro

The homepage intro overlay is itself the entry control: click/tap anywhere, or focus it and press Enter/Space; Escape also dismisses it. The corner button is removed. Playback completion, reduced-motion behavior and error/timeout fallbacks remain.

Homepage article panels use alternating small rotations, skewed frames and blue/cyan/yellow/pink accents inspired by P3R menu buttons. Text interiors compensate for horizontal skew, focus/hover straightens the rotation, and narrow screens use a smaller skew with explicit zero-minimum grid columns. Verified click and keyboard dismissal, article filtering, and no horizontal overflow at 320, 390 and 768 pixels.

### 青蓝配色与顶栏稳定性
- 文章斜卡侧边统一使用青色、天蓝与电蓝，移除黄色和粉红色。
- 首篇文章固定使用 `/img/p3r/moon-water.png`；首页主视觉仍独立轮播音律联觉背景。
- 顶栏始终固定在顶部，桌面保留 80px、手机保留 68px 占位。旧滚动处理器每 300ms 切换的 nav-fixed/nav-visible 状态不再改变顶栏位置、占位或过渡，避免回顶时延迟切换定位造成跳动。
- 同时关闭原主题 `#nav.show` 和页头的进场位移动画，以及页头的全属性过渡，避免加载/PJAX 与屏幕尺寸变化时影响固定导航。

### OSS 媒体资源
- P3R 首篇封面、13 张轮播图和两首背景音乐使用 `https://devenlxk.oss-cn-shenzhen.aliyuncs.com`。保留本地副本。
- 2026-10-09 验证：19 个关键对象返回 200，大小与本地一致；音频支持 Range 206；浏览器可显示图片和读取音频。
- CNAME `devenlxk.cn-shenzhen.taihangpfm.cn` 证书域名不匹配，未使用。
- OSS 未返回跨域许可，Spine JSON/atlas/WebGL 纹理仍保持同源加载；图库未迁移。

- 已切换 OSS 的 `/img/p3r/` 和 `/audio/p3r/` 不再纳入 Git，工作目录可保留本地备份。进场动画运行时代码和图库仍随站点发布。

### 2026-10-10 进场动画迁移
- 线上从 OSS 加载 Spine JSON、atlas 和 PNG；已验证 GitHub Pages 来源的 CORS 与 WebGL 绘制。
- localhost/127.0.0.1/IPv6 回环预览使用本地保留副本，避免本地来源尚未获 CORS 许可的问题。资源文件取消 Git 跟踪，运行时与说明保留。

### 新 Bucket d3v3nblog
- 改版资源的 19 个文件迁到 `https://d3v3nblog.oss-cn-shenzhen.aliyuncs.com`，验证公开读取和线上 CORS 正常。
- 64 个旧文章图片在新 Bucket 对应路径返回 404，因此保留旧 Bucket 引用。新 CNAME 仍有证书域名不匹配问题，未启用。
- 实测新 Bucket 防盗链拒绝本地 Referer（403），线上 GitHub Pages 来源的轮播、动画和两曲循环测试通过；本地预览新 OSS 资源需添加 Referer 白名单。

### 旧文章图片迁移完成
- 64 张旧图片实际位于新 Bucket 的 `img/old/`，携带线上 Referer 逐一验证均为 200。已更新页面、搜索索引及其他代码中的对应旧 URL，删除待迁移清单。
