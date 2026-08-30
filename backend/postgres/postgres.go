package postgres

import (
	"database/sql"
	"fmt"
	"os"
	"time"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func environmentValue(primary, legacy, fallback string) string {
	if value := os.Getenv(primary); value != "" {
		return value
	}
	if value := os.Getenv(legacy); value != "" {
		return value
	}
	return fallback
}

func DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		environmentValue("DB_HOST", "POSTGRES_HOST", "localhost"),
		environmentValue("DB_PORT", "POSTGRES_PORT", "5432"),
		environmentValue("DB_USER", "POSTGRES_USER", ""),
		environmentValue("DB_PASSWORD", "POSTGRES_PASSWORD", ""),
		environmentValue("DB_NAME", "POSTGRES_DB", ""),
		environmentValue("DB_SSLMODE", "", "disable"),
	)
}

func Connect() error {
	db, err := sql.Open("postgres", DSN())
	if err != nil {
		return err
	}

	err = db.Ping()
	if err != nil {
		return err
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)
	db.SetConnMaxIdleTime(1 * time.Minute)

	DB = db
	return nil
}

func Close() error {
	if DB == nil {
		return nil
	}
	return DB.Close()
}
