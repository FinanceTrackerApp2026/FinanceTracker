package auth

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func withSecret(t *testing.T) {
	t.Helper()
	t.Setenv("JWT_SECRET", strings.Repeat("finance-tracker-test-secret", 2)[:32])
}

func TestHashAndVerifyPassword(t *testing.T) {
	hash, err := HashPassword("correct-horse-battery")
	if err != nil {
		t.Fatalf("hash: %v", err)
	}
	if hash == "correct-horse-battery" {
		t.Fatal("password was stored in plain text")
	}
	if err := VerifyPassword(hash, "correct-horse-battery"); err != nil {
		t.Fatalf("verify matching password: %v", err)
	}
	if err := VerifyPassword(hash, "wrong-password-value"); err == nil {
		t.Fatal("expected invalid password to fail")
	}
}

func TestValidateRegistration(t *testing.T) {
	if err := ValidateRegistration("Ada Lovelace", "ada@example.com", "long-enough-pass"); err != nil {
		t.Fatalf("valid registration rejected: %v", err)
	}
	if err := ValidateRegistration("", "ada@example.com", "long-enough-pass"); err == nil {
		t.Fatal("expected missing name to fail")
	}
	if err := ValidateRegistration("Ada", "not-an-email", "long-enough-pass"); err == nil {
		t.Fatal("expected invalid email to fail")
	}
	if err := ValidateRegistration("Ada", "ada@example.com", "short"); err == nil {
		t.Fatal("expected short password to fail")
	}
}

func TestGenerateAndParseToken(t *testing.T) {
	withSecret(t)
	token, err := GenerateToken(42)
	if err != nil {
		t.Fatalf("generate: %v", err)
	}
	userID, err := ParseToken(token)
	if err != nil {
		t.Fatalf("parse: %v", err)
	}
	if userID != 42 {
		t.Fatalf("got user %d", userID)
	}
}

func TestParseTokenRejectsMissingExpiredAndTampered(t *testing.T) {
	withSecret(t)
	if _, err := ParseToken(""); err == nil {
		t.Fatal("expected missing token to fail")
	}
	expired, err := GenerateTokenWithTTL(7, -time.Minute)
	if err != nil {
		t.Fatalf("expired token: %v", err)
	}
	if _, err := ParseToken(expired); err == nil {
		t.Fatal("expected expired token to fail")
	}
	token, err := GenerateToken(7)
	if err != nil {
		t.Fatalf("token: %v", err)
	}
	if _, err := ParseToken(token + "tampered"); err == nil {
		t.Fatal("expected tampered token to fail")
	}
}

func TestMiddlewareSetsUserFromBearerToken(t *testing.T) {
	withSecret(t)
	token, err := GenerateToken(9)
	if err != nil {
		t.Fatalf("token: %v", err)
	}
	var got int
	handler := Middleware(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		got, _ = UserID(request.Context())
		writer.WriteHeader(http.StatusNoContent)
	}))
	request := httptest.NewRequest(http.MethodPost, "/query", nil)
	request.Header.Set("Authorization", "Bearer "+token)
	handler.ServeHTTP(httptest.NewRecorder(), request)
	if got != 9 {
		t.Fatalf("context user = %d", got)
	}
}

func TestUserIDRequiresContext(t *testing.T) {
	request := httptest.NewRequest(http.MethodPost, "/query", nil)
	if _, err := UserID(request.Context()); err != ErrAuthenticationRequired {
		t.Fatalf("expected authentication required, got %v", err)
	}
}
