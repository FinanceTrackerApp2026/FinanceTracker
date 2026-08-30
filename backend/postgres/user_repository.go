package postgres

import (
	"errors"

	"finance-tracker/backend/entities"

	"github.com/lib/pq"
)

func CreateUser(user *entities.User) error {
	return DB.QueryRow(`
		INSERT INTO users (email, password_hash, full_name, status)
		VALUES (LOWER($1), $2, $3, 'ACTIVE')
		RETURNING id, created_at, updated_at
	`, user.Email, user.PasswordHash, user.FullName).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
}

func GetUserByEmail(email string) (*entities.User, error) {
	var user entities.User
	err := DB.QueryRow(`
		SELECT id, email, password_hash, full_name, status, created_at, updated_at
		FROM users WHERE LOWER(email) = LOWER($1)
	`, email).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.FullName, &user.Status, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func GetUserByID(id int) (*entities.User, error) {
	var user entities.User
	err := DB.QueryRow(`
		SELECT id, email, password_hash, full_name, status, created_at, updated_at
		FROM users WHERE id = $1
	`, id).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.FullName, &user.Status, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func IsDuplicateUserError(err error) bool {
	var pqErr *pq.Error
	return errors.As(err, &pqErr) && pqErr.Code == "23505"
}
