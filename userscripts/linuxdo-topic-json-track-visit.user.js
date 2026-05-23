// ==UserScript==
// @name         linux.do background topic track_visit
// @namespace    local-linuxdo
// @version      0.3.0
// @description  Send the same topic JSON track_visit request when a linux.do topic opens in a background tab.
// @match        https://linux.do/t/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
  "use strict";

  if (document.visibilityState !== "hidden") {
    return;
  }

  const topicId = topicIdFromPath(location.pathname);
  const storageKey = `linuxdo-topic-json-track-visit:${topicId}`;

  if (sessionStorage.getItem(storageKey)) {
    return;
  }

  sessionStorage.setItem(storageKey, String(Date.now()));

  fetch(`/t/${topicId}/1.json?track_visit=true&forceLoad=true`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json, text/javascript, */*; q=0.01",
      "X-Requested-With": "XMLHttpRequest",
      "Discourse-Present": "true",
      "Discourse-Track-View": "true",
      "Discourse-Track-View-Topic-Id": topicId,
    },
  })
    .then((response) => {
      console.debug("[linuxdo background topic track_visit]", {
        topicId,
        status: response.status,
        trackView: response.headers.get("x-discourse-trackview"),
        browserPageView: response.headers.get("x-discourse-browserpageview"),
      });

      if (!response.ok) {
        sessionStorage.removeItem(storageKey);
      }
    })
    .catch((error) => {
      sessionStorage.removeItem(storageKey);
      console.error("[linuxdo background topic track_visit]", error);
    });

  function topicIdFromPath(pathname) {
    const match = pathname.match(/^\/t\/(?:[^/]+\/)?(\d+)(?:\/|$)/);

    if (!match) {
      throw new Error(`Unsupported linux.do topic URL: ${pathname}`);
    }

    return match[1];
  }
})();
