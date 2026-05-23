# Topic Solve

一个给 [linux.do](https://linux.do/) 用户使用的 Greasy Fork 用户脚本。

## 功能

这个脚本只在 `https://linux.do/t/*` 话题页初始处于后台标签页时运行。

当页面处于后台状态时，脚本会从当前 URL 提取 topic id，并补发一条同源 GET 请求：

```text
GET /t/<topic_id>/1.json?track_visit=true&forceLoad=true
```

请求会携带：

```text
Discourse-Track-View: true
Discourse-Track-View-Topic-Id: <topic_id>
Discourse-Present: true
X-Requested-With: XMLHttpRequest
```

浏览器会通过 `credentials: "include"` 自动携带 linux.do 当前登录态 cookie。脚本不会读取、保存、上传或手动设置 cookie。

## 安装

Greasy Fork 安装页面：

```text
https://greasyfork.org/zh-CN/scripts/579417-topic-solve
```

仓库内脚本文件：

```text
userscripts/topic_solve.user.js
```

## 不做什么

- 不修改页面内容。
- 不注入第三方脚本。
- 不连接作者服务器。
- 不采集浏览记录。
- 不绕过登录、权限或付费限制。
- 不模拟跨域 `message-bus` 请求。
- 不提供 Chrome MV3 扩展。

## 去重

脚本使用 `sessionStorage` 按 topic id 记录当前标签页内已经触发过的请求，避免同一个标签页内重复刷新时重复补发。

## 适用范围

仅匹配：

```text
https://linux.do/t/*
```

当前支持的话题 URL 形式包括：

```text
https://linux.do/t/<slug>/<topic_id>
https://linux.do/t/<topic_id>/...
```

如果 URL 不符合支持的结构，脚本会抛出错误并停止。

## 代码来源与版权

本脚本为原创代码，没有复制外部代码，也没有使用 `@require` 外部库。

## 测试

```bash
node --test test/*.test.js
```
