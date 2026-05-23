(function initAuthCookieBridge(root) {
  "use strict";

  const AUTH_COOKIE_URL = "https://linux.do/";
  const AUTH_COOKIE_NAME = "_t";
  const AUTH_COOKIE_HOST = "linux.do";
  const COOKIE_BRIDGE_RULE_ID = 10_001;
  const PING_MESSAGE_BUS_URL_FILTER = "|https://ping.ldstatic.com/message-bus/";

  function normalizeCookieDomain(domain) {
    return (domain || "").replace(/^\./, "").toLowerCase();
  }

  function isLinuxAuthCookieChange(changeInfo) {
    const cookie = changeInfo?.cookie;
    return (
      cookie?.name === AUTH_COOKIE_NAME &&
      normalizeCookieDomain(cookie.domain) === AUTH_COOKIE_HOST
    );
  }

  function buildAuthCookieRule(cookie) {
    if (!cookie?.value) {
      throw new Error("missing linux.do auth cookie value");
    }

    return {
      id: COOKIE_BRIDGE_RULE_ID,
      priority: 1,
      action: {
        type: "modifyHeaders",
        requestHeaders: [
          {
            header: "cookie",
            operation: "append",
            value: `${AUTH_COOKIE_NAME}=${cookie.value}`,
          },
        ],
      },
      condition: {
        urlFilter: PING_MESSAGE_BUS_URL_FILTER,
        resourceTypes: ["xmlhttprequest"],
      },
    };
  }

  function createAuthCookieBridge(options) {
    const chromeApi = options.chromeApi;
    const logger = options.logger || console;

    async function readAuthCookie() {
      return chromeApi.cookies.get({
        url: AUTH_COOKIE_URL,
        name: AUTH_COOKIE_NAME,
      });
    }

    async function updateRule(cookie) {
      const addRules = cookie?.value ? [buildAuthCookieRule(cookie)] : [];
      await chromeApi.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [COOKIE_BRIDGE_RULE_ID],
        addRules,
      });
      logger.info("Topic Solve cookie bridge updated", { hasCookie: addRules.length > 0 });
    }

    async function refresh() {
      const cookie = await readAuthCookie();
      await updateRule(cookie);
    }

    function handleCookieChanged(changeInfo) {
      if (!isLinuxAuthCookieChange(changeInfo)) {
        return false;
      }

      return refresh().catch((error) => {
        logger.warn("Topic Solve cookie bridge refresh failed", error);
        return false;
      });
    }

    async function start() {
      await refresh();
      chromeApi.cookies.onChanged.addListener(handleCookieChanged);
    }

    return {
      handleCookieChanged,
      refresh,
      start,
      updateRule,
    };
  }

  const api = {
    AUTH_COOKIE_NAME,
    AUTH_COOKIE_URL,
    COOKIE_BRIDGE_RULE_ID,
    PING_MESSAGE_BUS_URL_FILTER,
    buildAuthCookieRule,
    createAuthCookieBridge,
    isLinuxAuthCookieChange,
    normalizeCookieDomain,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.discourseAuthCookieBridge = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
