package config

import (
	"log"
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

func LoadEnv() {
	candidates := []string{".env", "../.env", filepath.Join("..", "..", ".env")}

	for _, candidate := range candidates {
		if _, err := os.Stat(candidate); err == nil {
			if err := godotenv.Load(candidate); err != nil {
				log.Fatalf("Error loading .env file %s: %v", candidate, err)
			}
			return
		}
	}

	log.Fatal("No .env file found")
}
