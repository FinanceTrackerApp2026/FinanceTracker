package entities

import "time"

type Contact struct {
	ID           int
	CustomerCode string
	FullName     string
	Address      string
	Occupation   string
	Notes        string
	Status       string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}