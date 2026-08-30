package entities

import "time"

type User struct {
	ID           int
	Email        string
	PasswordHash string
	FullName     string
	Status       string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
