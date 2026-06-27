package service

import (
	"finance-tracker/backend/entities"
	"finance-tracker/backend/postgres"
)

type LoanSummary struct {
	Loan          entities.Loan
	PrincipalPaid float64
	Outstanding   float64
}

func CalculateOutstanding(
	principal float64,
	principalPaid float64,
) float64 {
	return principal - principalPaid
}

func CalculatePrincipalPaid(payments []entities.Payment) float64 {
	var total float64
	for _, payment := range payments {
		if payment.PaymentType == "PRINCIPAL" {
			total += payment.PaymentAmount
		}
	}
	return total
}
func GenerateLoanSummary(
	loan entities.Loan,
	payments []entities.Payment,
) LoanSummary {

	principalPaid := CalculatePrincipalPaid(payments)

	outstanding := CalculateOutstanding(
		loan.PrincipalAmount,
		principalPaid,
	)

	return LoanSummary{
		Loan:          loan,
		PrincipalPaid: principalPaid,
		Outstanding:   outstanding,
	}
}

type DashboardSummary struct {
	TotalLent            float64
	TotalBorrowed        float64
	OutstandingToReceive float64
	OutstandingToPay     float64
	ActiveLoans          int
	ClosedLoans          int
}

func GenerateDashboardSummary() (*DashboardSummary, error) {
	
	loans, err := postgres.GetAllLoans()
	if err != nil {
		return nil, err
	}
	dashboard := &DashboardSummary{}
	for _, loan := range loans {
		payments, err := postgres.GetPaymentsByLoanID(loan.ID)
		if err != nil {
			return nil, err
		}
		summary := GenerateLoanSummary(loan, payments)
		if loan.LoanType == "LEND" {
			dashboard.TotalLent += loan.PrincipalAmount
			dashboard.OutstandingToReceive += summary.Outstanding
		} else {
			dashboard.TotalBorrowed += loan.PrincipalAmount
			dashboard.OutstandingToPay += summary.Outstanding
		}
		if summary.Outstanding == 0 {
			dashboard.ClosedLoans++
		} else {
			dashboard.ActiveLoans++
		}
	}

	return dashboard, nil
}
