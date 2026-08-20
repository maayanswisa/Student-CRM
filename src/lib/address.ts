export function addressDetails(student: {
  entrance?: string | null;
  entry_code?: string | null;
  floor?: string | null;
  apartment_number?: string | null;
}): string {
  const parts: string[] = [];
  if (student.floor) parts.push(`קומה ${student.floor}`);
  if (student.apartment_number) parts.push(`דירה ${student.apartment_number}`);
  if (student.entrance) parts.push(`כניסה ${student.entrance}`);
  if (student.entry_code) parts.push(`קוד ${student.entry_code}`);
  return parts.join(" · ");
}
