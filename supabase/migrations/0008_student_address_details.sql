-- Separate building-entry details (entrance/code/floor/apartment) from the
-- main address, so the address field stays a clean, geocodable string for
-- Waze links while these extra details are still recorded and shown.
alter table students
  add column if not exists entrance text,
  add column if not exists entry_code text,
  add column if not exists floor text,
  add column if not exists apartment_number text;
