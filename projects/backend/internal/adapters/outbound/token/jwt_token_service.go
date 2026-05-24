package token

import (
	"crypto/sha256"
	"encoding/hex"
	"time"

	"aiim/internal/domain/model"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID    string `json:"user_id"`
	SessionID string `json:"session_id"`
	jwt.RegisteredClaims
}

type JWTTokenService struct {
	secret []byte
}

func NewJWTTokenService() *JWTTokenService {
	return &JWTTokenService{}
}

func (s *JWTTokenService) GenerateAccessToken(user *model.User, sessionID string) (string, int64, error) {
	expAt := time.Now().Add(15 * time.Minute)
	claims := Claims{
		UserID:    user.ID,
		SessionID: sessionID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   user.ID,
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(s.secret)
	return signed, expAt.Unix(), err
}

func (s *JWTTokenService) GenerateRefreshToken(user *model.User, sessionID string) (string, error) {
	expAt := time.Now().Add(7 * 24 * time.Hour)
	claims := Claims{
		UserID:    user.ID,
		SessionID: sessionID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   user.ID,
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.secret)
}

func (s *JWTTokenService) ValidateAccessToken(tokenStr string) (userID, sessionID string, err error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
		return s.secret, nil
	})
	if err != nil || !token.Valid {
		return "", "", err
	}
	return claims.UserID, claims.SessionID, nil
}

func (s *JWTTokenService) ValidateRefreshToken(tokenStr string) (userID, sessionID string, err error) {
	return s.ValidateAccessToken(tokenStr)
}

func (s *JWTTokenService) HashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}