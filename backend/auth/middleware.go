package auth

import (
	"net/http"
	"strings"
)

func Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		header := request.Header.Get("Authorization")
		if header != "" {
			parts := strings.Fields(header)
			if len(parts) == 2 && strings.EqualFold(parts[0], "Bearer") {
				if userID, err := ParseToken(parts[1]); err == nil {
					request = request.WithContext(WithUserID(request.Context(), userID))
				}
			}
		}
		next.ServeHTTP(writer, request)
	})
}
