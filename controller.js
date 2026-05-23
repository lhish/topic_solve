(function initController(root) {
  "use strict";

  const rules =
    root.discourseAutoDiscardRules ||
    (typeof require !== "undefined" ? require("./rules.js") : null);

  const DEFAULT_CHECK_DELAY_MS = 0;
  const DEFAULT_RECENTLY_DISCARDED_TTL_MS = 5000;

  function createDiscardController(options) {
    const chromeApi = options.chromeApi;
    const watchedHosts = options.watchedHosts || rules.DEFAULT_WATCHED_HOSTS;
    const setTimer = options.setTimer || setTimeout;
    const checkDelayMs = options.checkDelayMs ?? DEFAULT_CHECK_DELAY_MS;
    const discardEnabled = options.discardEnabled ?? true;
    const recentlyDiscardedTtlMs =
      options.recentlyDiscardedTtlMs ?? DEFAULT_RECENTLY_DISCARDED_TTL_MS;
    const recentlyDiscardedTabs = new Set();

    async function discardIfBackgroundWatched(tabId, eventUrl) {
      if (
        !discardEnabled ||
        !Number.isInteger(tabId) ||
        recentlyDiscardedTabs.has(tabId)
      ) {
        return false;
      }

      const tab = await chromeApi.tabs.get(tabId);
      if (!rules.shouldDiscardTab(tab, watchedHosts, eventUrl)) {
        return false;
      }

      recentlyDiscardedTabs.add(tabId);
      try {
        await chromeApi.tabs.discard(tabId);
      } finally {
        setTimer(() => recentlyDiscardedTabs.delete(tabId), recentlyDiscardedTtlMs);
      }
      return true;
    }

    function scheduleDiscardCheck(tabId, eventUrl) {
      return setTimer(() => {
        return discardIfBackgroundWatched(tabId, eventUrl).catch((error) => {
          console.warn("Topic Solve failed:", error);
        });
      }, checkDelayMs);
    }

    function handleCreated(tab) {
      if (tab.id !== undefined) {
        scheduleDiscardCheck(tab.id, tab.url);
      }
    }

    function handleUpdated(tabId, changeInfo) {
      if (changeInfo.url || changeInfo.status === "loading") {
        scheduleDiscardCheck(tabId, changeInfo.url);
      }
    }

    function handleCommitted(details) {
      if (details.frameId === 0) {
        scheduleDiscardCheck(details.tabId, details.url);
      }
    }

    return {
      discardIfBackgroundWatched,
      handleCommitted,
      handleCreated,
      handleUpdated,
      scheduleDiscardCheck,
    };
  }

  const api = { createDiscardController };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.discourseAutoDiscardController = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
