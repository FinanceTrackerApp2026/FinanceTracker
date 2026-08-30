DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM contacts WHERE user_id IS NULL) THEN
        RAISE EXCEPTION 'Existing contacts have no owner. Set INITIAL_OWNER_EMAIL (and INITIAL_OWNER_PASSWORD for a new user) then run: go run ./cmd/migrate assign-owner';
    END IF;
END $$;

ALTER TABLE contacts ALTER COLUMN user_id SET NOT NULL;
