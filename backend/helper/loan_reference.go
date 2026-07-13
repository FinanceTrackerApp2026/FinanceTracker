package helper

import "fmt"

func GenerateLoanReference(id int) string {
	return fmt.Sprintf("LOAN%06d", id)
}