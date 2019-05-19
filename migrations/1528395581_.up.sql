BEGIN;

ALTER TABLE discussion_threads ADD COLUMN settings text;
ALTER TABLE discussion_threads ADD COLUMN is_check boolean NOT NULL DEFAULT false;
ALTER TABLE discussion_threads ADD COLUMN is_active boolean NOT NULL DEFAULT false;

COMMIT;
