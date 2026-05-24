package service

import (
	"context"
	"time"

	"aiim/internal/domain/errors"
	"aiim/internal/domain/model"
	"aiim/internal/ports/inbound"
	"aiim/internal/ports/outbound"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo    outbound.UserRepositoryPort
	sessionRepo outbound.SessionRepositoryPort
	tokenSvc    outbound.TokenServicePort
}

func NewAuthService(
	userRepo outbound.UserRepositoryPort,
	sessionRepo outbound.SessionRepositoryPort,
	tokenSvc outbound.TokenServicePort,
) inbound.AuthCommandPort {
	return &AuthService{userRepo: userRepo, sessionRepo: sessionRepo, tokenSvc: tokenSvc}
}

func (s *AuthService) Register(ctx context.Context, username, email, password, nickname string) (*model.User, error) {
	// 检查用户名是否已存在
	if _, err := s.userRepo.FindByUsername(ctx, username); err == nil {
		return nil, errors.ErrUsernameTaken
	}
	if _, err := s.userRepo.FindByEmail(ctx, email); err == nil {
		return nil, errors.ErrEmailTaken
	}

	// 密码哈希
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &model.User{
		ID:        uuid.New().String(),
		Username:  username,
		Email:     email,
		Password:  string(hash),
		Nickname:  nickname,
		AvatarURL: "",
		Status:    model.UserStatusOffline,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := s.userRepo.Save(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *AuthService) Login(ctx context.Context, username, password string) (*inbound.LoginResult, error) {
	user, err := s.userRepo.FindByUsername(ctx, username)
	if err != nil {
		return nil, errors.ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, errors.ErrInvalidCredentials
	}

	sessionID := uuid.New().String()
	accessToken, expAt, err := s.tokenSvc.GenerateAccessToken(user, sessionID)
	if err != nil {
		return nil, err
	}
	refreshToken, err := s.tokenSvc.GenerateRefreshToken(user, sessionID)
	if err != nil {
		return nil, err
	}

	// 存储 session
	session := &model.Session{
		ID:        sessionID,
		UserID:    user.ID,
		TokenHash: s.tokenSvc.HashToken(accessToken),
		ExpiresAt: time.Now().Add(time.Duration(7*24) * time.Hour),
		CreatedAt: time.Now(),
	}
	_ = s.sessionRepo.Save(ctx, session)

	return &inbound.LoginResult{
		User:         user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresAt:    expAt,
	}, nil
}

func (s *AuthService) RefreshToken(ctx context.Context, refreshToken string) (*inbound.LoginResult, error) {
	userID, sessionID, err := s.tokenSvc.ValidateRefreshToken(refreshToken)
	if err != nil {
		return nil, errors.ErrRefreshTokenInvalid
	}

	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	accessToken, expAt, err := s.tokenSvc.GenerateAccessToken(user, sessionID)
	if err != nil {
		return nil, err
	}
	newRefresh, err := s.tokenSvc.GenerateRefreshToken(user, sessionID)
	if err != nil {
		return nil, err
	}

	return &inbound.LoginResult{
		User:         user,
		AccessToken:  accessToken,
		RefreshToken: newRefresh,
		ExpiresAt:    expAt,
	}, nil
}

func (s *AuthService) Logout(ctx context.Context, sessionID string) error {
	return s.sessionRepo.Delete(ctx, sessionID)
}

func (s *AuthService) ValidateToken(ctx context.Context, token string) (string, error) {
	userID, _, err := s.tokenSvc.ValidateAccessToken(token)
	if err != nil {
		return "", errors.ErrTokenInvalid
	}
	return userID, nil
}