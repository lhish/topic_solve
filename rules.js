(function initRules(root) {
  "use strict";

  const DEFAULT_WATCHED_HOSTS = Object.freeze(["linux.do"]);

  function normalizeHosts(hosts) {
    return hosts.map((host) => host.trim().toLowerCase()).filter(Boolean);
  }

  function getCandidateUrl(tab, eventUrl) {
    return eventUrl || tab?.url || "";
  }

  function isWatchedUrl(rawUrl, watchedHosts = DEFAULT_WATCHED_HOSTS) {
    let url;

    try {
      url = new URL(rawUrl);
    } catch {
      return false;
    }

    if (url.protocol !== "https:") {
      return false;
    }

    return normalizeHosts(watchedHosts).includes(url.hostname.toLowerCase());
  }

  function shouldDiscardTab(tab, watchedHosts = DEFAULT_WATCHED_HOSTS, eventUrl) {
    if (!tab || tab.active || tab.discarded) {
      return false;
    }

    return isWatchedUrl(getCandidateUrl(tab, eventUrl), watchedHosts);
  }

  const api = {
    DEFAULT_WATCHED_HOSTS,
    getCandidateUrl,
    isWatchedUrl,
    shouldDiscardTab,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.discourseAutoDiscardRules = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
