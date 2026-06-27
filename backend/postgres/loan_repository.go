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
func CreateLoan(loan entities.Loan) error {

	_, err := DB.Exec(`
		INSERT INTO loans (
			contact_id,
			loan_reference,
			loan_type,
			interest_type,
			principal_amount,
			outstanding_principal,
			interest_rate,
			interest_frequency,
			loan_date
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`,
		loan.ContactID,
		loan.LoanReference,
		loan.LoanType,
		loan.InterestType,
		loan.PrincipalAmount,
		loan.OutstandingPrincipal,
		loan.InterestRate,
		loan.InterestFrequency,
		loan.LoanDate,
	)

	if err != nil {
		return err
	}

	return nil
}
func GetLoanByID(id int) (entities.Loan, error) {

	var loan entities.Loan

	err := DB.QueryRow(`
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
		WHERE id = $1
	`, id).Scan(
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
		return entities.Loan{}, err
	}

	return loan, nil
}