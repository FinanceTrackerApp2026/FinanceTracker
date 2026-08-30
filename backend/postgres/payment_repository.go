package postgres

import "finance-tracker/backend/entities"

func GetPaymentByIDForUser(id, userID int) (entities.Payment, error) {
	var payment entities.Payment
	err := DB.QueryRow(`SELECT p.id, p.loan_id, p.payment_date, p.payment_amount, p.payment_type, p.payment_method, p.transaction_reference, p.notes, p.created_at FROM payments p JOIN loans l ON l.id = p.loan_id JOIN contacts c ON c.id = l.contact_id WHERE p.id = $1 AND c.user_id = $2`, id, userID).Scan(&payment.ID, &payment.LoanID, &payment.PaymentDate, &payment.PaymentAmount, &payment.PaymentType, &payment.PaymentMethod, &payment.TransactionReference, &payment.Notes, &payment.CreatedAt)
	return payment, err
}

func GetPaymentsByLoanIDForUser(loanID, userID int) ([]entities.Payment, error) {
	if _, err := GetLoanByIDForUser(loanID, userID); err != nil {
		return nil, err
	}
	return GetPaymentsByLoanID(loanID)
}

func CreatePayment(payment entities.Payment) (entities.Payment, error) {

	err := DB.QueryRow(`
		INSERT INTO payments (
			loan_id,
			payment_date,
			payment_amount,
			payment_type,
			payment_method,
			transaction_reference,
			notes
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id
	`,
		payment.LoanID,
		payment.PaymentDate,
		payment.PaymentAmount,
		payment.PaymentType,
		payment.PaymentMethod,
		payment.TransactionReference,
		payment.Notes,
	).Scan(&payment.ID)

	if err != nil {
		return entities.Payment{}, err
	}

	return payment, nil
}
func GetPaymentsByLoanID(loanID int) ([]entities.Payment, error) {

	rows, err := DB.Query(`
		SELECT
			id,
			loan_id,
			payment_date,
			payment_amount,
			payment_type,
			payment_method,
			transaction_reference,
			notes,
			created_at
		FROM payments
		WHERE loan_id = $1
		ORDER BY payment_date ASC, id ASC
	`, loanID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var payments []entities.Payment

	for rows.Next() {

		var payment entities.Payment

		err := rows.Scan(
			&payment.ID,
			&payment.LoanID,
			&payment.PaymentDate,
			&payment.PaymentAmount,
			&payment.PaymentType,
			&payment.PaymentMethod,
			&payment.TransactionReference,
			&payment.Notes,
			&payment.CreatedAt,
		)

		if err != nil {
			return nil, err
		}

		payments = append(payments, payment)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return payments, nil
}
func GetPaymentByID(id int) (entities.Payment, error) {
	var payment entities.Payment

	err := DB.QueryRow(`
		SELECT
			id,
			loan_id,
			payment_date,
			payment_amount,
			payment_type,
			payment_method,
			transaction_reference,
			notes,
			created_at
		FROM payments
		WHERE id = $1
	`, id).Scan(
		&payment.ID,
		&payment.LoanID,
		&payment.PaymentDate,
		&payment.PaymentAmount,
		&payment.PaymentType,
		&payment.PaymentMethod,
		&payment.TransactionReference,
		&payment.Notes,
		&payment.CreatedAt,
	)

	return payment, err
}

func UpdatePaymentForUser(id, userID int, payment entities.Payment) (bool, error) {
	result, err := DB.Exec(`
		UPDATE payments p
		SET
			loan_id = $1,
			payment_date = $2,
			payment_amount = $3,
			payment_type = $4,
			payment_method = $5,
			transaction_reference = $6,
			notes = $7
		FROM loans l
		JOIN contacts c ON c.id = l.contact_id
		WHERE p.id = $8 AND p.loan_id = l.id AND c.user_id = $9
	`,
		payment.LoanID,
		payment.PaymentDate,
		payment.PaymentAmount,
		payment.PaymentType,
		payment.PaymentMethod,
		payment.TransactionReference,
		payment.Notes,
		id,
		userID,
	)
	if err != nil {
		return false, err
	}
	rowsAffected, err := result.RowsAffected()
	return rowsAffected == 1, err
}

func DeletePaymentForUser(id, userID int) (bool, error) {
	result, err := DB.Exec(`
		DELETE FROM payments p
		USING loans l, contacts c
		WHERE p.id = $1 AND p.loan_id = l.id AND l.contact_id = c.id AND c.user_id = $2
	`, id, userID)
	if err != nil {
		return false, err
	}
	rowsAffected, err := result.RowsAffected()
	return rowsAffected == 1, err
}

func UpdatePayment(id int, payment entities.Payment) (bool, error) {

	result, err := DB.Exec(`
		UPDATE payments
		SET
			loan_id = $1,
			payment_date = $2,
			payment_amount = $3,
			payment_type = $4,
			payment_method = $5,
			transaction_reference = $6,
			notes = $7
		WHERE id = $8
	`,
		payment.LoanID,
		payment.PaymentDate,
		payment.PaymentAmount,
		payment.PaymentType,
		payment.PaymentMethod,
		payment.TransactionReference,
		payment.Notes,
		id,
	)

	if err != nil {
		return false, err
	}

	rowsAffected, err := result.RowsAffected()
	return rowsAffected == 1, err
}
func DeletePayment(id int) (bool, error) {

	result, err := DB.Exec(`
		DELETE FROM payments
		WHERE id = $1
	`, id)

	if err != nil {
		return false, err
	}

	rowsAffected, err := result.RowsAffected()
	return rowsAffected == 1, err
}
