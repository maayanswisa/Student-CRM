export type ThemeColorKey = "default" | "blue" | "green" | "purple" | "rose" | "amber";

export const THEME_COLOR_PRESETS: { key: ThemeColorKey; label: string; swatch: string }[] = [
  { key: "default", label: "אפור (ברירת מחדל)", swatch: "oklch(0.205 0 0)" },
  { key: "blue", label: "כחול", swatch: "oklch(0.55 0.2 260)" },
  { key: "green", label: "ירוק", swatch: "oklch(0.55 0.15 150)" },
  { key: "purple", label: "סגול", swatch: "oklch(0.5 0.22 300)" },
  { key: "rose", label: "ורוד", swatch: "oklch(0.55 0.22 15)" },
  { key: "amber", label: "כתום", swatch: "oklch(0.65 0.16 70)" },
];

export const DEFAULT_THEME_COLOR_KEY: ThemeColorKey = "default";

export function resolveThemeColor(key: string | null | undefined): ThemeColorKey {
  return THEME_COLOR_PRESETS.some((p) => p.key === key)
    ? (key as ThemeColorKey)
    : DEFAULT_THEME_COLOR_KEY;
}
