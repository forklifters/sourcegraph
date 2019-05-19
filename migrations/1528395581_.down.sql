BEGIN;

ALTER TABLE discussion_threads DROP COLUMN settings;
ALTER TABLE discussion_threads DROP COLUMN is_check;
ALTER TABLE discussion_threads DROP COLUMN is_active;

COMMIT;
