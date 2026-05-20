importScripts("rules.js");
importScripts("controller.js");

const WATCHED_HOSTS = [
  "linux.do",
];

const controller = discourseAutoDiscardController.createDiscardController({
  chromeApi: chrome,
  watchedHosts: WATCHED_HOSTS,
});

chrome.tabs.onCreated.addListener(controller.handleCreated);
chrome.tabs.onUpdated.addListener(controller.handleUpdated);
chrome.webNavigation.onCommitted.addListener(controller.handleCommitted);
