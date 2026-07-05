package postgres

import "finance-tracker/backend/entities"

func GetAllLoans() ([]entities.Loan, error) {

	rows, err := DB.Query(`
		SELECT
			id,
			contact_id,
			loan_reference,
			loan_type,
			interest_type,
			principal_amount,
			outstanding_principal,
			interest_rate,
			interest_frequency,
			loan_date,
			due_day,
			loan_tenure,
			tenure_unit,
			has_security,
			status,
			notes,
			created_at,
			updated_at
		FROM loans
		ORDER BY id
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var loans []entities.Loan

	for rows.Next() {

		var loan entities.Loan

		err := rows.Scan(
			&loan.ID,
			&loan.ContactID,
			&loan.LoanReference,
			&loan.LoanType,
			&loan.InterestType,
			&loan.PrincipalAmount,
			&loan.OutstandingPrincipal,
			&loan.InterestRate,
			&loan.InterestFrequency,
			&loan.LoanDate,
			&loan.DueDay,
			&loan.LoanTenure,
			&loan.TenureUnit,
			&loan.HasSecurity,
			&loan.Status,
			&loan.Notes,
			&loan.CreatedAt,
			&loan.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		loans = append(loans, loan)
	}

	return loans, nil
}
func CreateLoan(loan *entities.Loan) error {

	err := DB.QueryRow(`
		INSERT INTO loans (
			contact_id,
			loan_reference,
			loan_type,
			interest_type,
			principal_amount,
			outstanding_principal,
			interest_rate,
			interest_frequency,
			loan_date,
			due_day,
			loan_tenure,
			tenure_unit,
			has_security,
			status,
			notes
		)
		VALUES (
			$1,$2,$3,$4,$5,
			$6,$7,$8,$9,$10,
			$11,$12,$13,$14,$15
		)
		RETURNING id
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
		loan.DueDay,
		loan.LoanTenure,
		loan.TenureUnit,
		loan.HasSecurity,
		loan.Status,
		loan.Notes,
	).Scan(&loan.ID)

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
			interest_rate,
			interest_frequency,
			loan_date,
			due_day,
			loan_tenure,
			tenure_unit,
			has_security,
			status,
			notes,
			created_at,
			updated_at
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
		&loan.InterestFrequency,
		&loan.LoanDate,
		&loan.DueDay,
		&loan.LoanTenure,
		&loan.TenureUnit,
		&loan.HasSecurity,
		&loan.Status,
		&loan.Notes,
		&loan.CreatedAt,
		&loan.UpdatedAt,
	)

	if err != nil {
		return entities.Loan{}, err
	}

	return loan, nil
}
func GetLoansByContactID(contactID int) ([]entities.Loan, error) {

	rows, err := DB.Query(`
		SELECT
			id,
			contact_id,
			loan_reference,
			loan_type,
			interest_type,
			principal_amount,
			outstanding_principal,
			interest_rate,
			interest_frequency,
			loan_date,
			due_day,
			loan_tenure,
			tenure_unit,
			has_security,
			status,
			notes,
			created_at,
			updated_at
		FROM loans
		WHERE contact_id = $1
		ORDER BY id
	`, contactID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var loans []entities.Loan

	for rows.Next() {

		var loan entities.Loan

		err := rows.Scan(
			&loan.ID,
			&loan.ContactID,
			&loan.LoanReference,
			&loan.LoanType,
			&loan.InterestType,
			&loan.PrincipalAmount,
			&loan.OutstandingPrincipal,
			&loan.InterestRate,
			&loan.InterestFrequency,
			&loan.LoanDate,
			&loan.DueDay,
			&loan.LoanTenure,
			&loan.TenureUnit,
			&loan.HasSecurity,
			&loan.Status,
			&loan.Notes,
			&loan.CreatedAt,
			&loan.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		loans = append(loans, loan)
	}

	return loans, nil
}
func UpdateLoan(id int, loan entities.Loan) error {

	_, err := DB.Exec(`
		UPDATE loans
		SET
			interest_type = $1,
			principal_amount = $2,
			interest_rate = $3,
			interest_frequency = $4,
			loan_date = $5,
			due_day = $6,
			loan_tenure = $7,
			tenure_unit = $8,
			has_security = $9,
			notes = $10,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $11
	`,
		loan.InterestType,
		loan.PrincipalAmount,
		loan.InterestRate,
		loan.InterestFrequency,
		loan.LoanDate,
		loan.DueDay,
		loan.LoanTenure,
		loan.TenureUnit,
		loan.HasSecurity,
		loan.Notes,
		id,
	)

	if err != nil {
		return err
	}

	return nil
}
