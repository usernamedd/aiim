package service

import (
	"context"

	"aiim/internal/domain/errors"
	"aiim/internal/domain/model"
	"aiim/internal/ports/inbound"
	"aiim/internal/ports/outbound"
)

type UserService struct {
	userRepo outbound.UserRepositoryPort
}

func NewUserService(userRepo outbound.UserRepositoryPort) inbound.UserCommandPort {
	return &UserService{userRepo: userRepo}
}

func (s *UserService) UpdateProfile(ctx context.Context, userID, nickname, avatarURL string) (*model.User, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if nickname != "" {
		user.Nickname = nickname
	}
	if avatarURL != "" {
		user.AvatarURL = avatarURL
	}
	if err := s.userRepo.Save(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *UserService) UpdatePassword(ctx context.Context, userID, oldPwd, newPwd string) error {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return err
	}
	// TODO: bcrypt compare oldPwd
	_ = user
	_ = oldPwd
	_ = newPwd
	return nil
}

func (s *UserService) SearchUsers(ctx context.Context, keyword string, limit, offset int) ([]*model.User, int, error) {
	if limit <= 0 {
		limit = 20
	}
	return s.userRepo.Search(ctx, keyword, limit, offset)
}

func (s *UserService) GetUserByID(ctx context.Context, userID string) (*model.User, error) {
	return s.userRepo.FindByID(ctx, userID)
}

func (s *UserService) GetUsersByIDs(ctx context.Context, userIDs []string) ([]*model.User, error) {
	return s.userRepo.FindByIDs(ctx, userIDs)
}

func (s *UserService) GetUserStatus(ctx context.Context, userID string) (model.UserStatus, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return "", err
	}
	return user.Status, nil
}

func (s *UserService) ListFriends(ctx context.Context, userID string) ([]*model.User, error) {
	// TODO: friend relation ship
	_ = userID
	return nil, errors.ErrUserNotFound
}