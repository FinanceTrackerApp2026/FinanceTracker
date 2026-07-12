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
func UpdateContactCode(id int, contactCode string) error {
	_, err := DB.Exec(`
		UPDATE contacts
		SET contact_code = $1
		WHERE id = $2
	`, contactCode, id)

	return err
}
func GetAllContacts() ([]entities.Contact, error) {

	rows, err := DB.Query(`
		SELECT
			id,
			contact_code,
			full_name,
			phone_number,
			email,
			address,
			occupation,
			contact_type,
			notes,
			status,
			created_at,
			updated_at
		FROM contacts
		ORDER BY id
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var contacts []entities.Contact

	for rows.Next() {
		var contact entities.Contact

		err := rows.Scan(
			&contact.ID,
			&contact.ContactCode,
			&contact.FullName,
			&contact.PhoneNumber,
			&contact.Email,
			&contact.Address,
			&contact.Occupation,
			&contact.ContactType,
			&contact.Notes,
			&contact.Status,
			&contact.CreatedAt,
			&contact.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}	

		contacts = append(contacts, contact)
	}
	if err := rows.Err(); err != nil {
    return nil, err
	}

	return contacts, nil
}
func GetContactByID(id int) (*entities.Contact, error) {

	var contact entities.Contact

	err := DB.QueryRow(`
		SELECT
			id,
			contact_code,
			full_name,
			phone_number,
			email,
			address,
			occupation,
			contact_type,
			notes,
			status,
			created_at,
			updated_at
		FROM contacts
		WHERE id = $1
	`,
		id,
	).Scan(
		&contact.ID,
		&contact.ContactCode,
		&contact.FullName,
		&contact.PhoneNumber,
		&contact.Email,
		&contact.Address,
		&contact.Occupation,
		&contact.ContactType,
		&contact.Notes,
		&contact.Status,
		&contact.CreatedAt,
		&contact.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &contact, nil
}
func UpdateContact(id int, contact entities.Contact) error {

	_, err := DB.Exec(`
		UPDATE contacts
		SET
			full_name = $1,
			phone_number = $2,
			email = $3,
			address = $4,
			occupation = $5,
			contact_type = $6,
			notes = $7,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $8
	`,
		contact.FullName,
		contact.PhoneNumber,
		contact.Email,
		contact.Address,
		contact.Occupation,
		contact.ContactType,
		contact.Notes,
		id,
	)

	if err != nil {
		return err
	}

	return nil
}
func ChangeContactStatus(id int, status string) error {

	_, err := DB.Exec(`
		UPDATE contacts
		SET
			status = $1,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $2
	`,
		status,
		id,
	)

	if err != nil {
		return err
	}

	return nil
}
func HasActiveLoans(contactID int) (bool, error) {
	var exists bool

	err := DB.QueryRow(`
		SELECT EXISTS (
			SELECT 1
			FROM loans
			WHERE contact_id = $1
			  AND status = 'ACTIVE'
		)
	`, contactID).Scan(&exists)

	if err != nil {
		return false, err
	}

	return exists, nil
}