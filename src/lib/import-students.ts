import * as XLSX from "xlsx";
import type { StudentFormInput } from "@/lib/validation/student";

export type ImportFieldKey =
  | "student_name"
  | "mother_name"
  | "mother_phone"
  | "student_phone"
  | "address"
  | "grade"
  | "academic_level"
  | "school"
  | "hourly_rate"
  | "preferred_learning_day"
  | "preferred_learning_time"
  | "notes";

export const IMPORT_FIELDS: { key: ImportFieldKey; label: string; required?: boolean }[] = [
  { key: "student_name", label: "שם התלמיד/ה", required: true },
  { key: "mother_name", label: "שם ההורה" },
  { key: "mother_phone", label: "טלפון ההורה" },
  { key: "student_phone", label: "טלפון התלמיד/ה" },
  { key: "address", label: "כתובת" },
  { key: "grade", label: "כיתה" },
  { key: "academic_level", label: "רמת לימוד" },
  { key: "school", label: "בית ספר" },
  { key: "hourly_rate", label: "מחיר לשיעור" },
  { key: "preferred_learning_day", label: "ימי לימוד מועדפים" },
  { key: "preferred_learning_time", label: "שעה מועדפת" },
  { key: "notes", label: "הערות" },
];

const FIELD_ALIASES: Record<ImportFieldKey, string[]> = {
  student_name: ["שם תלמיד", "שם התלמיד", "שם התלמיד/ה", "student name", "name", "full name"],
  mother_name: ["שם אם", "שם ההורה", "שם הורה", "mother name", "parent name"],
  mother_phone: ["טלפון אם", "טלפון הורה", "טלפון ההורה", "mother phone", "parent phone"],
  student_phone: ["טלפון תלמיד", "טלפון התלמיד", "טלפון התלמיד/ה", "student phone"],
  address: ["כתובת", "address"],
  grade: ["כיתה", "grade"],
  academic_level: ["רמת לימוד", "רמה", "academic level", "level"],
  school: ["בית ספר", "school"],
  hourly_rate: ["מחיר לשיעור", "מחיר", "תעריף", "hourly rate", "price", "rate"],
  preferred_learning_day: ["ימי לימוד מועדפים", "ימי לימוד", "יום", "ימים", "day", "days"],
  preferred_learning_time: ["שעה מועדפת", "שעה", "time"],
  notes: ["הערות", "notes"],
};

const DAY_NAME_TO_LETTER: Record<string, string> = {
  "א": "א", "ראשון": "א", "יום ראשון": "א", sunday: "א", sun: "א",
  "ב": "ב", "שני": "ב", "יום שני": "ב", monday: "ב", mon: "ב",
  "ג": "ג", "שלישי": "ג", "יום שלישי": "ג", tuesday: "ג", tue: "ג",
  "ד": "ד", "רביעי": "ד", "יום רביעי": "ד", wednesday: "ד", wed: "ד",
  "ה": "ה", "חמישי": "ה", "יום חמישי": "ה", thursday: "ה", thu: "ה",
  "ו": "ו", "שישי": "ו", "יום שישי": "ו", friday: "ו", fri: "ו",
  "שבת": "שבת", "יום שבת": "שבת", saturday: "שבת", sat: "שבת",
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export type ParsedSheet = {
  headers: string[];
  rows: Record<string, string>[];
};

const isCsv = (file: File) =>
  file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";

export async function parseSpreadsheetFile(file: File): Promise<ParsedSheet> {
  // CSV has no embedded encoding metadata, so SheetJS's binary "array" mode
  // reads it byte-by-byte instead of as UTF-8 text, which mangles Hebrew
  // (each Hebrew character becomes garbled multi-char sequences). Decoding
  // it as text ourselves first and parsing that as a "string" workbook
  // avoids the mojibake. Real .xlsx/.xls files carry their own encoding
  // inside the binary format, so the array path is correct for those.
  const workbook = isCsv(file)
    ? XLSX.read(await file.text(), { type: "string" })
    : XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });

  const headers = (rows[0] ?? []).map((h) => String(h ?? "").trim());
  const dataRows = rows
    .slice(1)
    .map((row) =>
      Object.fromEntries(
        headers.map((header, i) => [header, String(row[i] ?? "").trim()])
      )
    )
    .filter((row) => Object.values(row).some((v) => v !== ""));

  return { headers, rows: dataRows };
}

export function autoMatchColumns(headers: string[]): Record<ImportFieldKey, string | null> {
  const normalizedHeaders = headers.map((h) => ({ raw: h, normalized: normalize(h) }));
  const mapping = {} as Record<ImportFieldKey, string | null>;

  for (const { key, } of IMPORT_FIELDS) {
    const aliases = FIELD_ALIASES[key];
    const match = normalizedHeaders.find(({ normalized }) =>
      aliases.some((alias) => normalized === alias || normalized.includes(alias))
    );
    mapping[key] = match?.raw ?? null;
  }

  return mapping;
}

export function parsePrice(raw: string): string {
  const match = raw.match(/\d+(\.\d+)?/);
  return match ? match[0] : "0";
}

export function parseDays(raw: string): string[] {
  if (!raw) return [];
  const tokens = raw.split(/[,;/\n]+/).map((t) => normalize(t)).filter(Boolean);
  const letters = tokens.map((t) => DAY_NAME_TO_LETTER[t]).filter((v): v is string => Boolean(v));
  return Array.from(new Set(letters));
}

export function buildRowInput(
  row: Record<string, string>,
  mapping: Record<ImportFieldKey, string | null>
): StudentFormInput {
  const get = (key: ImportFieldKey) => {
    const column = mapping[key];
    return column ? (row[column] ?? "").trim() : "";
  };

  return {
    student_name: get("student_name"),
    mother_name: get("mother_name"),
    student_phone: get("student_phone"),
    mother_phone: get("mother_phone"),
    address: get("address"),
    grade: get("grade"),
    academic_level: get("academic_level"),
    school: get("school"),
    hourly_rate: parsePrice(get("hourly_rate")),
    default_lesson_duration_minutes: "60",
    preferred_learning_day: parseDays(get("preferred_learning_day")),
    preferred_learning_time: get("preferred_learning_time"),
    status: "active",
    notes: get("notes"),
    upcoming_exam_date: "",
  };
}
