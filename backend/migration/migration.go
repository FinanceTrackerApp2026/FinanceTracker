package migration

import (
	"database/sql"
	"errors"
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"finance-tracker/backend/auth"
	"finance-tracker/backend/entities"
	"finance-tracker/backend/postgres"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func sourceURL() string {
	if directory := os.Getenv("MIGRATIONS_DIR"); directory != "" {
		absolute, err := filepath.Abs(directory)
		if err != nil {
			return "file://" + directory
		}
		return "file://" + absolute
	}
	for _, candidate := range []string{"migrations", "../migrations", "../../migrations"} {
		if info, err := os.Stat(candidate); err == nil && info.IsDir() {
			absolute, err := filepath.Abs(candidate)
			if err != nil {
				continue
			}
			return "file://" + absolute
		}
	}
	return "file://../migrations"
}

func databaseURL() string {
	query := url.Values{}
	query.Set("sslmode", environmentValue("DB_SSLMODE", "", "disable"))
	connection := url.URL{
		Scheme:   "postgres",
		User:     url.UserPassword(environmentValue("DB_USER", "POSTGRES_USER", ""), environmentValue("DB_PASSWORD", "POSTGRES_PASSWORD", "")),
		Host:     environmentValue("DB_HOST", "POSTGRES_HOST", "localhost") + ":" + environmentValue("DB_PORT", "POSTGRES_PORT", "5432"),
		Path:     "/" + environmentValue("DB_NAME", "POSTGRES_DB", ""),
		RawQuery: query.Encode(),
	}
	return connection.String()
}

func environmentValue(primary, legacy, fallback string) string {
	if value := os.Getenv(primary); value != "" {
		return value
	}
	if value := os.Getenv(legacy); value != "" {
		return value
	}
	return fallback
}

func newMigrate() (*migrate.Migrate, error) {
	return migrate.New(sourceURL(), databaseURL())
}

func run(operation string) error {
	m, err := newMigrate()
	if err != nil {
		return err
	}
	defer m.Close()

	switch operation {
	case "up":
		err = m.Up()
	case "down":
		err = m.Steps(-1)
	default:
		return fmt.Errorf("unsupported migration operation %q", operation)
	}
	if errors.Is(err, migrate.ErrNoChange) {
		return nil
	}
	return err
}

func Up() error   { return run("up") }
func Down() error { return run("down") }

func Version() (uint, bool, error) {
	m, err := newMigrate()
	if err != nil {
		return 0, false, err
	}
	defer m.Close()
	version, dirty, err := m.Version()
	if errors.Is(err, migrate.ErrNilVersion) {
		return 0, false, nil
	}
	return version, dirty, err
}

func Force(version int) error {
	m, err := newMigrate()
	if err != nil {
		return err
	}
	defer m.Close()
	return m.Force(version)
}

func AssignExistingContactsToOwner() (int64, error) {
	email := strings.TrimSpace(strings.ToLower(os.Getenv("INITIAL_OWNER_EMAIL")))
	fullName := strings.TrimSpace(os.Getenv("INITIAL_OWNER_FULL_NAME"))
	password := os.Getenv("INITIAL_OWNER_PASSWORD")
	if email == "" {
		return 0, errors.New("INITIAL_OWNER_EMAIL is required to assign existing contacts")
	}
	if postgres.DB == nil {
		if err := postgres.Connect(); err != nil {
			return 0, err
		}
	}

	owner, err := postgres.GetUserByEmail(email)
	if err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			return 0, err
		}
		if fullName == "" {
			fullName = "Initial Owner"
		}
		if err := auth.ValidateRegistration(fullName, email, password); err != nil {
			return 0, fmt.Errorf("create initial owner: %w", err)
		}
		hash, hashErr := auth.HashPassword(password)
		if hashErr != nil {
			return 0, hashErr
		}
		owner = &entities.User{Email: email, FullName: fullName, PasswordHash: hash, Status: "ACTIVE"}
		if err := postgres.CreateUser(owner); err != nil {
			return 0, err
		}
	}

	assigned, err := postgres.AssignOrphanContacts(owner.ID)
	if err != nil {
		return 0, err
	}
	return assigned, nil
}

func ParseForceVersion(value string) (int, error) {
	version, err := strconv.Atoi(value)
	if err != nil || version < 0 {
		return 0, errors.New("force requires a non-negative version number")
	}
	return version, nil
}
