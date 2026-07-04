package postgres

import "finance-tracker/backend/entities"

func CreateContact(contact *entities.Contact) error {

	err := DB.QueryRow(`
		INSERT INTO contacts (
			contact_code,
			full_name,
			phone_number,
			email,
			address,
			occupation,
			contact_type,
			notes,
			status
		)
		VALUES (
			$1, $2, $3, $4, $5,
			$6, $7, $8, $9
		)
		RETURNING id
	`,
		contact.ContactCode,
		contact.FullName,
		contact.PhoneNumber,
		contact.Email,
		contact.Address,
		contact.Occupation,
		contact.ContactType,
		contact.Notes,
		contact.Status,
	).Scan(&contact.ID)

	if err != nil {
		return err
	}

	return nil
}