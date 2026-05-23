const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const script = fs.readFileSync(
  path.join(__dirname, "../userscripts/topic_solve.user.js"),
  "utf8"
);

test("userscript metadata uses the Greasy Fork script name", () => {
  assert.match(script, /@name\s+topic_solve/);
  assert.match(script, /@version\s+0\.3\.1/);
});

function runUserscript({ pathname, visibilityState = "hidden" }) {
  const fetchCalls = [];
  const storage = new Map();

  vm.runInNewContext(script, {
    Date,
    document: { visibilityState },
    location: { pathname },
    sessionStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
    fetch: (...args) => {
      fetchCalls.push(args);
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: {
          get: () => "1",
        },
      });
    },
    console: {
      debug: () => {},
      error: () => {},
    },
  });

  return { fetchCalls, storage };
}

test("userscript sends topic JSON track_visit request for hidden topic tabs", () => {
  const { fetchCalls, storage } = runUserscript({
    pathname: "/t/topic/2224994",
  });

  assert.equal(fetchCalls.length, 1);
  assert.equal(
    fetchCalls[0][0],
    "/t/2224994/1.json?track_visit=true&forceLoad=true"
  );
  assert.equal(fetchCalls[0][1].credentials, "include");
  assert.equal(
    fetchCalls[0][1].headers["Discourse-Track-View-Topic-Id"],
    "2224994"
  );
  assert.equal(
    storage.has("linuxdo-topic-json-track-visit:2224994"),
    true
  );
});

test("userscript does not run in visible topic tabs", () => {
  const { fetchCalls } = runUserscript({
    pathname: "/t/topic/2224994",
    visibilityState: "visible",
  });

  assert.equal(fetchCalls.length, 0);
});

test("userscript rejects unsupported topic URLs", () => {
  assert.throws(
    () => runUserscript({ pathname: "/latest" }),
    /Unsupported linux\.do topic URL/
  );
});
