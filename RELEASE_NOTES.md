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
