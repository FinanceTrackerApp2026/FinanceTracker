package postgres

import "finance-tracker/backend/entities"

func CreatePayment(payment entities.Payment) error {

	_, err := DB.Exec(`
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
	`,
		payment.LoanID,
		payment.PaymentDate,
		payment.PaymentAmount,
		payment.PaymentType,
		payment.PaymentMethod,
		payment.TransactionReference,
		payment.Notes,
	)

	if err != nil {
		return err
	}

	return nil
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
		ORDER BY payment_date ASC
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

	return payments, nil
}