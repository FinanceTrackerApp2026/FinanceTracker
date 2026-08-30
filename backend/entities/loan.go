package entities

import "time"

type Loan struct {
	ID                   int
	ContactID            int
	ContactCode          string
	ContactName          string
	LoanReference        string
	LoanType             string
	InterestType         string
	PrincipalAmount      float64
	OutstandingPrincipal float64
	InterestRate         float64
	InterestFrequency    string
	LoanDate             time.Time
	DueDay               int
	LoanTenure           int
	TenureUnit           string
	HasSecurity          bool
	Status               string
	Notes                string
	CreatedAt            time.Time
	UpdatedAt            time.Time
}
