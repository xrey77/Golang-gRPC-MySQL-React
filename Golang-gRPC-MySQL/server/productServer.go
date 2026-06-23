// server/productServer.go
package server

import (
	"context"
	"golang_grpc_mysql/models"
	productProto "golang_grpc_mysql/proto/productv1"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"gorm.io/gorm"
)

type ProductServer struct {
	productProto.UnimplementedProductServiceServer
	DB *gorm.DB
}

func (s *ProductServer) GetProductList(ctx context.Context, req *productProto.GetProductListRequest) (*productProto.GetProductListResponse, error) {
	page := req.GetPage()
	if page <= 0 {
		page = 1
	}

	perPage := int64(5)
	var totalRecords int64

	err := s.DB.WithContext(ctx).Model(&models.Product{}).Count(&totalRecords).Error
	if err != nil {
		return nil, status.Error(codes.Internal, "Failed to count products")
	}

	if totalRecords == 0 {
		return &productProto.GetProductListResponse{
			Page:         page,
			TotalPages:   0,
			TotalRecords: 0,
			Products:     []*productProto.ProductData{},
		}, nil
	}

	totalPages := (totalRecords + perPage - 1) / perPage

	if page > totalPages {
		return &productProto.GetProductListResponse{
			Page:         page,
			TotalPages:   totalPages,
			TotalRecords: totalRecords,
			Products:     []*productProto.ProductData{},
		}, nil
	}

	offset := (page - 1) * perPage

	var products []models.Product
	err = s.DB.WithContext(ctx).
		Limit(int(perPage)).
		Offset(int(offset)).
		Find(&products).Error
	if err != nil {
		return nil, status.Error(codes.Internal, "Failed to fetch products")
	}

	pbProducts := make([]*productProto.ProductData, 0, len(products))
	for i := range products {
		pbProducts = append(pbProducts, products[i].ToProto())
	}

	return &productProto.GetProductListResponse{
		Page:         page,
		TotalPages:   totalPages,
		TotalRecords: totalRecords,
		Products:     pbProducts,
	}, nil
}

func (s *ProductServer) GetProductSearch(ctx context.Context, req *productProto.GetProductSearchRequest) (*productProto.GetProductSearchResponse, error) {
	page := req.GetPage()
	if page <= 0 {
		page = 1
	}

	key := "%" + req.GetKeyword() + "%"
	perPage := int64(5)
	var totalRecords int64

	err := s.DB.WithContext(ctx).Model(&models.Product{}).Where("descriptions LIKE ?", key).Count(&totalRecords).Error
	if err != nil {
		return nil, status.Error(codes.Internal, "Failed to count products")
	}

	if totalRecords == 0 {
		return &productProto.GetProductSearchResponse{
			Page:         page,
			TotalPages:   0,
			TotalRecords: 0,
			Products:     []*productProto.ProductData{},
		}, nil
	}

	totalPages := (totalRecords + perPage - 1) / perPage

	if page > totalPages {
		return &productProto.GetProductSearchResponse{
			Page:         page,
			TotalPages:   totalPages,
			TotalRecords: totalRecords,
			Products:     []*productProto.ProductData{},
		}, nil
	}

	offset := (page - 1) * perPage

	var products []models.Product
	err = s.DB.WithContext(ctx).
		Where("descriptions LIKE ?", key).
		Limit(int(perPage)).
		Offset(int(offset)).
		Find(&products).Error
	if err != nil {
		return nil, status.Error(codes.Internal, "Failed to fetch products")
	}

	pbProducts := make([]*productProto.ProductData, 0, len(products))
	for i := range products {
		pbProducts = append(pbProducts, products[i].ToProto())
	}

	return &productProto.GetProductSearchResponse{
		Page:         page,
		TotalPages:   totalPages,
		TotalRecords: totalRecords,
		Products:     pbProducts,
	}, nil
}
