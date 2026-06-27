package entities

import "time"

type Payment struct {
	ID                   int
	LoanID               int
	PaymentDate          time.Time
	PaymentAmount        float64
	PaymentType          string
	PaymentMethod        string
	TransactionReference string
	Notes                string
	CreatedAt            time.Time
}