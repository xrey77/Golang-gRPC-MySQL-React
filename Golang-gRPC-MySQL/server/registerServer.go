// server/registerServer.go
package server

import (
	"context"
	"fmt"
	"golang_grpc_mysql/models"
	proto "golang_grpc_mysql/proto"

	"golang.org/x/crypto/bcrypt"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"gorm.io/gorm"
)

type RegisterServer struct {
	proto.UnimplementedRegisterServiceServer
	DB *gorm.DB
}

func (s *RegisterServer) Register(ctx context.Context, req *proto.RegisterRequest) (*proto.RegisterResponse, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.GetPassword()), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	var existingUser models.User
	err = s.DB.WithContext(ctx).Where("email = ?", req.GetEmail()).First(&existingUser).Error
	if err == nil {
		return nil, status.Error(codes.AlreadyExists, "email address is already taken.")
	}

	err = s.DB.WithContext(ctx).Where("username = ?", req.GetUsername()).First(&existingUser).Error
	if err == nil {
		return nil, status.Error(codes.AlreadyExists, "Username is already taken.")
	}

	user := models.User{
		Firstname: req.GetFirstname(),
		Lastname:  req.GetLastname(),
		Email:     req.GetEmail(),
		Mobile:    req.GetMobile(),
		Username:  req.GetUsername(),
		Password:  string(hashedPassword),
		Role_id:   2,
	}

	result := s.DB.WithContext(ctx).Create(&user)
	if result.Error != nil {
		return nil, fmt.Errorf("failed to insert user: %w", result.Error)
	}

	return &proto.RegisterResponse{
		Msg: &proto.RegisterMessage{
			Message: "User registered successfully",
		},
	}, nil
}

/*
host	 :  grpc://localhost:50051
endpoint : RegisterService/Register
request  :
{
  "firstname": "Rey",
  "lastname": "Gragasin",
  "email": "rey@yahoo.com",
  "mobile": "1234567890",
  "username": "Rey",
  "password": "rey"
}
*/
