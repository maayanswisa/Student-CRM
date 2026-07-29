const PAYMENT_PHONE = "0526460735";

function normalizeIsraeliPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("972")) return digits;
  if (digits.startsWith("0")) return `972${digits.slice(1)}`;
  return digits;
}

function buildWhatsAppLink(phone: string, message: string): string {
  const number = normalizeIsraeliPhone(phone);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildPaymentReminderLink(params: {
  phone: string;
  studentName: string;
  unpaidCount: number;
  totalOwed: number;
}): string {
  const { phone, studentName, unpaidCount, totalOwed } = params;
  const message = [
    `היי! מדובר בתזכורת תשלום עבור השיעורים של ${studentName}.`,
    `יש ${unpaidCount} שיעורים שהושלמו וטרם שולמו, על סך ${totalOwed.toFixed(2)} ש"ח.`,
    `אפשר להעביר בביט/פייבוקס למספר: ${PAYMENT_PHONE}. תודה רבה!`,
  ].join("\n");
  return buildWhatsAppLink(phone, message);
}

export function buildLessonReminderLink(params: {
  phone: string;
  studentName: string;
  dateTime: string;
}): string {
  const { phone, studentName, dateTime } = params;
  const date = new Date(dateTime);
  const time = date.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const message = [
    `היי! רק להזכיר ש${studentName ? `ל${studentName}` : ""} יש שיעור מחר בשעה ${time}.`,
    `נתראה בקרוב :)`,
  ].join("\n");
  return buildWhatsAppLink(phone, message);
}

export function buildMonthlyStatementLink(params: {
  phone: string;
  studentName: string;
  monthLabel: string;
  lessons: { dateTime: string; price: number; isPaid: boolean }[];
  totalOwed: number;
}): string {
  const { phone, studentName, monthLabel, lessons, totalOwed } = params;
  const lines = lessons.map((lesson, i) => {
    const date = new Date(lesson.dateTime).toLocaleDateString("he-IL");
    const status = lesson.isPaid ? "שולם" : "לא שולם";
    return `${i + 1}. ${date} - ${lesson.price.toFixed(0)} ש"ח - ${status}`;
  });
  const message = [
    `סיכום שיעורים עבור ${studentName} - ${monthLabel}:`,
    ...(lines.length > 0 ? lines : ["לא היו שיעורים שהושלמו בחודש זה."]),
    "",
    `סה"כ יתרה לתשלום (כולל חובות קודמים): ${totalOwed.toFixed(2)} ש"ח`,
    `אפשר להעביר בביט/פייבוקס למספר: ${PAYMENT_PHONE}. תודה רבה!`,
  ].join("\n");
  return buildWhatsAppLink(phone, message);
}

export function buildLessonSummaryLink(params: {
  phone: string;
  studentName: string;
  summary: string;
}): string {
  const { phone, studentName, summary } = params;
  const message = [
    `סיכום שיעור עבור ${studentName}:`,
    summary,
  ].join("\n\n");
  return buildWhatsAppLink(phone, message);
}
