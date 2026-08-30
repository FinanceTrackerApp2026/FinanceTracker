ALTER TABLE contacts ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS contacts_user_id_idx ON contacts (user_id);
