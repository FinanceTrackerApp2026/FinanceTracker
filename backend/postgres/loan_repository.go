package postgres

import "finance-tracker/backend/entities"

func GetAllLoans() ([]entities.Loan, error) {
	rows,err:=DB.Query(`
	SELECT
		id,
		contact_id,
		loan_reference,
		loan_type,
		interest_type,
		principal_amount,
		outstanding_principal,
		interest_rate
	FROM loans
	`)
	if err!=nil{
		return nil,err
	}
	defer rows.Close()
	var loans []entities.Loan
	for rows.Next(){
		var loan entities.Loan
		err:=rows.Scan(
			&loan.ID,
			&loan.ContactID,
			&loan.LoanReference,
			&loan.LoanType,
			&loan.InterestType,
			&loan.PrincipalAmount,
			&loan.OutstandingPrincipal,
			&loan.InterestRate,
		)
		if err != nil {
			return nil, err
		}
		loans=append(loans, loan)

	}
	return loans, nil
}