// server/uploadImageServer.go
package server

import (
	"context"
	"errors"
	"golang_grpc_mysql/models"
	uploadProto "golang_grpc_mysql/proto/uploadv1"
	"os"
	"path/filepath"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"gorm.io/gorm"
)

type UploadImageServer struct {
	uploadProto.UnimplementedUploadPictureServiceServer
	DB *gorm.DB
}

func (s *UploadImageServer) UploadProfilePicture(ctx context.Context, req *uploadProto.UserPictureRequest) (*uploadProto.UserPictureResponse, error) {
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

	filename := filepath.Base(req.GetFilename())
	ext := filepath.Ext(filename)
	newfile := "00" + req.GetId() + ext
	dst := filepath.Join("./assets/users/", newfile)

	// 2. Ensure destination directory exists
	if err := os.MkdirAll(filepath.Dir(dst), os.ModePerm); err != nil {
		return nil, status.Error(codes.Internal, "failed to create directory: "+err.Error())
	}

	// 3. Save the raw bytes directly to disk
	if err := os.WriteFile(dst, req.GetFileData(), 0644); err != nil {
		return nil, status.Error(codes.Internal, "upload file err: "+err.Error())
	}

	updateData["userpicture"] = newfile
	if len(updateData) == 0 {
		return &uploadProto.UserPictureResponse{
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

	return &uploadProto.UserPictureResponse{
		TextContent: "Multi-Factor has been enabled successfully.",
		Userpicture: newfile,
	}, nil

}
