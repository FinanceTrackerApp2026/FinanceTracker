package entities

type DashboardSummary struct {
	TotalLent            float64
	TotalBorrowed        float64
	OutstandingToReceive float64
	OutstandingToPay     float64
	ActiveLoans          int
	ClosedLoans          int
}