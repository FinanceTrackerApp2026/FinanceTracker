package config

import "testing"

func TestAllowedOrigins(t *testing.T) {
	t.Setenv("CORS_ALLOWED_ORIGINS", "https://app.example.com, http://localhost:5173, https://app.example.com")

	origins := AllowedOrigins()
	if len(origins) != 2 {
		t.Fatalf("expected 2 unique origins, got %d: %#v", len(origins), origins)
	}
	if origins[0] != "https://app.example.com" {
		t.Fatalf("expected first origin to be app.example.com, got %q", origins[0])
	}
	if origins[1] != "http://localhost:5173" {
		t.Fatalf("expected second origin to be localhost, got %q", origins[1])
	}
}

func TestAllowedOriginsDefaultsToLocalFrontend(t *testing.T) {
	t.Setenv("CORS_ALLOWED_ORIGINS", "")

	origins := AllowedOrigins()
	if len(origins) != 1 || origins[0] != "http://localhost:5173" {
		t.Fatalf("expected default local frontend origin, got %#v", origins)
	}
}
