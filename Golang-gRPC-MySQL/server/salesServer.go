// server/salesServer.go
package server

import (
	"context"
	"golang_grpc_mysql/models"
	salesProto "golang_grpc_mysql/proto/salev1"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"gorm.io/gorm"
)

type SalesServer struct {
	salesProto.UnimplementedSalesServiceServer
	DB *gorm.DB
}

func (s *SalesServer) GetSales(ctx context.Context, req *salesProto.GetSalesRequest) (*salesProto.GetSalesResponse, error) {
	var sales []models.Sale
	err := s.DB.WithContext(ctx).Find(&sales).Error

	if err != nil {
		return nil, status.Error(codes.Internal, "Failed to fetch Sales")
	}

	pbSales := make([]*salesProto.SalesData, 0, len(sales))

	for i := range sales {
		pbSales = append(pbSales, sales[i].ToProto())
	}

	return &salesProto.GetSalesResponse{
		Data: pbSales,
	}, nil
}
