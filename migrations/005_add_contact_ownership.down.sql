DROP INDEX IF EXISTS contacts_user_id_idx;
ALTER TABLE contacts DROP COLUMN IF EXISTS user_id;
