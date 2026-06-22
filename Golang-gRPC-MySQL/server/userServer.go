// server/userServer.go
package server

import (
	"context"
	"errors"
	"golang_grpc_mysql/models"
	proto "golang_grpc_mysql/proto"

	"golang.org/x/crypto/bcrypt"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"gorm.io/gorm"
)

type UserServer struct {
	proto.UnimplementedUserServiceServer
	DB *gorm.DB
}

func (s *UserServer) GetUser(ctx context.Context, req *proto.GetUserRequest) (*proto.GetUserResponse, error) {
	if req.GetId() == "" {
		return nil, status.Error(codes.InvalidArgument, "User ID is required")
	}

	var user models.User
	err := s.DB.WithContext(ctx).First(&user, "id = ?", req.GetId()).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, status.Error(codes.NotFound, "User not found")
		}
		return nil, status.Error(codes.Internal, "Database error")
	}

	return &proto.GetUserResponse{
		User: user.ToProto(),
	}, nil
}

func (s *UserServer) GetAllUsers(ctx context.Context, req *proto.GetAllUsersRequest) (*proto.GetAllUsersResponse, error) {
	var users []models.User
	err := s.DB.WithContext(ctx).Find(&users).Error

	if err != nil {
		return nil, status.Error(codes.Internal, "Failed to fetch users")
	}

	pbUsers := make([]*proto.UserProfile, 0, len(users))

	for i := range users {
		pbUsers = append(pbUsers, users[i].ToProto())
	}

	return &proto.GetAllUsersResponse{
		Users: pbUsers,
	}, nil
}

// UPDATE USER PROFILE
func (s *UserServer) UpdateUserProfile(ctx context.Context, req *proto.UpdateUserProfileRequest) (*proto.UpdateUserProfileResponse, error) {
	if req.GetId() == "" {
		return nil, status.Error(codes.InvalidArgument, "user ID is required")
	}

	updateData := make(map[string]interface{})

	if req.GetFirstname() != "" {
		updateData["firstname"] = req.GetFirstname()
	}
	if req.GetLastname() != "" {
		updateData["lastname"] = req.GetLastname()
	}
	if req.GetMobile() != "" {
		updateData["mobile"] = req.GetMobile()
	}

	if len(updateData) == 0 {
		return &proto.UpdateUserProfileResponse{
			TextContent: "No changes detected",
		}, nil
	}

	result := s.DB.WithContext(ctx).Model(&models.User{}).Where("id = ?", req.GetId()).Updates(updateData)

	if result.Error != nil {
		return nil, status.Errorf(codes.Internal, "failed to update profile: %v", result.Error)
	}

	if result.RowsAffected == 0 {
		return nil, status.Error(codes.NotFound, "user not found")
	}

	return &proto.UpdateUserProfileResponse{
		TextContent: "You have updated your profile successfully.",
	}, nil
}

// CHANGE PASSWORD
func (s *UserServer) ChangePassword(ctx context.Context, req *proto.ChangePasswordRequest) (*proto.ChangePasswordResponse, error) {
	if req.GetId() == "" {
		return nil, status.Error(codes.InvalidArgument, "user ID is required")
	}
	if req.GetPassword() == "" {
		return nil, status.Error(codes.InvalidArgument, "password is required")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.GetPassword()), bcrypt.DefaultCost)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to hash password: %v", err)
	}

	updateData := map[string]interface{}{
		"password": string(hashedPassword),
	}

	result := s.DB.WithContext(ctx).Model(&models.User{}).Where("id = ?", req.GetId()).Updates(updateData)
	if result.Error != nil {
		return nil, status.Errorf(codes.Internal, "failed to update profile: %v", result.Error)
	}

	if result.RowsAffected == 0 {
		return nil, status.Error(codes.NotFound, "user not found")
	}

	return &proto.ChangePasswordResponse{
		TextContent: "You have changed your password successfully.",
	}, nil
}

/**
====GETALLUSERS=======
host: grpc://localhost:50051
endpoint: UserSerivce/GetAllUsers


===GETUSERBYDID======
host: grpc://localhost:50051
endpoint: UserSerivce/GetUser
request:
{
  "id": 1
}


===UPDATE PROFILE=====
host: grpc://localhost:50051
endpoint: UserSerivce/UpdateUserProfile
request:
{
  "id": 1,
  "firstname": "Reynaldo",
  "lastname": "Marquez",
  "mobile": "+633434343"
}


====CHANGE PASSWORD====
host: grpc://localhost:50051
endpoint: UserSerivce/ChangePassword
request:
{
  "id": 1,
  "password": "rey"
}


*/
