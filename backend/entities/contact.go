package entities

import "time"

type Contact struct {
	ID           int
	ContactCode  string
	FullName     string
	PhoneNumber  string
	Email        string
	Address      string
	Occupation   string
	ContactType  string
	Notes        string
	Status       string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}