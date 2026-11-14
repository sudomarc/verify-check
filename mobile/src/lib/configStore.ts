/**
 * Config de l'app mobile : lecture unique des variables `EXPO_PUBLIC_*`.
 * Aucun identifiant codé en dur ; voir mobile/.env.example.
 */

import { readConfig, type AppConfig } from "./config";

let cached: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (!cached) {
    // expo-constants n'est pas requis : Expo expose les EXPO_PUBLIC_* dans process.env.
    cached = readConfig(process.env as unknown as Record<string, string | undefined>);
  }
  return cached;
}

/** Pour les tests : réinitialise le cache de config. */
export function resetConfigCache(): void {
  cached = null;
}
