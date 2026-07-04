package service

import (
	"finance-tracker/backend/entities"
	"finance-tracker/backend/postgres"
)

type LoanSummary struct {
	Loan          entities.Loan
	PrincipalPaid float64
	InterestPaid  float64
	Outstanding   float64
	Status        string
}

func CalculateOutstanding(principal float64, principalPaid float64) float64 {
	return principal - principalPaid
}
func CalculatePrincipalPaid(loan entities.Loan, payments []entities.Payment) float64 {

	var total float64
	currentOutstanding := loan.PrincipalAmount

	for _, payment := range payments {

		breakdown := CalculatePaymentBreakdown(currentOutstanding, loan, payment)

		total += breakdown.PrincipalPaid

		currentOutstanding -= breakdown.PrincipalPaid
	}

	return total
}
func CalculateInterestPaid(loan entities.Loan, payments []entities.Payment) float64 {

	var total float64
	currentOutstanding := loan.PrincipalAmount

	for _, payment := range payments {

		breakdown := CalculatePaymentBreakdown(currentOutstanding, loan, payment)

		total += breakdown.InterestPaid

		currentOutstanding -= breakdown.PrincipalPaid
	}

	return total
}
func GenerateLoanSummary(loan entities.Loan, payments []entities.Payment) LoanSummary {

	principalPaid := CalculatePrincipalPaid(loan, payments)
	interestPaid := CalculateInterestPaid(loan, payments)
	outstanding := CalculateOutstanding(loan.PrincipalAmount, principalPaid)
	status := CalculateLoanStatus(outstanding)

	return LoanSummary{
		Loan:          loan,
		PrincipalPaid: principalPaid,
		InterestPaid:  interestPaid,
		Outstanding:   outstanding,
		Status:        status,
	}
}

type DashboardSummary struct {
	TotalLent            float64
	TotalBorrowed        float64
	OutstandingToReceive float64
	OutstandingToPay     float64
	InterestEarned       float64
	InterestPaid         float64
	NetInterest          float64
	NetAssets            float64
	NetWorth             float64
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
			dashboard.InterestEarned += summary.InterestPaid
		} else {
			dashboard.TotalBorrowed += loan.PrincipalAmount
			dashboard.OutstandingToPay += summary.Outstanding
			dashboard.InterestPaid += summary.InterestPaid
		}

		if summary.Status == "ACTIVE" {
			dashboard.ActiveLoans++
		} else {
			dashboard.ClosedLoans++
		}
	}

	dashboard.NetInterest =
		dashboard.InterestEarned - dashboard.InterestPaid

	dashboard.NetAssets =
		dashboard.OutstandingToReceive - dashboard.OutstandingToPay

	dashboard.NetWorth =
		dashboard.NetAssets + dashboard.NetInterest

	return dashboard, nil
}

type LedgerEntry struct {
	PaymentDate   string
	PaymentAmount float64
	PrincipalPaid float64
	InterestPaid  float64
	Outstanding   float64
	Description   string
}

func GenerateLoanLedger(loan entities.Loan, payments []entities.Payment) []LedgerEntry {

	var ledger []LedgerEntry

	outstanding := loan.PrincipalAmount
	ledger = append(ledger, LedgerEntry{
		PaymentDate:   loan.LoanDate.Format("2006-01-02"),
		PaymentAmount: loan.PrincipalAmount,
		PrincipalPaid: 0,
		InterestPaid:  0,
		Outstanding:   loan.PrincipalAmount,
		Description:   "Loan Created",
	})

	for _, payment := range payments {

		breakdown := CalculatePaymentBreakdown(outstanding, loan, payment)

		outstanding -= breakdown.PrincipalPaid

		entry := LedgerEntry{
			PaymentDate:   payment.PaymentDate.Format("2006-01-02"),
			PaymentAmount: payment.PaymentAmount,
			PrincipalPaid: breakdown.PrincipalPaid,
			InterestPaid:  breakdown.InterestPaid,
			Outstanding:   outstanding,
			Description:   "Payment",
		}

		ledger = append(ledger, entry)
	}

	return ledger
}

func CalculateLoanStatus(outstanding float64) string {

	if outstanding <= 0 {
		return "CLOSED"
	}

	return "ACTIVE"
}

type ContactSummary struct {
	ContactID      int
	TotalLent      float64
	TotalBorrowed  float64
	Outstanding    float64
	ActiveLoans    int
	ClosedLoans    int
	InterestEarned float64
	InterestPaid   float64

	Loans []LoanSummary
}

func GenerateContactSummary(contactID int) (ContactSummary, error) {

	loans, err := postgres.GetLoansByContactID(contactID)
	if err != nil {
		return ContactSummary{}, err
	}

	summary := ContactSummary{
		ContactID: contactID,
	}

	for _, loan := range loans {

		payments, err := postgres.GetPaymentsByLoanID(loan.ID)
		if err != nil {
			return ContactSummary{}, err
		}

		loanSummary := GenerateLoanSummary(loan, payments)

		summary.Loans = append(summary.Loans, loanSummary)

		if loan.LoanType == "LEND" {
			summary.TotalLent += loan.PrincipalAmount
			summary.InterestEarned += loanSummary.InterestPaid
		} else {
			summary.TotalBorrowed += loan.PrincipalAmount
			summary.InterestPaid += loanSummary.InterestPaid
		}

		summary.Outstanding += loanSummary.Outstanding

		if loanSummary.Status == "ACTIVE" {
			summary.ActiveLoans++
		} else {
			summary.ClosedLoans++
		}
	}

	return summary, nil
}

type MonthlyCashFlow struct {
	Year              int
	Month             int
	TotalReceived     float64
	TotalPaid         float64
	PrincipalReceived float64
	InterestReceived  float64
	PrincipalPaid     float64
	InterestPaid      float64
	NetCashFlow       float64
}

func GenerateMonthlyCashFlow(year int, month int) (MonthlyCashFlow, error) {

	loans, err := postgres.GetAllLoans()
	if err != nil {
		return MonthlyCashFlow{}, err
	}

	cashFlow := MonthlyCashFlow{
		Year:  year,
		Month: month,
	}

	for _, loan := range loans {

		payments, err := postgres.GetPaymentsByLoanID(loan.ID)
		if err != nil {
			return MonthlyCashFlow{}, err
		}

		currentOutstanding := loan.PrincipalAmount

		for _, payment := range payments {

			if payment.PaymentDate.Year() != year ||
				int(payment.PaymentDate.Month()) != month {
				continue
			}

			breakdown := CalculatePaymentBreakdown(
				currentOutstanding,
				loan,
				payment,
			)

			if loan.LoanType == "LEND" {

				cashFlow.TotalReceived += payment.PaymentAmount
				cashFlow.PrincipalReceived += breakdown.PrincipalPaid
				cashFlow.InterestReceived += breakdown.InterestPaid

			} else {

				cashFlow.TotalPaid += payment.PaymentAmount
				cashFlow.PrincipalPaid += breakdown.PrincipalPaid
				cashFlow.InterestPaid += breakdown.InterestPaid

			}

			currentOutstanding -= breakdown.PrincipalPaid
		}
	}

	cashFlow.NetCashFlow =
		cashFlow.TotalReceived - cashFlow.TotalPaid

	return cashFlow, nil
}
