import assert from "node:assert/strict";
import test from "node:test";
import { isProtectedPath, safeNextPath } from "../web/lib/navigation";
import { readApiResponse } from "../web/lib/http/client";
import {
  consumeRateLimit,
  resetRateLimit,
  resetRateLimitForTests,
} from "../web/lib/auth/rate-limit";
import { PROJECT_STATUS_LABELS, localeLabel, topicLabel } from "../web/lib/lessons/presentation";

test("protected paths cover the authenticated app and nothing public", () => {
  for (const path of ["/dashboard", "/stories/new", "/stories/abc123", "/account"]) {
    assert.equal(isProtectedPath(path), true, path);
  }
  for (const path of ["/", "/login", "/signup", "/dashboards", "/storiesx", "/api/auth/session"]) {
    assert.equal(isProtectedPath(path), false, path);
  }
});

test("post-login redirect only allows same-origin protected paths", () => {
  assert.equal(safeNextPath("/stories/abc?tab=1"), "/stories/abc?tab=1");
  assert.equal(safeNextPath("/stories/new"), "/stories/new");
  for (const unsafe of [
    undefined,
    null,
    "",
    "https://evil.example/dashboard",
    "//evil.example/dashboard",
    "/\\evil.example",
    "javascript:alert(1)",
    "/login",
    "/",
    "dashboard",
    `/dashboard/${"a".repeat(600)}`,
  ]) {
    assert.equal(safeNextPath(unsafe), "/dashboard", String(unsafe));
  }
});

test("API error reader handles JSON envelopes, non-JSON bodies and rate limits", async () => {
  const ok = await readApiResponse<{ value: number }>(Response.json({ value: 1 }));
  assert.deepEqual(ok, { ok: true, data: { value: 1 } });

  const envelope = await readApiResponse(
    Response.json(
      { error: { code: "X", message: "Email or password is incorrect." } },
      { status: 401 },
    ),
  );
  assert.deepEqual(envelope, { ok: false, message: "Email or password is incorrect." });

  const html = await readApiResponse(new Response("<html>500</html>", { status: 500 }));
  assert.equal(html.ok, false);
  if (!html.ok) assert.match(html.message, /went wrong on our side/);

  const limited = await readApiResponse(new Response("", { status: 429 }));
  assert.equal(limited.ok, false);
  if (!limited.ok) assert.match(limited.message, /Too many attempts/);
});

test("a successful sign-in can clear its per-account failure bucket", () => {
  resetRateLimitForTests();
  assert.equal(consumeRateLimit("login-account:a", 1, 1000, 100).allowed, true);
  assert.equal(consumeRateLimit("login-account:a", 1, 1000, 200).allowed, false);
  resetRateLimit("login-account:a");
  assert.equal(consumeRateLimit("login-account:a", 1, 1000, 300).allowed, true);
});

test("project presentation labels cover every status and locale", () => {
  assert.deepEqual(Object.keys(PROJECT_STATUS_LABELS).sort(), [
    "APPROVED",
    "ARCHIVED",
    "DRAFT",
    "PLANNING",
    "REVIEW_READY",
  ]);
  assert.equal(localeLabel("hi-IN"), "Hindi");
  assert.equal(topicLabel("MULTIPLICATION_EQUAL_GROUPS"), "Multiplication as Equal Groups");
  assert.equal(topicLabel("UNKNOWN_TOPIC"), "UNKNOWN_TOPIC");
});
