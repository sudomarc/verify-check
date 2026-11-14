/** Thème mobile — « registre scolaire contemporain » (docs/design-brief.md). */

export const theme = {
  paper: "#FAF7F0",
  card: "#FFFDF8",
  ink: "#1C2733",
  inkSoft: "#5B6B7C",
  accent: "#14604A",
  accentInk: "#0C3D2F",
  warn: "#9A5B00",
  danger: "#A32E2E",
  line: "#DCD5C8",
  scanBg: "#12181F",
  white: "#FFFFFF",
  radius: 8,
  radiusSm: 4,
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
  type: { body: 15, small: 13, title: 20, big: 28 },
} as const;

export const statutCouleur: Record<string, string> = {
  present: theme.accent,
  "non-pointe": theme.warn,
  absent: theme.danger,
};
