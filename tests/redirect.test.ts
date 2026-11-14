import { test } from "node:test";
import assert from "node:assert/strict";
import { safeNext } from "../src/lib/redirect.ts";

test("safeNext : chemin interne accepté", () => {
  assert.equal(safeNext("/dashboard"), "/dashboard");
  assert.equal(safeNext("/scanner/"), "/scanner/");
  assert.equal(safeNext("/dashboard?classe=cl-1"), "/dashboard?classe=cl-1");
});

test("safeNext : absence de valeur → /dashboard", () => {
  assert.equal(safeNext(null), "/dashboard");
  assert.equal(safeNext(undefined), "/dashboard");
  assert.equal(safeNext(""), "/dashboard");
});

test("safeNext : URL absolue rejetée (open redirect)", () => {
  assert.equal(safeNext("https://evil.example/phish"), "/dashboard");
  assert.equal(safeNext("http://evil.example"), "/dashboard");
});

test("safeNext : URL protocol-relative rejetée", () => {
  assert.equal(safeNext("//evil.example"), "/dashboard");
  assert.equal(safeNext("//evil.example/phish"), "/dashboard");
});

test("safeNext : schéma relatif dangereux rejeté", () => {
  assert.equal(safeNext("javascript:alert(1)"), "/dashboard");
  assert.equal(safeNext("data:text/html,<script>alert(1)</script>"), "/dashboard");
});
