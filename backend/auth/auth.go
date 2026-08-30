package auth

import (
	"context"
	"errors"
	"fmt"
	"net/mail"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

const userContextKey contextKey = "authenticated-user-id"

type contextKey string

var (
	ErrAuthenticationRequired = errors.New("authentication required")
	ErrInvalidCredentials     = errors.New("invalid email or password")
	ErrDuplicateEmail         = errors.New("user with this email already exists")
	ErrAccessDenied           = errors.New("you do not have access to this resource")
)

func jwtSecret() ([]byte, error) {
	secret := os.Getenv("JWT_SECRET")
	if len(secret) < 32 {
		return nil, errors.New("JWT_SECRET must be set and contain at least 32 characters")
	}
	return []byte(secret), nil
}

func Ready() error {
	_, err := jwtSecret()
	return err
}

func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(hash), err
}

func VerifyPassword(hash, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
}

func ValidateRegistration(fullName, email, password string) error {
	if strings.TrimSpace(fullName) == "" || strings.TrimSpace(email) == "" || password == "" {
		return errors.New("full name, email, and password are required")
	}
	if _, err := mail.ParseAddress(strings.TrimSpace(email)); err != nil {
		return errors.New("enter a valid email address")
	}
	if len(password) < 8 {
		return errors.New("password must contain at least 8 characters")
	}
	return nil
}

func GenerateToken(userID int) (string, error) {
	return GenerateTokenWithTTL(userID, 24*time.Hour)
}

func GenerateTokenWithTTL(userID int, ttl time.Duration) (string, error) {
	if userID <= 0 {
		return "", errors.New("invalid user id")
	}
	secret, err := jwtSecret()
	if err != nil {
		return "", err
	}
	now := time.Now()
	claims := jwt.RegisteredClaims{
		Subject:   strconv.Itoa(userID),
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(secret)
}

func ParseToken(tokenString string) (int, error) {
	if strings.TrimSpace(tokenString) == "" {
		return 0, errors.New("invalid authentication token")
	}
	secret, err := jwtSecret()
	if err != nil {
		return 0, err
	}
	claims := &jwt.RegisteredClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (any, error) {
		if token.Method != jwt.SigningMethodHS256 {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return secret, nil
	})
	if err != nil || token == nil || !token.Valid {
		return 0, errors.New("invalid authentication token")
	}
	userID, err := strconv.Atoi(claims.Subject)
	if err != nil || userID <= 0 {
		return 0, errors.New("invalid authentication token")
	}
	return userID, nil
}

func WithUserID(ctx context.Context, userID int) context.Context {
	return context.WithValue(ctx, userContextKey, userID)
}

func UserID(ctx context.Context) (int, error) {
	userID, ok := ctx.Value(userContextKey).(int)
	if !ok || userID <= 0 {
		return 0, ErrAuthenticationRequired
	}
	return userID, nil
}
