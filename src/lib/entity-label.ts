export type EntityLabelKey = "student" | "patient" | "client";

interface EntityLabelPreset {
  key: EntityLabelKey;
  label: string;
  singular: string;
  plural: string;
}

export const ENTITY_LABEL_PRESETS: Record<EntityLabelKey, EntityLabelPreset> = {
  student: { key: "student", label: "תלמיד/ה", singular: "תלמיד/ה", plural: "תלמידים" },
  patient: { key: "patient", label: "מטופל/ת", singular: "מטופל/ת", plural: "מטופלים" },
  client: { key: "client", label: "לקוח/ה", singular: "לקוח/ה", plural: "לקוחות" },
};

export const DEFAULT_ENTITY_LABEL_KEY: EntityLabelKey = "student";

export interface ResolvedEntityLabel {
  key: EntityLabelKey;
  /** תלמיד/ה */
  singular: string;
  /** תלמיד */
  singularMale: string;
  /** התלמיד/ה */
  singularDefinite: string;
  /** תלמידים */
  plural: string;
  /** התלמידים */
  pluralDefinite: string;
}

export function resolveEntityLabel(key: string | null | undefined): ResolvedEntityLabel {
  const preset =
    ENTITY_LABEL_PRESETS[key as EntityLabelKey] ?? ENTITY_LABEL_PRESETS[DEFAULT_ENTITY_LABEL_KEY];
  return {
    key: preset.key,
    singular: preset.singular,
    singularMale: preset.singular.split("/")[0],
    singularDefinite: `ה${preset.singular}`,
    plural: preset.plural,
    pluralDefinite: `ה${preset.plural}`,
  };
}
