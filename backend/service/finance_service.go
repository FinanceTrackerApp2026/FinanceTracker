package service
import "finance-tracker/backend/entities"


type LoanSummary struct {
	Loan            entities.Loan
	PrincipalPaid   float64
	Outstanding     float64
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