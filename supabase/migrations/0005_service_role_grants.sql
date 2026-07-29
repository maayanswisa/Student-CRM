-- The /admin platform-analytics dashboard (src/actions/admin.ts) reads
-- students/lessons via the service_role client to aggregate data across
-- every teacher, bypassing RLS. service_role bypassing RLS does not imply
-- it has ordinary table-level grants - those are separate, and (like
-- 0002_grants.sql for `authenticated`) SQL-Editor-created tables don't
-- auto-grant them the way Table Editor-created ones do.
grant select, insert, update, delete on students to service_role;
grant select, insert, update, delete on lessons to service_role;
