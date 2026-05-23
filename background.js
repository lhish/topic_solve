importScripts("rules.js");
importScripts("controller.js");
importScripts("auth_cookie_bridge.js");

const WATCHED_HOSTS = [
  "linux.do",
];

const controller = discourseAutoDiscardController.createDiscardController({
  chromeApi: chrome,
  watchedHosts: WATCHED_HOSTS,
  discardEnabled: false,
});

chrome.tabs.onCreated.addListener(controller.handleCreated);
chrome.tabs.onUpdated.addListener(controller.handleUpdated);
chrome.webNavigation.onCommitted.addListener(controller.handleCommitted);

const cookieBridge = discourseAuthCookieBridge.createAuthCookieBridge({
  chromeApi: chrome,
});

cookieBridge.start().catch((error) => {
  console.warn("Topic Solve cookie bridge failed:", error);
});
