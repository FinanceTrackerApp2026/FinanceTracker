package config

import (
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/joho/godotenv"
)

func AppEnvironment() string {
	env := strings.TrimSpace(strings.ToLower(os.Getenv("APP_ENV")))
	if env == "" {
		env = strings.TrimSpace(strings.ToLower(os.Getenv("NODE_ENV")))
	}
	if env == "" {
		return "development"
	}
	return env
}

func IsProduction() bool {
	return AppEnvironment() == "production"
}

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
}

func AllowedOrigins() []string {
	value := strings.TrimSpace(os.Getenv("CORS_ALLOWED_ORIGINS"))
	if value == "" {
		return []string{"http://localhost:5173"}
	}

	seen := make(map[string]struct{})
	origins := make([]string, 0, 4)
	for _, part := range strings.Split(value, ",") {
		origin := strings.TrimSpace(part)
		if origin == "" {
			continue
		}
		if _, ok := seen[origin]; ok {
			continue
		}
		seen[origin] = struct{}{}
		origins = append(origins, origin)
	}

	if len(origins) == 0 {
		return []string{"http://localhost:5173"}
	}
	return origins
}
