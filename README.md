# Discourse Auto Discard

A small Chrome MV3 extension for people who open [linux.do](https://linux.do/) topics in background tabs.

When a background tab finishes navigating to `https://linux.do/*`, the extension discards that inactive tab. The tab stays in your tab strip and reloads when you select it, instead of staying preloaded in the background.

## Privacy

This extension runs locally in Chrome. It does not collect, store, upload, or share browsing data.

It only checks inactive tab URLs against `https://linux.do/*` so it can decide whether to discard that tab.

## Friendly Link

- [linux.do](https://linux.do/)

## Watched Hosts

This version watches:

- `linux.do`

To add another forum, edit both:

- `WATCHED_HOSTS` in `background.js`
- `host_permissions` in `manifest.json`

## Install

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click Load unpacked.
4. Select this directory.

## Permissions

- `tabs`: reads tab URL/status and discards matching inactive tabs.
- `webNavigation`: waits for the main-frame navigation before checking a tab.
- `https://linux.do/*`: limits the extension to linux.do.

## Test

```bash
node --test test/*.test.js
```
