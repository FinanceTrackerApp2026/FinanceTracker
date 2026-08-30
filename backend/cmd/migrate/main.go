package main

import (
	"fmt"
	"os"

	"finance-tracker/backend/config"
	"finance-tracker/backend/migration"
	"finance-tracker/backend/postgres"
)

func main() {
	config.LoadEnv()
	defer postgres.Close()
	command := "status"
	if len(os.Args) > 1 {
		command = os.Args[1]
	}

	var err error
	switch command {
	case "up":
		err = migration.Up()
		if err == nil {
			printStatus()
		}
	case "down":
		err = migration.Down()
		if err == nil {
			printStatus()
		}
	case "status":
		err = printStatus()
	case "assign-owner":
		assigned, assignErr := migration.AssignExistingContactsToOwner()
		err = assignErr
		if err == nil {
			fmt.Printf("assigned %d existing contact(s) to the initial owner\n", assigned)
		}
	case "force":
		if len(os.Args) < 3 {
			err = fmt.Errorf("usage: go run ./cmd/migrate force <version>")
			break
		}
		version, forceErr := migration.ParseForceVersion(os.Args[2])
		if forceErr != nil {
			err = forceErr
			break
		}
		err = migration.Force(version)
		if err == nil {
			printStatus()
		}
	default:
		err = fmt.Errorf("usage: go run ./cmd/migrate [up|down|status|assign-owner|force <version>]")
	}
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func printStatus() error {
	version, dirty, err := migration.Version()
	if err != nil {
		return err
	}
	fmt.Printf("migration version: %d (dirty: %t)\n", version, dirty)
	return nil
}
