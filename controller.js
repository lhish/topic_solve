(function initController(root) {
  "use strict";

  const rules =
    root.discourseAutoDiscardRules ||
    (typeof require !== "undefined" ? require("./rules.js") : null);

  const DEFAULT_CHECK_DELAY_MS = 250;
  const DEFAULT_RECENTLY_DISCARDED_TTL_MS = 5000;

  function createDiscardController(options) {
    const chromeApi = options.chromeApi;
    const watchedHosts = options.watchedHosts || rules.DEFAULT_WATCHED_HOSTS;
    const setTimer = options.setTimer || setTimeout;
    const checkDelayMs = options.checkDelayMs ?? DEFAULT_CHECK_DELAY_MS;
    const recentlyDiscardedTtlMs =
      options.recentlyDiscardedTtlMs ?? DEFAULT_RECENTLY_DISCARDED_TTL_MS;
    const recentlyDiscardedTabs = new Set();

    async function discardIfBackgroundWatched(tabId) {
      if (!Number.isInteger(tabId) || recentlyDiscardedTabs.has(tabId)) {
        return false;
      }

      const tab = await chromeApi.tabs.get(tabId);
      if (!rules.shouldDiscardTab(tab, watchedHosts)) {
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

    function scheduleDiscardCheck(tabId) {
      return setTimer(() => {
        discardIfBackgroundWatched(tabId).catch((error) => {
          console.warn("Discourse Auto Discard failed:", error);
        });
      }, checkDelayMs);
    }

    function handleCreated(tab) {
      if (tab.id !== undefined) {
        scheduleDiscardCheck(tab.id);
      }
    }

    function handleUpdated(tabId, changeInfo) {
      if (changeInfo.url || changeInfo.status === "loading") {
        scheduleDiscardCheck(tabId);
      }
    }

    function handleCommitted(details) {
      if (details.frameId === 0) {
        scheduleDiscardCheck(details.tabId);
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
