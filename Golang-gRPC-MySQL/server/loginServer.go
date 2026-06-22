// server/loginServer.go
package server

import (
	"context"
	"errors"
	"golang_grpc_mysql/models"
	proto "golang_grpc_mysql/proto"
	"net/http"
	"time"

	"google.golang.org/protobuf/types/known/wrapperspb"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"gorm.io/gorm"
)

type LoginServer struct {
	proto.UnimplementedLoginServiceServer
	DB *gorm.DB
}

type CustomClaims struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	jwt.RegisteredClaims
}

func mapGRPCCodeToHTTP(code codes.Code) int {
	switch code {
	case codes.Unauthenticated:
		return http.StatusUnauthorized
	case codes.InvalidArgument:
		return http.StatusBadRequest
	case codes.PermissionDenied:
		return http.StatusForbidden
	default:
		return http.StatusInternalServerError
	}
}

func (s *LoginServer) Login(ctx context.Context, req *proto.LoginRequest) (*proto.LoginResponse, error) {
	if req.GetUsername() == "" || req.GetPassword() == "" {
		return nil, status.Error(codes.InvalidArgument, "username and password are required")
	}

	var user models.User
	err := s.DB.Where("username = ?", req.GetUsername()).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, status.Error(codes.Unauthenticated, "invalid username, please register.")
		}
		return nil, status.Error(codes.Internal, "database error: "+err.Error())
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.GetPassword()))
	if err != nil {
		return nil, status.Error(codes.Unauthenticated, "invalid password, please try again.")
	}

	if user.Isactivated == false {
		return nil, status.Error(codes.PermissionDenied, "user account is not yet activated.")
	}

	if user.Isblocked == true {
		return nil, status.Error(codes.PermissionDenied, "user account is blocked")
	}
	var jwtSecretKey = []byte("f7bc028ed2f6c641f173b120688339f9")
	expirationTime := time.Now().Add(24 * time.Hour)

	claims := CustomClaims{
		Username: user.Username,
		Email:    user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	generatedToken, err := token.SignedString(jwtSecretKey)
	if err != nil {
		return nil, status.Error(codes.Internal, "failed to generate token")
	}

	var qrcodeurlWrapper *wrapperspb.StringValue
	if user.Qrcodeurl != "" {
		qrcodeurlWrapper = wrapperspb.String(user.Qrcodeurl)
	} else {
		qrcodeurlWrapper = nil
	}

	if user.Qrcodeurl != "" {
		qrcodeurlWrapper = wrapperspb.String(user.Qrcodeurl)
	} else {
		qrcodeurlWrapper = nil
	}

	return &proto.LoginResponse{
		Data: &proto.LoginData{
			TextContent: "Login successful",
			FirstName:   user.Firstname,
			LastName:    user.Lastname,
			Email:       user.Email,
			Mobile:      user.Mobile,
			Username:    user.Username,
			UserPic:     user.Userpicture,
			IsActive:    user.Isactivated,
			IsBlocked:   user.Isblocked,
			MailToken:   user.Mailtoken,
			Qrcodeurl:   qrcodeurlWrapper,
			Token:       generatedToken,
		},
	}, nil

}
