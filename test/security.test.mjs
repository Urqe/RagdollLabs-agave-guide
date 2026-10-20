import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;

const { el, safeLink } = await import("../assets/js/dom-utils.js");
const { parseHash, buildHash } = await import("../assets/js/router.js");

test("safeLink rejects non-https and credentialed URLs", () => {
  assert.throws(() => safeLink("http://example.com/x", "x"), /Unsafe link/);
  assert.throws(() => safeLink("javascript:alert(1)", "x"), /Unsafe link/);
  assert.throws(() => safeLink("https://user:pass@example.com/", "x"), /credentials/);
  assert.throws(() => safeLink("data:text/html,<b>x</b>", "x"), /Unsafe link/);
});

test("safeLink produces a hardened external link", () => {
  const link = safeLink("https://www.diffordsguide.com/encyclopedia/363/bws/mezcal-what-it-is-and-how-its-made", "Difford's");
  assert.equal(link.protocol, "https:");
  assert.equal(link.getAttribute("target"), "_blank");
  assert.equal(link.getAttribute("rel"), "noopener noreferrer");
  assert.equal(link.textContent, "Difford's");
});

test("el() renders text via textContent, never innerHTML", () => {
  const node = el("p", {}, "<img src=x onerror=alert(1)>");
  assert.equal(node.textContent, "<img src=x onerror=alert(1)>");
  assert.equal(node.querySelector("img"), null);
});

test("all source URLs in sources.json are https without credentials", async () => {
  const { sources } = JSON.parse(await readFile(path.join(root, "assets/data/sources.json"), "utf8"));
  for (const source of sources) {
    const url = new URL(source.url);
    assert.equal(url.protocol, "https:", `${source.id} must be https`);
    assert.equal(url.username, "", `${source.id} must not embed a username`);
    assert.equal(url.password, "", `${source.id} must not embed a password`);
  }
});

test("router never produces javascript: or unexpected schemes", () => {
  for (const hash of ["#/profile/javascript:alert(1)", "#/explore/..%2F..", "#/%6aavascript:x"]) {
    const route = parseHash(hash);
    const rebuilt = buildHash(route);
    assert.ok(rebuilt.startsWith("#/"), `rebuilt hash must stay in-app: ${rebuilt}`);
  }
});

test("profiles.json contains no HTML/script markup in text fields", async () => {
  const { profiles } = JSON.parse(await readFile(path.join(root, "assets/data/profiles.json"), "utf8"));
  const { bottles } = JSON.parse(await readFile(path.join(root, "assets/data/bottles.json"), "utf8"));
  const markup = /<\s*(script|img|iframe|svg|a\s|object|embed)\b/i;
  for (const p of profiles) {
    for (const value of [p.title, p.context, p.description, p.finish, ...(p.tasteNotes ?? []), p.smoke ?? ""]) {
      assert.equal(markup.test(value), false, `markup found in profile ${p.id}`);
    }
  }
  for (const b of bottles) {
    for (const value of [b.brand, b.expression, b.reviewSummary]) {
      assert.equal(markup.test(value), false, `markup found in bottle ${b.id}`);
    }
  }
});
