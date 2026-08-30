package postgres

import "database/sql"

func errNoRows() error {
	return sql.ErrNoRows
}
