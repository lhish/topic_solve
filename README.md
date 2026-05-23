# TabWake

一个给 [linux.do](https://linux.do/) 用户使用的 Chrome MV3 扩展。

如果你习惯把 linux.do 话题页在后台标签页打开，Discourse 的延迟阅读统计请求可能会发到 `https://ping.ldstatic.com/message-bus/`，但这个跨站请求默认不会带上 linux.do 登录 Cookie。这个扩展会在本地读取 linux.do 的 `_t` Cookie，并通过浏览器的动态请求头规则把它追加到对应的 message-bus 请求上，让后台打开的话题页仍然以登录态完成阅读统计。

## 隐私

这个扩展只在 Chrome 本地运行，不收集、不保存、不上传、不共享浏览数据。

它会读取 linux.do 的 `_t` 登录 Cookie，并只把这个 Cookie 追加到 `https://ping.ldstatic.com/message-bus/` 的浏览器请求头中。Cookie 不会发送给扩展作者或任何额外服务。

## 友链

- [linux.do](https://linux.do/)

## 监听站点

当前版本监听：

- `linux.do`
- `ping.ldstatic.com/message-bus`

如果要添加其他论坛，需要同时修改：

- `auth_cookie_bridge.js` 中的 Cookie 来源和 message-bus 目标
- `host_permissions` in `manifest.json`

## 安装

### 安装油猴验证脚本

仓库同时提供一个独立油猴脚本：

```text
userscripts/topic_solve.user.js
```

Greasy Fork 安装页面：

```text
https://greasyfork.org/zh-CN/scripts/579417-topic-solve
```

这个脚本用于验证后台打开 linux.do 话题页时，额外触发前台直接打开会出现的 topic JSON track-view 请求：

```text
GET /t/<topic_id>/1.json?track_visit=true&forceLoad=true
```

它只在话题页初始处于后台标签页时运行，不替代 Chrome 扩展的 message-bus Cookie bridge。

### 从 Release ZIP 安装

1. 打开 [Releases](https://github.com/lhish/topic_solve/releases) 页面。
2. 下载最新版本里的 `tabwake-*-chrome.zip`。
3. 解压这个 ZIP，得到扩展文件夹。
4. 在 Chrome 地址栏输入 `chrome://extensions` 并回车。
5. 打开右上角的“开发者模式”。
6. 点击“加载已解压的扩展程序”。
7. 选择第 3 步解压出来的扩展文件夹。
8. 安装完成后，扩展会自动更新 message-bus 请求头规则。

### 从源码安装

1. 克隆仓库：

   ```bash
   git clone https://github.com/lhish/topic_solve.git
   ```

2. 打开 `chrome://extensions`。
3. 打开右上角的“开发者模式”。
4. 点击“加载已解压的扩展程序”。
5. 选择刚刚克隆下来的 `tabwake` 文件夹。

### 更新扩展

如果你已经加载过旧版本：

1. 下载并解压新的 Release ZIP，或拉取最新源码。
2. 打开 `chrome://extensions`。
3. 找到 `TabWake`。
4. 点击扩展卡片上的刷新按钮，或先移除旧扩展后重新“加载已解压的扩展程序”。

## 权限说明

- `tabs`：保留给标签页状态监听逻辑使用。
- `webNavigation`：保留给导航事件监听逻辑使用。
- `cookies`：读取 linux.do 的 `_t` 登录 Cookie。
- `declarativeNetRequest`：安装动态请求头规则，把 `_t` Cookie 追加到 message-bus 请求。
- `https://linux.do/*`：允许读取 linux.do 登录 Cookie。
- `https://ping.ldstatic.com/*`：允许修改 linux.do 使用的 message-bus 请求头。

## 测试

```bash
node --test test/*.test.js
```
