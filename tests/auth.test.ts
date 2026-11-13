import { test } from "node:test";
import assert from "node:assert/strict";
import { isAdminRole } from "../src/lib/auth.ts";

test("isAdminRole lit le rôle uniquement dans app_metadata", () => {
  assert.ok(isAdminRole({ app_metadata: { role: "admin" } }));
  // user_metadata ne doit JAMAIS être pris en compte (usurpation possible côté client)
  assert.ok(!isAdminRole({ app_metadata: {} } as never));
  assert.ok(!isAdminRole({ app_metadata: null } as never));
  assert.ok(!isAdminRole({} as never));
});

test("isAdminRole rejette un rôle non admin dans app_metadata", () => {
  assert.ok(!isAdminRole({ app_metadata: { role: "teacher" } }));
  assert.ok(!isAdminRole({ app_metadata: { role: "" } }));
});
