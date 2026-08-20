export type SessionLabelKey = "lesson" | "meeting" | "session" | "treatment";

interface SessionLabelPreset {
  key: SessionLabelKey;
  label: string;
  singular: string;
  plural: string;
  /** Hebrew grammatical gender of the noun, for verb agreement (e.g. נקבע/נקבעה). */
  feminine: boolean;
}

export const SESSION_LABEL_PRESETS: Record<SessionLabelKey, SessionLabelPreset> = {
  lesson: { key: "lesson", label: "שיעור", singular: "שיעור", plural: "שיעורים", feminine: false },
  meeting: { key: "meeting", label: "פגישה", singular: "פגישה", plural: "פגישות", feminine: true },
  session: { key: "session", label: "מפגש", singular: "מפגש", plural: "מפגשים", feminine: false },
  treatment: { key: "treatment", label: "טיפול", singular: "טיפול", plural: "טיפולים", feminine: false },
};

export const DEFAULT_SESSION_LABEL_KEY: SessionLabelKey = "lesson";

export interface ResolvedSessionLabel {
  key: SessionLabelKey;
  feminine: boolean;
  /** שיעור */
  singular: string;
  /** השיעור */
  singularDefinite: string;
  /** שיעורים */
  plural: string;
  /** השיעורים */
  pluralDefinite: string;
  /** Pick the verb/adjective form matching this label's grammatical gender, e.g. verb("נקבע", "נקבעה"). */
  verb: (masculine: string, feminine: string) => string;
}

export function resolveSessionLabel(key: string | null | undefined): ResolvedSessionLabel {
  const preset =
    SESSION_LABEL_PRESETS[key as SessionLabelKey] ?? SESSION_LABEL_PRESETS[DEFAULT_SESSION_LABEL_KEY];
  return {
    key: preset.key,
    feminine: preset.feminine,
    singular: preset.singular,
    singularDefinite: `ה${preset.singular}`,
    plural: preset.plural,
    pluralDefinite: `ה${preset.plural}`,
    verb: (masculine, feminine) => (preset.feminine ? feminine : masculine),
  };
}
