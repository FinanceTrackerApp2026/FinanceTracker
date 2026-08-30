package service

import (
	"errors"
	"fmt"
	"math"
	"time"

	"finance-tracker/backend/entities"

	"github.com/shopspring/decimal"
)

var supportedPaymentTypes = map[string]bool{
	"PRINCIPAL": true, "INTEREST": true, "BOTH": true,
	"EMI": true, "PARTIAL": true, "LUMP_SUM": true, "PREPAYMENT": true,
}

func IsSupportedPaymentType(paymentType string) bool { return supportedPaymentTypes[paymentType] }

type PaymentBreakdown struct {
	PrincipalPaid       float64
	InterestPaid        float64
	Outstanding         float64
	OutstandingInterest float64
	IsLoanClosed        bool
}

type LoanFinancialState struct {
	PrincipalAmount      float64
	PrincipalPaid        float64
	OutstandingPrincipal float64
	InterestAccrued      float64
	InterestPaid         float64
	OutstandingInterest  float64
	TotalPaid            float64
	TotalOutstanding     float64
	ExpectedTotalAmount  float64
	MonthlyPayment       float64
	NextDueDate          string
	PaymentsCompleted    int
	PaymentsRemaining    int
	Status               string
}

func money(value float64) float64                { return decimal.NewFromFloat(value).Round(2).InexactFloat64() }
func decimalMoney(value float64) decimal.Decimal { return decimal.NewFromFloat(value).Round(2) }

func periodsPerYear(frequency string) int {
	switch frequency {
	case "DAILY":
		return 365
	case "WEEKLY":
		return 52
	case "QUARTERLY":
		return 4
	case "HALF_YEARLY":
		return 2
	case "YEARLY", "YEAR":
		return 1
	default:
		return 12
	}
}

func annualInterest(principal, rate float64, days int) float64 {
	if principal <= 0 || rate <= 0 || days <= 0 {
		return 0
	}
	return money(decimalMoney(principal).Mul(decimalMoney(rate)).Mul(decimal.NewFromInt(int64(days))).Div(decimal.NewFromInt(365)).Div(decimal.NewFromInt(100)).InexactFloat64())
}

func periodicInterest(principal float64, loan entities.Loan) float64 {
	if principal <= 0 || loan.InterestRate <= 0 {
		return 0
	}
	return money(principal * loan.InterestRate / 100 / float64(periodsPerYear(loan.InterestFrequency)))
}

func periodicInterestForDays(principal float64, loan entities.Loan, days int) float64 {
	if days <= 0 {
		return 0
	}
	periodDays := 365.0 / float64(periodsPerYear(loan.InterestFrequency))
	periods := int(math.Round(float64(days) / periodDays))
	if periods < 1 {
		periods = 1
	}
	return money(periodicInterest(principal, loan) * float64(periods))
}

func compoundInterest(principal, rate float64, frequency string, days int) float64 {
	if principal <= 0 || rate <= 0 || days <= 0 {
		return 0
	}
	n := float64(periodsPerYear(frequency))
	amount := principal * math.Pow(1+(rate/100)/n, n*float64(days)/365)
	return money(amount - principal)
}

func monthlyEMI(principal, annualRate float64, tenure int, unit string) float64 {
	months := tenure
	if unit == "YEAR" {
		months *= 12
	}
	if principal <= 0 || months <= 0 {
		return 0
	}
	rate := decimal.NewFromFloat(annualRate).Div(decimal.NewFromInt(1200)).InexactFloat64()
	if rate == 0 {
		return money(principal / float64(months))
	}
	factor := math.Pow(1+rate, float64(months))
	return money(principal * rate * factor / (factor - 1))
}

func paymentKind(payment entities.Payment, loan entities.Loan) string {
	if payment.PaymentType != "" {
		return payment.PaymentType
	}
	if loan.InterestType == "INTEREST_ONLY" {
		return "INTEREST"
	}
	return "BOTH"
}

func calculateInterest(currentPrincipal float64, loan entities.Loan, from, to time.Time) float64 {
	days := daysBetween(from, to)
	if days == 0 {
		return 0
	}
	switch loan.InterestType {
	case "COMPOUND":
		return compoundInterest(currentPrincipal, loan.InterestRate, loan.InterestFrequency, days)
	case "EMI":
		return money(currentPrincipal * loan.InterestRate / 1200)
	case "INTEREST_ONLY":
		return periodicInterestForDays(currentPrincipal, loan, days)
	default:
		return annualInterest(loan.PrincipalAmount, loan.InterestRate, days)
	}
}

func calculatePayment(currentPrincipal, currentInterest float64, loan entities.Loan, payment entities.Payment) PaymentBreakdown {
	principal := decimalMoney(max(currentPrincipal, 0))
	interestDue := decimalMoney(max(currentInterest, 0))
	amount := decimalMoney(max(payment.PaymentAmount, 0))
	switch paymentKind(payment, loan) {
	case "INTEREST":
		paid := decimal.Min(amount, interestDue)
		return PaymentBreakdown{InterestPaid: paid.InexactFloat64(), Outstanding: principal.InexactFloat64(), OutstandingInterest: interestDue.Sub(paid).InexactFloat64()}
	case "PRINCIPAL":
		paid := decimal.Min(amount, principal)
		return PaymentBreakdown{PrincipalPaid: paid.InexactFloat64(), Outstanding: principal.Sub(paid).InexactFloat64(), OutstandingInterest: interestDue.InexactFloat64(), IsLoanClosed: principal.Sub(paid).IsZero() && interestDue.IsZero()}
	default:
		interestPaid := decimal.Min(amount, interestDue)
		principalPaid := decimal.Min(amount.Sub(interestPaid), principal)
		return PaymentBreakdown{PrincipalPaid: principalPaid.InexactFloat64(), InterestPaid: interestPaid.InexactFloat64(), Outstanding: principal.Sub(principalPaid).InexactFloat64(), OutstandingInterest: interestDue.Sub(interestPaid).InexactFloat64(), IsLoanClosed: principal.Sub(principalPaid).IsZero() && interestDue.Sub(interestPaid).IsZero()}
	}
}

func CalculatePaymentBreakdown(currentOutstanding float64, loan entities.Loan, payment entities.Payment) PaymentBreakdown {
	return calculatePayment(currentOutstanding, periodicInterest(currentOutstanding, loan), loan, payment)
}

func CalculateEMIPayment(currentOutstanding float64, loan entities.Loan, payment entities.Payment) PaymentBreakdown {
	interest := decimalMoney(currentOutstanding).Mul(decimal.NewFromFloat(loan.InterestRate)).Div(decimal.NewFromInt(1200))
	return calculatePayment(currentOutstanding, interest.InexactFloat64(), loan, entities.Payment{PaymentAmount: payment.PaymentAmount, PaymentType: "BOTH"})
}

func CalculateSimpleInterest(currentOutstanding float64, loan entities.Loan, payment entities.Payment) PaymentBreakdown {
	return calculatePayment(currentOutstanding, periodicInterest(currentOutstanding, loan), loan, payment)
}

func CalculateInterestOnly(currentOutstanding float64, loan entities.Loan, payment entities.Payment) PaymentBreakdown {
	return calculatePayment(currentOutstanding, periodicInterest(currentOutstanding, loan), loan, entities.Payment{PaymentAmount: payment.PaymentAmount, PaymentType: "INTEREST"})
}

func MaximumPaymentAmount(currentOutstanding float64, loan entities.Loan, paymentType string) float64 {
	interest := periodicInterest(currentOutstanding, loan)
	switch paymentType {
	case "PRINCIPAL":
		return money(currentOutstanding)
	case "INTEREST":
		return interest
	default:
		return money(currentOutstanding + interest)
	}
}

func ValidatePaymentAmount(currentOutstanding float64, loan entities.Loan, payment entities.Payment) error {
	if payment.PaymentAmount <= 0 {
		return errors.New("payment amount must be greater than zero")
	}
	if !IsSupportedPaymentType(payment.PaymentType) {
		return fmt.Errorf("invalid payment type: %s", payment.PaymentType)
	}
	maximum := MaximumPaymentAmount(currentOutstanding, loan, payment.PaymentType)
	if payment.PaymentAmount > maximum+0.01 {
		return fmt.Errorf("payment amount exceeds the allowed outstanding amount of %.2f", maximum)
	}
	return nil
}

func ValidatePaymentAgainstState(state LoanFinancialState, payment entities.Payment) error {
	if payment.PaymentAmount <= 0 {
		return errors.New("payment amount must be greater than zero")
	}
	if !IsSupportedPaymentType(payment.PaymentType) {
		return fmt.Errorf("invalid payment type: %s", payment.PaymentType)
	}
	maximum := state.TotalOutstanding
	switch payment.PaymentType {
	case "PRINCIPAL":
		maximum = state.OutstandingPrincipal
	case "INTEREST":
		maximum = state.OutstandingInterest
	}
	if payment.PaymentAmount > maximum+0.01 {
		return fmt.Errorf("payment amount exceeds the allowed outstanding amount of %.2f", money(maximum))
	}
	return nil
}

func daysBetween(from, to time.Time) int {
	if !to.After(from) {
		return 0
	}
	return int(to.Sub(from).Hours() / 24)
}
