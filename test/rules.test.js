const assert = require("node:assert/strict");
const test = require("node:test");

const {
  DEFAULT_WATCHED_HOSTS,
  getCandidateUrl,
  isWatchedUrl,
  shouldDiscardTab,
} = require("../rules.js");

test("isWatchedUrl matches configured HTTPS hosts", () => {
  assert.equal(isWatchedUrl("https://linux.do/t/example/1"), true);
  assert.equal(isWatchedUrl("https://linux.do/"), true);
});

test("isWatchedUrl rejects subdomains, other protocols, and invalid URLs", () => {
  assert.equal(isWatchedUrl("https://evil.linux.do/t/example/1"), false);
  assert.equal(isWatchedUrl("http://linux.do/t/example/1"), false);
  assert.equal(isWatchedUrl("chrome://extensions"), false);
  assert.equal(isWatchedUrl("not a url"), false);
});

test("isWatchedUrl supports explicit additional hosts", () => {
  assert.equal(
    isWatchedUrl("https://forum.example.com/t/topic/1", [
      ...DEFAULT_WATCHED_HOSTS,
      "forum.example.com",
    ]),
    true
  );
});

test("getCandidateUrl returns the committed tab URL", () => {
  assert.equal(
    getCandidateUrl({
      url: "https://old.example.com/",
      pendingUrl: "https://linux.do/t/example/1",
    }),
    "https://old.example.com/"
  );
});

test("shouldDiscardTab only accepts inactive matching tabs", () => {
  assert.equal(
    shouldDiscardTab({
      active: false,
      discarded: false,
      url: "https://linux.do/t/example/1",
    }),
    true
  );

  assert.equal(
    shouldDiscardTab({
      active: true,
      discarded: false,
      url: "https://linux.do/t/example/1",
    }),
    false
  );

  assert.equal(
    shouldDiscardTab({
      active: false,
      discarded: true,
      url: "https://linux.do/t/example/1",
    }),
    false
  );

  assert.equal(
    shouldDiscardTab({
      active: false,
      discarded: false,
      url: "https://example.com/t/example/1",
    }),
    false
  );
});

test("getCandidateUrl prefers event URL over current tab URL", () => {
  const { getCandidateUrl } = require("../rules.js");

  assert.equal(
    getCandidateUrl(
      { url: "about:blank" },
      "https://linux.do/t/example/1"
    ),
    "https://linux.do/t/example/1"
  );
});

test("shouldDiscardTab waits for the watched URL to be committed", () => {
  assert.equal(
    shouldDiscardTab({
      active: false,
      discarded: false,
      url: "about:blank",
      pendingUrl: "https://linux.do/t/example/1",
    }),
    false
  );
});
