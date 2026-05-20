# Discourse Auto Discard

一个给 [linux.do](https://linux.do/) 用户使用的 Chrome MV3 扩展。

如果你习惯把 linux.do 话题页在后台标签页打开，这个扩展会在后台标签页完成主框架导航后，将匹配 `https://linux.do/*` 的非活动标签页 discard。标签页仍然保留在标签栏里，但页面会在你切换过去时再重新加载。

## 隐私

这个扩展只在 Chrome 本地运行，不收集、不保存、不上传、不共享浏览数据。

它只会检查非活动标签页的 URL 是否匹配 `https://linux.do/*`，用于决定是否 discard 该标签页。

## 友链

- [linux.do](https://linux.do/)

## 监听站点

当前版本监听：

- `linux.do`

如果要添加其他论坛，需要同时修改：

- `WATCHED_HOSTS` in `background.js`
- `host_permissions` in `manifest.json`

## 安装

### 从 Release ZIP 安装

1. 打开 [Releases](https://github.com/lhish/discourse-auto-discard-extension/releases) 页面。
2. 下载最新版本里的 `discourse-auto-discard-extension-*-chrome.zip`。
3. 解压这个 ZIP，得到扩展文件夹。
4. 在 Chrome 地址栏输入 `chrome://extensions` 并回车。
5. 打开右上角的“开发者模式”。
6. 点击“加载已解压的扩展程序”。
7. 选择第 3 步解压出来的扩展文件夹。
8. 安装完成后，扩展会自动监听后台打开的 `linux.do` 标签页。

### 从源码安装

1. 克隆仓库：

   ```bash
   git clone https://github.com/lhish/discourse-auto-discard-extension.git
   ```

2. 打开 `chrome://extensions`。
3. 打开右上角的“开发者模式”。
4. 点击“加载已解压的扩展程序”。
5. 选择刚刚克隆下来的 `discourse-auto-discard-extension` 文件夹。

### 更新扩展

如果你已经加载过旧版本：

1. 下载并解压新的 Release ZIP，或拉取最新源码。
2. 打开 `chrome://extensions`。
3. 找到 `Discourse Auto Discard`。
4. 点击扩展卡片上的刷新按钮，或先移除旧扩展后重新“加载已解压的扩展程序”。

## 权限说明

- `tabs`：读取标签页 URL 和状态，并 discard 匹配的非活动标签页。
- `webNavigation`：等待主框架导航提交后再检查标签页，避免过早处理 `about:blank` 标签页。
- `https://linux.do/*`：限制扩展只作用于 linux.do。

## 测试

```bash
node --test test/*.test.js
```
