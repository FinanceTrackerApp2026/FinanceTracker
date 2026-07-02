package service

import "finance-tracker/backend/entities"

type PaymentBreakdown struct {
	PrincipalPaid float64
	InterestPaid  float64
	Outstanding   float64
	IsLoanClosed  bool
}

func CalculatePaymentBreakdown(loan entities.Loan, payment entities.Payment) PaymentBreakdown {

	switch loan.InterestType {

	case "EMI":
		return CalculateEMIPayment(loan, payment)

	case "SIMPLE_INTEREST":
		return CalculateSimpleInterest(loan, payment)

	case "INTEREST_ONLY":
		return CalculateInterestOnly(loan, payment)

	default:
		return PaymentBreakdown{}
	}
}
func CalculateEMIPayment(loan entities.Loan, payment entities.Payment) PaymentBreakdown {

	monthlyInterest := (loan.OutstandingPrincipal * loan.InterestRate) / 100 / 12

	breakdown := PaymentBreakdown{}

	if payment.PaymentAmount >= monthlyInterest {
		breakdown.InterestPaid = monthlyInterest
		breakdown.PrincipalPaid = payment.PaymentAmount - monthlyInterest
	} else {
		breakdown.InterestPaid = payment.PaymentAmount
		breakdown.PrincipalPaid = 0
	}

	return breakdown
}

func CalculateSimpleInterest(loan entities.Loan, payment entities.Payment) PaymentBreakdown {

	interest := (loan.OutstandingPrincipal * loan.InterestRate) / 100 / 12

	breakdown := PaymentBreakdown{}

	if payment.PaymentAmount >= interest {
		breakdown.InterestPaid = interest
		breakdown.PrincipalPaid = payment.PaymentAmount - interest
	} else {
		breakdown.InterestPaid = payment.PaymentAmount
		breakdown.PrincipalPaid = 0
	}

	return breakdown
}

func CalculateInterestOnly(loan entities.Loan, payment entities.Payment) PaymentBreakdown {

	monthlyInterest := (loan.OutstandingPrincipal * loan.InterestRate) / 100 / 12

	breakdown := PaymentBreakdown{}

	if payment.PaymentAmount >= monthlyInterest {
		breakdown.InterestPaid = monthlyInterest
		breakdown.PrincipalPaid = payment.PaymentAmount - monthlyInterest
	} else {
		breakdown.InterestPaid = payment.PaymentAmount
		breakdown.PrincipalPaid = 0
	}

	return breakdown
}
