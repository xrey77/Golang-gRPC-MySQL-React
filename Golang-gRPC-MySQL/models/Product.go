package models

import (
	protoProduct "golang_grpc_mysql/proto/productv1"
	"strconv"
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type Product struct {
	// gorm.Model is removed because fields are explicitly defined below
	ID             int             `gorm:"primaryKey;autoIncrement"`
	Category       string          `gorm:"size:255;default:null"`
	Descriptions   string          `gorm:"size:255;uniqueIndex;not:null"`
	Qty            int             `gorm:"type:integer;default:0"`
	Unit           string          `gorm:"size:255"`
	Costprice      decimal.Decimal `gorm:"type:numeric(10,2);default:0.00"`
	Sellprice      decimal.Decimal `gorm:"type:numeric(10,2);default:0.00"`
	Saleprice      decimal.Decimal `gorm:"type:numeric(10,2);default:0.00"`
	Productpicture string          `gorm:"size:255;default:null"`
	Alertstocks    int             `gorm:"type:integer;default:0"`
	Criticalstocks int             `gorm:"type:integer;default:0"`
	CreatedAt      time.Time       `gorm:"autoCreateTime"`
	UpdatedAt      time.Time       `gorm:"autoUpdateTime"`
	DeletedAt      gorm.DeletedAt  `gorm:"index"` // Added for soft delete support

	// Many-to-Many relationship structure
	Categories []Category `gorm:"many2many:product_categories;"`
}

func (u *Product) ToProto() *protoProduct.ProductData {
	if u == nil {
		return nil
	}

	return &protoProduct.ProductData{
		Id:             strconv.Itoa(u.ID),
		Descriptions:   u.Descriptions,
		Qty:            strconv.Itoa(u.Qty),
		Unit:           u.Unit,
		ProductPicture: u.Productpicture,
		CostPrice:      u.Costprice.String(),
		SellPrice:      u.Sellprice.String(),
	}
}
