package service

import (
	"testing"
	"time"

	"finance-tracker/backend/entities"
)

func testLoan(interestType string, frequency string) entities.Loan {
	return entities.Loan{
		PrincipalAmount:   1000,
		InterestType:      interestType,
		InterestRate:      12,
		InterestFrequency: frequency,
		LoanDate:          time.Date(2026, time.January, 1, 0, 0, 0, 0, time.UTC),
	}
}

func TestCalculatePaymentBreakdownCapsPrincipal(t *testing.T) {
	breakdown := CalculatePaymentBreakdown(
		1000,
		testLoan("SIMPLE_INTEREST", "MONTHLY"),
		entities.Payment{PaymentAmount: 2000},
	)

	if breakdown.PrincipalPaid != 1000 {
		t.Fatalf("principal paid = %v, want 1000", breakdown.PrincipalPaid)
	}
	if breakdown.Outstanding != 0 || !breakdown.IsLoanClosed {
		t.Fatalf("closing result = outstanding %v, closed %v", breakdown.Outstanding, breakdown.IsLoanClosed)
	}
}

func TestCalculatePaymentBreakdownInterestOnlyDoesNotReducePrincipal(t *testing.T) {
	breakdown := CalculatePaymentBreakdown(
		1000,
		testLoan("INTEREST_ONLY", "MONTHLY"),
		entities.Payment{PaymentAmount: 100},
	)

	if breakdown.InterestPaid != 10 {
		t.Fatalf("interest paid = %v, want 10", breakdown.InterestPaid)
	}
	if breakdown.PrincipalPaid != 0 || breakdown.Outstanding != 1000 {
		t.Fatalf("principal result = paid %v, outstanding %v", breakdown.PrincipalPaid, breakdown.Outstanding)
	}
}

func TestCalculatePaymentBreakdownUsesQuarterlyFrequency(t *testing.T) {
	breakdown := CalculatePaymentBreakdown(
		1000,
		testLoan("SIMPLE_INTEREST", "QUARTERLY"),
		entities.Payment{PaymentAmount: 100},
	)

	if breakdown.InterestPaid != 30 {
		t.Fatalf("interest paid = %v, want 30", breakdown.InterestPaid)
	}
	if breakdown.PrincipalPaid != 70 {
		t.Fatalf("principal paid = %v, want 70", breakdown.PrincipalPaid)
	}
}

func TestCalculatePaymentBreakdownHonorsExplicitPaymentTypes(t *testing.T) {
	loan := testLoan("SIMPLE_INTEREST", "MONTHLY")

	principalOnly := CalculatePaymentBreakdown(
		1000,
		loan,
		entities.Payment{PaymentAmount: 100, PaymentType: "PRINCIPAL"},
	)
	if principalOnly.PrincipalPaid != 100 || principalOnly.InterestPaid != 0 {
		t.Fatalf("principal-only result = principal %v, interest %v", principalOnly.PrincipalPaid, principalOnly.InterestPaid)
	}

	interestOnly := CalculatePaymentBreakdown(
		1000,
		loan,
		entities.Payment{PaymentAmount: 10, PaymentType: "INTEREST"},
	)
	if interestOnly.PrincipalPaid != 0 || interestOnly.InterestPaid != 10 {
		t.Fatalf("interest-only result = principal %v, interest %v", interestOnly.PrincipalPaid, interestOnly.InterestPaid)
	}
}

func TestValidatePaymentAmountRejectsOverLimitPayment(t *testing.T) {
	err := ValidatePaymentAmount(
		1000,
		testLoan("SIMPLE_INTEREST", "MONTHLY"),
		entities.Payment{PaymentAmount: 1001, PaymentType: "PRINCIPAL"},
	)
	if err == nil {
		t.Fatal("expected over-limit payment to be rejected")
	}
}

func TestSimpleInterestUsesOriginalPrincipalAndElapsedYear(t *testing.T) {
	loan := testLoan("SIMPLE_INTEREST", "MONTHLY")
	state := CalculateLoanFinancialState(loan, nil, loan.LoanDate.AddDate(1, 0, 0))

	if state.InterestAccrued != 120 {
		t.Fatalf("interest accrued = %.2f, want 120", state.InterestAccrued)
	}
	if state.TotalOutstanding != 1120 {
		t.Fatalf("total outstanding = %.2f, want 1120", state.TotalOutstanding)
	}
}

func TestCompoundInterestFrequencies(t *testing.T) {
	want := map[string]float64{
		"MONTHLY":   126.83,
		"QUARTERLY": 125.51,
		"YEARLY":    120,
	}
	for frequency, expected := range want {
		loan := testLoan("COMPOUND", frequency)
		state := CalculateLoanFinancialState(loan, nil, loan.LoanDate.AddDate(1, 0, 0))
		if state.InterestAccrued != expected {
			t.Errorf("%s interest = %.2f, want %.2f", frequency, state.InterestAccrued, expected)
		}
	}
}

func TestEMIAndInterestOnly(t *testing.T) {
	emiLoan := testLoan("EMI", "MONTHLY")
	emiLoan.LoanTenure = 12
	emiLoan.TenureUnit = "MONTH"
	emiState := CalculateLoanFinancialState(emiLoan, nil, emiLoan.LoanDate)
	if emiState.MonthlyPayment != 88.85 {
		t.Fatalf("EMI = %.2f, want 88.85", emiState.MonthlyPayment)
	}

	interestLoan := testLoan("INTEREST_ONLY", "MONTHLY")
	interestState := CalculateLoanFinancialState(interestLoan, []entities.Payment{{
		PaymentDate: interestLoan.LoanDate.AddDate(0, 1, 0), PaymentAmount: 10, PaymentType: "INTEREST",
	}}, interestLoan.LoanDate.AddDate(0, 1, 0))
	if interestState.OutstandingPrincipal != 1000 {
		t.Fatalf("interest-only principal = %.2f, want 1000", interestState.OutstandingPrincipal)
	}
	if interestState.InterestPaid != 10 {
		t.Fatalf("interest-only paid = %.2f, want 10", interestState.InterestPaid)
	}
}

func TestPaymentReplaySupportsMultiplePaymentsAndSettlement(t *testing.T) {
	loan := testLoan("SIMPLE_INTEREST", "MONTHLY")
	payments := []entities.Payment{
		{ID: 1, PaymentDate: loan.LoanDate, PaymentAmount: 100, PaymentType: "PRINCIPAL"},
		{ID: 2, PaymentDate: loan.LoanDate, PaymentAmount: 900, PaymentType: "PRINCIPAL"},
	}
	state := CalculateLoanFinancialState(loan, payments, loan.LoanDate)
	if state.PrincipalPaid != 1000 || state.OutstandingPrincipal != 0 || state.Status != "CLOSED" {
		t.Fatalf("settlement state = principal paid %.2f, outstanding %.2f, status %s", state.PrincipalPaid, state.OutstandingPrincipal, state.Status)
	}
}

func TestInterestOnlyAccruesEveryElapsedMonth(t *testing.T) {
	loan := testLoan("INTEREST_ONLY", "MONTHLY")
	state := CalculateLoanFinancialState(loan, nil, loan.LoanDate.AddDate(0, 3, 0))
	if state.InterestAccrued != 30 {
		t.Fatalf("interest accrued = %.2f, want 30", state.InterestAccrued)
	}
	if state.OutstandingPrincipal != 1000 {
		t.Fatalf("outstanding principal = %.2f, want 1000", state.OutstandingPrincipal)
	}
}

func TestAccruedInterestIsSeparateFromCashInterestPaid(t *testing.T) {
	loan := testLoan("SIMPLE_INTEREST", "MONTHLY")
	paymentDate := loan.LoanDate.AddDate(1, 0, 0)
	state := CalculateLoanFinancialState(loan, []entities.Payment{{
		PaymentDate:   paymentDate,
		PaymentAmount: 50,
		PaymentType:   "INTEREST",
	}}, paymentDate)

	if state.InterestAccrued != 120 {
		t.Fatalf("interest accrued = %.2f, want 120", state.InterestAccrued)
	}
	if state.InterestPaid != 50 || state.OutstandingInterest != 70 {
		t.Fatalf("cash/obligation split = paid %.2f, outstanding %.2f", state.InterestPaid, state.OutstandingInterest)
	}
}
