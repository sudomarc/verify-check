import { test } from "node:test";
import assert from "node:assert/strict";
import { readConfig } from "../src/lib/config.ts";

test("readConfig : variable manquante → erreur explicite sans révéler de valeur", () => {
  assert.throws(
    () => readConfig({ EXPO_PUBLIC_SUPABASE_URL: "", EXPO_PUBLIC_SUPABASE_ANON_KEY: "k" }),
    /Configuration manquante : EXPO_PUBLIC_SUPABASE_URL/
  );
});

test("readConfig : URL invalide rejetée", () => {
  assert.throws(
    () => readConfig({ EXPO_PUBLIC_SUPABASE_URL: "pas-une-url", EXPO_PUBLIC_SUPABASE_ANON_KEY: "k" }),
    /URL http\(s\) valide/
  );
});

test("readConfig : configuration valide, sans slash final sur apiBaseUrl", () => {
  const cfg = readConfig({
    EXPO_PUBLIC_SUPABASE_URL: "https://exemple.supabase.co/",
    EXPO_PUBLIC_SUPABASE_ANON_KEY: "cle-publique",
    EXPO_PUBLIC_API_BASE_URL: "https://verifycheck.vercel.app/",
  });
  assert.equal(cfg.apiBaseUrl, "https://verifycheck.vercel.app");
  assert.equal(cfg.supabaseUrl, "https://exemple.supabase.co/");
});
