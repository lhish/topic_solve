const assert = require("node:assert/strict");
const test = require("node:test");

const {
  AUTH_COOKIE_NAME,
  COOKIE_BRIDGE_RULE_ID,
  PING_MESSAGE_BUS_URL_FILTER,
  buildAuthCookieRule,
  createAuthCookieBridge,
  isLinuxAuthCookieChange,
} = require("../auth_cookie_bridge.js");

function createChromeMock(cookie) {
  const updates = [];
  const listeners = [];

  return {
    updates,
    listeners,
    cookies: {
      async get(details) {
        assert.deepEqual(details, {
          url: "https://linux.do/",
          name: AUTH_COOKIE_NAME,
        });
        return cookie;
      },
      onChanged: {
        addListener(listener) {
          listeners.push(listener);
        },
      },
    },
    declarativeNetRequest: {
      async updateDynamicRules(update) {
        updates.push(update);
      },
    },
  };
}

test("buildAuthCookieRule appends the real linux.do auth cookie to ping message-bus", () => {
  assert.deepEqual(buildAuthCookieRule({ name: "_t", value: "secret" }), {
    id: COOKIE_BRIDGE_RULE_ID,
    priority: 1,
    action: {
      type: "modifyHeaders",
      requestHeaders: [
        {
          header: "cookie",
          operation: "append",
          value: "_t=secret",
        },
      ],
    },
    condition: {
      urlFilter: PING_MESSAGE_BUS_URL_FILTER,
      resourceTypes: ["xmlhttprequest"],
    },
  });
});

test("refresh installs the cookie append rule when linux.do auth cookie exists", async () => {
  const chrome = createChromeMock({ name: "_t", value: "secret" });
  const logs = [];
  const bridge = createAuthCookieBridge({
    chromeApi: chrome,
    logger: { info: (...args) => logs.push(args), warn() {} },
  });

  await bridge.refresh();

  assert.equal(chrome.updates.length, 1);
  assert.deepEqual(chrome.updates[0].removeRuleIds, [COOKIE_BRIDGE_RULE_ID]);
  assert.equal(chrome.updates[0].addRules.length, 1);
  assert.equal(
    chrome.updates[0].addRules[0].action.requestHeaders[0].value,
    "_t=secret"
  );
  assert.deepEqual(logs[0], ["TabWake cookie bridge updated", { hasCookie: true }]);
});

test("refresh removes the cookie append rule when linux.do auth cookie is absent", async () => {
  const chrome = createChromeMock(undefined);
  const bridge = createAuthCookieBridge({
    chromeApi: chrome,
    logger: { info() {}, warn() {} },
  });

  await bridge.refresh();

  assert.deepEqual(chrome.updates, [
    {
      removeRuleIds: [COOKIE_BRIDGE_RULE_ID],
      addRules: [],
    },
  ]);
});

test("isLinuxAuthCookieChange only accepts linux.do _t changes", () => {
  assert.equal(
    isLinuxAuthCookieChange({ cookie: { name: "_t", domain: ".linux.do" } }),
    true
  );
  assert.equal(
    isLinuxAuthCookieChange({ cookie: { name: "_t", domain: "linux.do" } }),
    true
  );
  assert.equal(
    isLinuxAuthCookieChange({ cookie: { name: "other", domain: ".linux.do" } }),
    false
  );
  assert.equal(
    isLinuxAuthCookieChange({ cookie: { name: "_t", domain: ".example.com" } }),
    false
  );
});

test("start refreshes once and subscribes to linux.do auth cookie changes", async () => {
  const chrome = createChromeMock({ name: "_t", value: "secret" });
  const bridge = createAuthCookieBridge({
    chromeApi: chrome,
    logger: { info() {}, warn() {} },
  });

  await bridge.start();
  assert.equal(chrome.updates.length, 1);
  assert.equal(chrome.listeners.length, 1);

  await chrome.listeners[0]({ cookie: { name: "_t", domain: ".linux.do" } });
  assert.equal(chrome.updates.length, 2);

  await chrome.listeners[0]({ cookie: { name: "_t", domain: ".example.com" } });
  assert.equal(chrome.updates.length, 2);
});
