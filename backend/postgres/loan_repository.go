package postgres

import "finance-tracker/backend/entities"

func GetAllLoans() ([]entities.Loan, error) {

	rows, err := DB.Query(`
		SELECT
			l.id,
			l.contact_id,
			c.contact_code,
			c.full_name,
			l.loan_reference,
			l.loan_type,
			l.interest_type,
			l.principal_amount,
			l.outstanding_principal,
			l.interest_rate,
			l.interest_frequency,
			l.loan_date,
			l.due_day,
			l.loan_tenure,
			l.tenure_unit,
			l.has_security,
			l.status,
			l.notes,
			l.created_at,
			l.updated_at
		FROM loans l
		INNER JOIN contacts c
			ON l.contact_id = c.id
		ORDER BY l.id
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
			&loan.ContactCode,
			&loan.ContactName,
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

	if err := rows.Err(); err != nil {
		return nil, err
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
			l.id,
			l.contact_id,
			c.contact_code,
			c.full_name,
			l.loan_reference,
			l.loan_type,
			l.interest_type,
			l.principal_amount,
			l.outstanding_principal,
			l.interest_rate,
			l.interest_frequency,
			l.loan_date,
			l.due_day,
			l.loan_tenure,
			l.tenure_unit,
			l.has_security,
			l.status,
			l.notes,
			l.created_at,
			l.updated_at
		FROM loans l
		INNER JOIN contacts c
			ON l.contact_id = c.id
		WHERE l.id = $1
	`, id).Scan(
		&loan.ID,
		&loan.ContactID,
		&loan.ContactCode,
		&loan.ContactName,
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
			l.id,
			l.contact_id,
			c.contact_code,
			c.full_name,
			l.loan_reference,
			l.loan_type,
			l.interest_type,
			l.principal_amount,
			l.outstanding_principal,
			l.interest_rate,
			l.interest_frequency,
			l.loan_date,
			l.due_day,
			l.loan_tenure,
			l.tenure_unit,
			l.has_security,
			l.status,
			l.notes,
			l.created_at,
			l.updated_at
		FROM loans l
		INNER JOIN contacts c
			ON l.contact_id = c.id
		WHERE l.contact_id = $1
		ORDER BY l.id
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
			&loan.ContactCode,
			&loan.ContactName,
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

	if err := rows.Err(); err != nil {
		return nil, err
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
func UpdateLoanReference(id int, loanReference string) error {

	_, err := DB.Exec(`
		UPDATE loans
		SET
			loan_reference = $1,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
	`,
		loanReference,
		id,
	)

	if err != nil {
		return err
	}

	return nil
}