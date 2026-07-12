package helper

import "fmt"

func GenerateContactCode(id int) string {
	return fmt.Sprintf("CNT%06d", id)
}