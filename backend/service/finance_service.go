package service

import (
	"sort"
	"time"

	"finance-tracker/backend/entities"
	"finance-tracker/backend/postgres"
)

type LoanSummary struct {
	Loan                entities.Loan
	PrincipalPaid       float64
	InterestPaid        float64
	Outstanding         float64
	Status              string
	InterestAccrued     float64
	OutstandingInterest float64
	TotalPaid           float64
	TotalOutstanding    float64
	ExpectedTotalAmount float64
	MonthlyPayment      float64
	NextDueDate         string
	PaymentsCompleted   int
	PaymentsRemaining   int
}

func CalculateOutstanding(principal float64, principalPaid float64) float64 {
	return max(principal-principalPaid, 0)
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
	state := CalculateLoanFinancialState(loan, payments, time.Now())

	return LoanSummary{
		Loan:                loan,
		PrincipalPaid:       state.PrincipalPaid,
		InterestPaid:        state.InterestPaid,
		Outstanding:         state.OutstandingPrincipal,
		Status:              state.Status,
		InterestAccrued:     state.InterestAccrued,
		OutstandingInterest: state.OutstandingInterest,
		TotalPaid:           state.TotalPaid,
		TotalOutstanding:    state.TotalOutstanding,
		ExpectedTotalAmount: state.ExpectedTotalAmount,
		MonthlyPayment:      state.MonthlyPayment,
		NextDueDate:         state.NextDueDate,
		PaymentsCompleted:   state.PaymentsCompleted,
		PaymentsRemaining:   state.PaymentsRemaining,
	}
}

func CalculateLoanFinancialState(loan entities.Loan, payments []entities.Payment, asOf time.Time) LoanFinancialState {
	ordered := append([]entities.Payment(nil), payments...)
	sort.SliceStable(ordered, func(left, right int) bool {
		if ordered[left].PaymentDate.Equal(ordered[right].PaymentDate) {
			return ordered[left].ID < ordered[right].ID
		}
		return ordered[left].PaymentDate.Before(ordered[right].PaymentDate)
	})

	principal := money(loan.PrincipalAmount)
	interestDue := 0.0
	interestAccrued := 0.0
	principalPaid := 0.0
	interestPaid := 0.0
	totalPaid := 0.0
	lastDate := loan.LoanDate
	for _, payment := range ordered {
		if payment.PaymentDate.Before(lastDate) {
			lastDate = payment.PaymentDate
		}
		accrualStart := lastDate
		if payment.PaymentDate.After(accrualStart) {
			var accrued float64
			switch loan.InterestType {
			case "COMPOUND":
				accrued = compoundInterest(principal, loan.InterestRate, loan.InterestFrequency, int(payment.PaymentDate.Sub(accrualStart).Hours()/24))
			case "EMI":
				accrued = money(principal * loan.InterestRate / 1200)
			case "INTEREST_ONLY":
				accrued = periodicInterestForDays(principal, loan, daysBetween(accrualStart, payment.PaymentDate))
			default:
				accrued = annualInterest(loan.PrincipalAmount, loan.InterestRate, int(payment.PaymentDate.Sub(accrualStart).Hours()/24))
			}
			interestDue = money(interestDue + accrued)
			interestAccrued = money(interestAccrued + accrued)
		}

		breakdown := calculatePayment(principal, interestDue, loan, payment)
		principal = money(principal - breakdown.PrincipalPaid)
		interestDue = money(interestDue - breakdown.InterestPaid)
		principalPaid = money(principalPaid + breakdown.PrincipalPaid)
		interestPaid = money(interestPaid + breakdown.InterestPaid)
		totalPaid = money(totalPaid + payment.PaymentAmount)
		lastDate = payment.PaymentDate
	}

	if asOf.After(lastDate) {
		var accrued float64
		switch loan.InterestType {
		case "COMPOUND":
			accrued = compoundInterest(principal, loan.InterestRate, loan.InterestFrequency, int(asOf.Sub(lastDate).Hours()/24))
		case "EMI":
			accrued = periodicInterestForDays(principal, loan, daysBetween(lastDate, asOf))
		case "INTEREST_ONLY":
			accrued = periodicInterestForDays(principal, loan, daysBetween(lastDate, asOf))
		default:
			accrued = annualInterest(loan.PrincipalAmount, loan.InterestRate, int(asOf.Sub(lastDate).Hours()/24))
		}
		interestDue = money(interestDue + accrued)
		interestAccrued = money(interestAccrued + accrued)
	}

	monthlyPayment := 0.0
	if loan.InterestType == "EMI" {
		monthlyPayment = monthlyEMI(loan.PrincipalAmount, loan.InterestRate, loan.LoanTenure, loan.TenureUnit)
	} else if loan.InterestType == "INTEREST_ONLY" {
		monthlyPayment = money(principal * loan.InterestRate / 1200)
	}
	remaining := 0
	if loan.LoanTenure > 0 {
		remaining = max(loan.LoanTenure-paymentCount(ordered), 0)
		if loan.TenureUnit == "YEAR" {
			remaining = max(loan.LoanTenure*12-paymentCount(ordered), 0)
		}
	}
	status := CalculateLoanStatusWithInterest(principal, interestDue)
	nextDue := ""
	if status == "ACTIVE" && loan.DueDay > 0 && (loan.InterestType == "EMI" || loan.InterestType == "INTEREST_ONLY") {
		nextDue = nextDueDate(lastDate, loan.DueDay).Format("2006-01-02")
	}
	expectedTotal := loan.PrincipalAmount + interestAccrued
	if loan.InterestType == "EMI" && loan.LoanTenure > 0 {
		months := loan.LoanTenure
		if loan.TenureUnit == "YEAR" {
			months *= 12
		}
		expectedTotal = monthlyPayment * float64(months)
	}
	return LoanFinancialState{
		PrincipalAmount: money(loan.PrincipalAmount), PrincipalPaid: principalPaid,
		OutstandingPrincipal: principal, InterestAccrued: interestAccrued,
		InterestPaid: interestPaid, OutstandingInterest: interestDue,
		TotalPaid: totalPaid, TotalOutstanding: money(principal + interestDue),
		ExpectedTotalAmount: money(expectedTotal), MonthlyPayment: monthlyPayment,
		NextDueDate: nextDue, PaymentsCompleted: paymentCount(ordered), PaymentsRemaining: remaining, Status: status,
	}
}

func nextDueDate(lastPayment time.Time, dueDay int) time.Time {
	next := time.Date(lastPayment.Year(), lastPayment.Month()+1, 1, 0, 0, 0, 0, lastPayment.Location())
	lastDay := time.Date(next.Year(), next.Month()+1, 0, 0, 0, 0, 0, next.Location()).Day()
	if dueDay > lastDay {
		dueDay = lastDay
	}
	return time.Date(next.Year(), next.Month(), dueDay, 0, 0, 0, 0, next.Location())
}

func paymentCount(payments []entities.Payment) int { return len(payments) }

func CalculateLoanStatusWithInterest(outstandingPrincipal, outstandingInterest float64) string {
	if outstandingPrincipal <= 0.009 && outstandingInterest <= 0.009 {
		return "CLOSED"
	}
	return "ACTIVE"
}

func RefreshLoanFinancials(loanID int) error {
	loan, err := postgres.GetLoanByID(loanID)
	if err != nil {
		return err
	}

	payments, err := postgres.GetPaymentsByLoanID(loanID)
	if err != nil {
		return err
	}

	summary := GenerateLoanSummary(loan, payments)
	return postgres.UpdateLoanFinancials(loanID, summary.Outstanding, summary.Status)
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
			dashboard.OutstandingToReceive += summary.TotalOutstanding
			dashboard.InterestEarned += summary.InterestPaid
			dashboard.NetAssets += summary.Outstanding
		} else {
			dashboard.TotalBorrowed += loan.PrincipalAmount
			dashboard.OutstandingToPay += summary.TotalOutstanding
			dashboard.InterestPaid += summary.InterestPaid
			dashboard.NetAssets -= summary.Outstanding
		}

		if summary.Status == "ACTIVE" {
			dashboard.ActiveLoans++
		} else {
			dashboard.ClosedLoans++
		}
	}

	dashboard.NetInterest =
		dashboard.InterestEarned - dashboard.InterestPaid

	dashboard.NetWorth =
		dashboard.NetAssets + dashboard.NetInterest

	return dashboard, nil
}

func GenerateDashboardSummaryForUser(userID int) (*DashboardSummary, error) {
	loans, err := postgres.GetAllLoansForUser(userID)
	if err != nil {
		return nil, err
	}
	dashboard := &DashboardSummary{}
	for _, loan := range loans {
		payments, err := postgres.GetPaymentsByLoanIDForUser(loan.ID, userID)
		if err != nil {
			return nil, err
		}
		summary := GenerateLoanSummary(loan, payments)
		if loan.LoanType == "LEND" {
			dashboard.TotalLent += loan.PrincipalAmount
			dashboard.OutstandingToReceive += summary.TotalOutstanding
			dashboard.InterestEarned += summary.InterestPaid
			dashboard.NetAssets += summary.Outstanding
		} else {
			dashboard.TotalBorrowed += loan.PrincipalAmount
			dashboard.OutstandingToPay += summary.TotalOutstanding
			dashboard.InterestPaid += summary.InterestPaid
			dashboard.NetAssets -= summary.Outstanding
		}
		if summary.Status == "ACTIVE" {
			dashboard.ActiveLoans++
		} else {
			dashboard.ClosedLoans++
		}
	}
	dashboard.NetInterest = dashboard.InterestEarned - dashboard.InterestPaid
	dashboard.NetWorth = dashboard.NetAssets + dashboard.NetInterest
	return dashboard, nil
}

type LedgerEntry struct {
	PaymentDate         string
	PaymentAmount       float64
	PrincipalPaid       float64
	InterestPaid        float64
	Outstanding         float64
	OutstandingInterest float64
	Description         string
}

func GenerateLoanLedger(loan entities.Loan, payments []entities.Payment) []LedgerEntry {

	var ledger []LedgerEntry

	ordered := append([]entities.Payment(nil), payments...)
	sort.SliceStable(ordered, func(left, right int) bool {
		if ordered[left].PaymentDate.Equal(ordered[right].PaymentDate) {
			return ordered[left].ID < ordered[right].ID
		}
		return ordered[left].PaymentDate.Before(ordered[right].PaymentDate)
	})
	principal := money(loan.PrincipalAmount)
	interestDue := 0.0
	lastDate := loan.LoanDate
	ledger = append(ledger, LedgerEntry{
		PaymentDate:         loan.LoanDate.Format("2006-01-02"),
		PaymentAmount:       loan.PrincipalAmount,
		PrincipalPaid:       0,
		InterestPaid:        0,
		Outstanding:         principal,
		OutstandingInterest: 0,
		Description:         "Loan Created",
	})

	for _, payment := range ordered {

		accrued := calculateInterest(principal, loan, lastDate, payment.PaymentDate)
		interestDue = money(interestDue + accrued)
		breakdown := calculatePayment(principal, interestDue, loan, payment)
		principal = money(principal - breakdown.PrincipalPaid)
		interestDue = money(interestDue - breakdown.InterestPaid)

		entry := LedgerEntry{
			PaymentDate:         payment.PaymentDate.Format("2006-01-02"),
			PaymentAmount:       payment.PaymentAmount,
			PrincipalPaid:       breakdown.PrincipalPaid,
			InterestPaid:        breakdown.InterestPaid,
			Outstanding:         principal,
			OutstandingInterest: interestDue,
			Description:         "Payment",
		}

		ledger = append(ledger, entry)
		lastDate = payment.PaymentDate
	}

	if now := time.Now(); now.After(lastDate) && principal > 0 {
		accrued := calculateInterest(principal, loan, lastDate, now)
		if accrued > 0 {
			interestDue = money(interestDue + accrued)
			ledger = append(ledger, LedgerEntry{
				PaymentDate:         now.Format("2006-01-02"),
				PaymentAmount:       0,
				Outstanding:         principal,
				OutstandingInterest: interestDue,
				Description:         "Interest Accrued",
			})
		}
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
	ContactID           int
	TotalLent           float64
	TotalBorrowed       float64
	Outstanding         float64
	ActiveLoans         int
	ClosedLoans         int
	InterestEarned      float64
	InterestPaid        float64
	TotalPaid           float64
	TotalOutstanding    float64
	OutstandingInterest float64

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

		summary.Outstanding += loanSummary.TotalOutstanding
		summary.TotalPaid += loanSummary.TotalPaid
		summary.TotalOutstanding += loanSummary.TotalOutstanding
		summary.OutstandingInterest += loanSummary.OutstandingInterest

		if loanSummary.Status == "ACTIVE" {
			summary.ActiveLoans++
		} else {
			summary.ClosedLoans++
		}
	}

	return summary, nil
}

func GenerateContactSummaryForUser(contactID, userID int) (ContactSummary, error) {
	loans, err := postgres.GetLoansByContactIDForUser(contactID, userID)
	if err != nil {
		return ContactSummary{}, err
	}
	summary := ContactSummary{ContactID: contactID}
	for _, loan := range loans {
		payments, err := postgres.GetPaymentsByLoanIDForUser(loan.ID, userID)
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
		summary.Outstanding += loanSummary.TotalOutstanding
		summary.TotalPaid += loanSummary.TotalPaid
		summary.TotalOutstanding += loanSummary.TotalOutstanding
		summary.OutstandingInterest += loanSummary.OutstandingInterest
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

		ledger := GenerateLoanLedger(loan, payments)
		for _, entry := range ledger {
			entryDate, parseErr := time.Parse("2006-01-02", entry.PaymentDate)
			if parseErr != nil || entry.PaymentAmount == 0 || entryDate.Year() != year || int(entryDate.Month()) != month {
				continue
			}

			if loan.LoanType == "LEND" {

				cashFlow.TotalReceived += entry.PaymentAmount
				cashFlow.PrincipalReceived += entry.PrincipalPaid
				cashFlow.InterestReceived += entry.InterestPaid

			} else {

				cashFlow.TotalPaid += entry.PaymentAmount
				cashFlow.PrincipalPaid += entry.PrincipalPaid
				cashFlow.InterestPaid += entry.InterestPaid

			}
		}
	}

	cashFlow.NetCashFlow =
		cashFlow.TotalReceived - cashFlow.TotalPaid
	cashFlow.TotalReceived = money(cashFlow.TotalReceived)
	cashFlow.TotalPaid = money(cashFlow.TotalPaid)
	cashFlow.PrincipalReceived = money(cashFlow.PrincipalReceived)
	cashFlow.InterestReceived = money(cashFlow.InterestReceived)
	cashFlow.PrincipalPaid = money(cashFlow.PrincipalPaid)
	cashFlow.InterestPaid = money(cashFlow.InterestPaid)
	cashFlow.NetCashFlow = money(cashFlow.NetCashFlow)

	return cashFlow, nil
}

func GenerateMonthlyCashFlowForUser(year, month, userID int) (MonthlyCashFlow, error) {
	loans, err := postgres.GetAllLoansForUser(userID)
	if err != nil {
		return MonthlyCashFlow{}, err
	}
	cashFlow := MonthlyCashFlow{Year: year, Month: month}
	for _, loan := range loans {
		payments, err := postgres.GetPaymentsByLoanIDForUser(loan.ID, userID)
		if err != nil {
			return MonthlyCashFlow{}, err
		}
		for _, entry := range GenerateLoanLedger(loan, payments) {
			entryDate, parseErr := time.Parse("2006-01-02", entry.PaymentDate)
			if parseErr != nil || entry.PaymentAmount == 0 || entryDate.Year() != year || int(entryDate.Month()) != month {
				continue
			}
			if loan.LoanType == "LEND" {
				cashFlow.TotalReceived += entry.PaymentAmount
				cashFlow.PrincipalReceived += entry.PrincipalPaid
				cashFlow.InterestReceived += entry.InterestPaid
			} else {
				cashFlow.TotalPaid += entry.PaymentAmount
				cashFlow.PrincipalPaid += entry.PrincipalPaid
				cashFlow.InterestPaid += entry.InterestPaid
			}
		}
	}
	cashFlow.NetCashFlow = cashFlow.TotalReceived - cashFlow.TotalPaid
	return cashFlow, nil
}
