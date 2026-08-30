package graph

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	"finance-tracker/backend/auth"
	"finance-tracker/backend/entities"
	"finance-tracker/backend/graph/model"
)

func validateLoanInput(loanType, interestType string, principalAmount, interestRate float64, interestFrequency, loanDate string, dueDay *int32, loanTenure int32, tenureUnit string) error {
	if loanType != "LEND" && loanType != "BORROW" {
		return errors.New("loan type must be LEND or BORROW")
	}
	switch interestType {
	case "SIMPLE_INTEREST", "EMI", "COMPOUND", "INTEREST_ONLY":
	default:
		return errors.New("unsupported interest type")
	}
	if principalAmount <= 0 {
		return errors.New("principal amount must be greater than zero")
	}
	if interestRate < 0 {
		return errors.New("interest rate cannot be negative")
	}
	if _, err := time.Parse("2006-01-02", loanDate); err != nil {
		return errors.New("loan date must use YYYY-MM-DD format")
	}
	if dueDay != nil && (*dueDay < 1 || *dueDay > 31) {
		return errors.New("due day must be between 1 and 31")
	}
	if interestType == "EMI" && (loanTenure <= 0 || (tenureUnit != "MONTH" && tenureUnit != "YEAR")) {
		return errors.New("EMI loans require a positive tenure and MONTH or YEAR unit")
	}
	if (interestType == "COMPOUND" || interestType == "INTEREST_ONLY") && interestFrequency != "MONTHLY" && interestFrequency != "QUARTERLY" && interestFrequency != "HALF_YEARLY" && interestFrequency != "YEARLY" {
		return errors.New("interest frequency must be MONTHLY, QUARTERLY, HALF_YEARLY, or YEARLY")
	}
	return nil
}

func userModel(user *entities.User) *model.User {
	return &model.User{ID: stringID(user.ID), Email: user.Email, FullName: user.FullName, Status: user.Status, CreatedAt: user.CreatedAt.Format("2006-01-02 15:04:05"), UpdatedAt: user.UpdatedAt.Format("2006-01-02 15:04:05")}
}

func stringID(id int) string {
	return fmt.Sprintf("%d", id)
}

func denyIfNotFound(err error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, sql.ErrNoRows) {
		return auth.ErrAccessDenied
	}
	return err
}
