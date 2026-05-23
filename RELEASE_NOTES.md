# v0.3.1

- 将 Greasy Fork 用户脚本名称更新为 `topic_solve`。
- 将仓库内用户脚本文件同步重命名为 `userscripts/topic_solve.user.js`。
- 在 README 中补充 Greasy Fork 安装页面链接。

# v0.3.0

- 新增独立油猴脚本 `userscripts/linuxdo-topic-json-track-visit.user.js`。
- 后台打开 linux.do 话题页时，脚本会补发同源 `GET /t/<topic_id>/1.json?track_visit=true&forceLoad=true` 请求。
- 补发请求携带 `Discourse-Track-View` 和 `Discourse-Track-View-Topic-Id`，用于验证前台 topic JSON track-view 路径。
- 新增 userscript 行为测试，覆盖后台触发、前台不触发和不支持 URL 抛错。

# v0.2.0

- 新增 linux.do 登录 Cookie bridge：读取本地 `_t` Cookie，并追加到 `https://ping.ldstatic.com/message-bus/` 请求。
- 支持后台打开话题页时，让 Discourse 延迟阅读统计请求携带登录态。
- 新增动态请求头规则和 Cookie 变更监听，登录 Cookie 变化后会刷新规则。
- 暂停自动 discard 行为，避免后台标签页被提前卸载影响话题加载与统计验证。

# v0.1.0

首次发布。

- 监听后台打开的 `https://linux.do/*` 标签页。
- 等主框架导航提交后，discard 匹配的后台标签页。
- 标签页仍保留在标签栏里，并在选中时重新加载。
- 仅在本地运行，不收集、不保存、不上传浏览数据。
