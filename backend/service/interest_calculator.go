package service

import "finance-tracker/backend/entities"

type PaymentBreakdown struct {
	PrincipalPaid float64
	InterestPaid  float64
	Outstanding   float64
	IsLoanClosed  bool
}

func CalculatePaymentBreakdown(
	currentOutstanding float64,
	loan entities.Loan,
	payment entities.Payment,
) PaymentBreakdown {

	switch loan.InterestType {

	case "EMI":
		return CalculateEMIPayment(currentOutstanding, loan, payment)

	case "SIMPLE_INTEREST":
		return CalculateSimpleInterest(currentOutstanding, loan, payment)

	case "INTEREST_ONLY":
		return CalculateInterestOnly(currentOutstanding, loan, payment)

	default:
		return PaymentBreakdown{}
	}
}
func CalculateEMIPayment(
	currentOutstanding float64,
	loan entities.Loan,
	payment entities.Payment,
) PaymentBreakdown {

	monthlyInterest := (currentOutstanding * loan.InterestRate) / 100 / 12

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

func CalculateSimpleInterest(currentOutstanding float64, loan entities.Loan, payment entities.Payment) PaymentBreakdown {

	monthlyInterest := (currentOutstanding * loan.InterestRate) / 100 / 12

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
func CalculateInterestOnly(
	currentOutstanding float64,
	loan entities.Loan,
	payment entities.Payment,
) PaymentBreakdown {

	monthlyInterest := (currentOutstanding * loan.InterestRate) / 100 / 12

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
