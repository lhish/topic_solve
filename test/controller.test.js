const assert = require("node:assert/strict");
const test = require("node:test");

const { createDiscardController } = require("../controller.js");

function createChromeMock(tabsById) {
  const discarded = [];
  return {
    discarded,
    tabs: {
      async get(tabId) {
        const tab = tabsById.get(tabId);
        if (!tab) {
          throw new Error(`missing tab ${tabId}`);
        }
        return tab;
      },
      async discard(tabId) {
        discarded.push(tabId);
      },
    },
  };
}

test("discardIfBackgroundWatched discards inactive watched tabs", async () => {
  const chrome = createChromeMock(
    new Map([
      [
        1,
        {
          id: 1,
          active: false,
          discarded: false,
          url: "https://linux.do/t/example/1",
        },
      ],
    ])
  );

  const controller = createDiscardController({
    chromeApi: chrome,
    setTimer(fn) {
      fn();
      return 1;
    },
    clearTimer() {},
  });

  await controller.discardIfBackgroundWatched(1);
  assert.deepEqual(chrome.discarded, [1]);
});

test("discardIfBackgroundWatched skips active and non-matching tabs", async () => {
  const chrome = createChromeMock(
    new Map([
      [
        1,
        {
          id: 1,
          active: true,
          discarded: false,
          url: "https://linux.do/t/example/1",
        },
      ],
      [
        2,
        {
          id: 2,
          active: false,
          discarded: false,
          url: "https://example.com/t/example/1",
        },
      ],
    ])
  );

  const controller = createDiscardController({ chromeApi: chrome });

  await controller.discardIfBackgroundWatched(1);
  await controller.discardIfBackgroundWatched(2);
  assert.deepEqual(chrome.discarded, []);
});

test("discardIfBackgroundWatched can be disabled while keeping listeners alive", async () => {
  const chrome = createChromeMock(
    new Map([
      [
        1,
        {
          id: 1,
          active: false,
          discarded: false,
          url: "https://linux.do/t/example/1",
        },
      ],
    ])
  );

  const controller = createDiscardController({
    chromeApi: chrome,
    discardEnabled: false,
  });

  const discarded = await controller.discardIfBackgroundWatched(1);
  assert.equal(discarded, false);
  assert.deepEqual(chrome.discarded, []);
});

test("event handlers schedule checks only for relevant events", () => {
  const scheduled = [];
  const controller = createDiscardController({
    chromeApi: createChromeMock(new Map()),
    setTimer(fn) {
      scheduled.push(fn);
      return scheduled.length;
    },
    clearTimer() {},
  });

  controller.handleCreated({ id: 10 });
  controller.handleCreated({});
  controller.handleUpdated(11, { status: "loading" });
  controller.handleUpdated(12, { title: "ignored" });
  controller.handleCommitted({ tabId: 13, frameId: 0 });
  controller.handleCommitted({ tabId: 14, frameId: 2 });

  assert.equal(scheduled.length, 3);
});

test("updated URL event can discard before tab.url catches up", async () => {
  const chrome = createChromeMock(
    new Map([
      [
        1,
        {
          id: 1,
          active: false,
          discarded: false,
          url: "about:blank",
        },
      ],
    ])
  );

  const scheduled = [];
  const controller = createDiscardController({
    chromeApi: chrome,
    setTimer(fn) {
      scheduled.push(fn);
      return scheduled.length;
    },
  });

  controller.handleUpdated(1, { url: "https://linux.do/t/example/1" });

  assert.equal(scheduled.length, 1);
  await scheduled[0]();
  assert.deepEqual(chrome.discarded, [1]);
});
