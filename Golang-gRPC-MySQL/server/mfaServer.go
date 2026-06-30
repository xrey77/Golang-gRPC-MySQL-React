// server/mfaServer.go
package server

import (
	"context"
	"encoding/base64"
	"errors"
	"golang_grpc_mysql/models"
	mfaProto "golang_grpc_mysql/proto/mfav1"

	"github.com/pquerna/otp/totp"
	"github.com/skip2/go-qrcode"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"gorm.io/gorm"
)

type MfaServer struct {
	mfaProto.UnimplementedMfaServiceServer
	DB *gorm.DB
}

func (s *MfaServer) MfaActivation(ctx context.Context, req *mfaProto.MfaActivationRequest) (*mfaProto.MfaActivationResponse, error) {
	_, err1 := validateToken(ctx)
	if err1 != nil {
		return nil, status.Error(codes.Unauthenticated, err1.Error())
	}

	if req.GetId() == "" {
		return nil, status.Error(codes.InvalidArgument, "user ID is required")
	}

	var user models.User
	err := s.DB.WithContext(ctx).First(&user, "id = ?", req.GetId()).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, status.Error(codes.NotFound, "User not found")
		}
		return nil, status.Error(codes.Internal, "Database error")
	}

	updateData := make(map[string]interface{})

	if req.GetTwofactorenabled() == true {

		key, err := totp.Generate(totp.GenerateOpts{
			Issuer:      "BARCLAYS BANK",
			AccountName: user.Email,
		})
		if err != nil {
			return nil, status.Error(codes.NotFound, err.Error())
		}

		secret := key.Secret()
		qrCodeURL := key.URL()

		pngBytes, err := qrcode.Encode(qrCodeURL, qrcode.Medium, 256)
		if err != nil {
			return nil, status.Error(codes.NotFound, "Failed to generate QR code")
		}
		base64Encoded := "data:image/png;base64," + base64.StdEncoding.EncodeToString(pngBytes)

		updateData["secret"] = secret
		updateData["qrcodeurl"] = string(base64Encoded)
		if len(updateData) == 0 {
			return &mfaProto.MfaActivationResponse{
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

		return &mfaProto.MfaActivationResponse{
			TextContent: "Multi-Factor has been enabled successfully.",
			Qrcodeurl:   string(base64Encoded),
		}, nil

	} else {

		updateData["secret"] = nil
		updateData["qrcodeurl"] = nil
		result := s.DB.WithContext(ctx).Model(&models.User{}).Where("id = ?", req.GetId()).Updates(updateData)

		if result.Error != nil {
			return nil, status.Errorf(codes.Internal, "failed to update profile: %v", result.Error)
		}

		if result.RowsAffected == 0 {
			return nil, status.Error(codes.NotFound, "user not found")
		}

		return &mfaProto.MfaActivationResponse{
			TextContent: "Multi-Factor has been disabled successfully.",
		}, nil
	}
}

func (s *MfaServer) MfaVerification(ctx context.Context, req *mfaProto.MfaVerifyRequest) (*mfaProto.MfaVerifyResponse, error) {
	_, err1 := validateToken(ctx)
	if err1 != nil {
		return nil, status.Error(codes.Unauthenticated, err1.Error())
	}

	if req.GetId() == "" {
		return nil, status.Error(codes.InvalidArgument, "user ID is required")
	}
	if req.GetOtp() == "" {
		return nil, status.Error(codes.InvalidArgument, "Please enter OTP code.")
	}

	var user models.User
	err := s.DB.WithContext(ctx).First(&user, "id = ?", req.GetId()).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, status.Error(codes.NotFound, "User not found")
		}
		return nil, status.Error(codes.Internal, "Database error")
	}
	if user.Secret == "" {
		return &mfaProto.MfaVerifyResponse{
			TextContent: "Multi-Factor Authenticator is not yet activated.",
		}, nil

	}

	valid := totp.Validate(req.GetOtp(), user.Secret)
	if valid {

		return &mfaProto.MfaVerifyResponse{
			TextContent: "OTP code is successfully validated.",
			Username:    &user.Username,
		}, nil

	} else {
		return nil, status.Error(codes.InvalidArgument, "Invalid OTP code, please try again.")
	}

}
