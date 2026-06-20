package models

import (
	"time"

	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type Product struct {
	gorm.Model
	ID             int             `gorm:"type:integer;primarykey"`
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
	CreatedAt      time.Time       `gorm:"default:CURRENT_TIMESTAMP(3)"`
	UpdatedAt      time.Time       `gorm:"default:CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)"`
	Category_id    int             `gorm:"type:integer"`

	Categories []Category `gorm:"many2many:product_categories;"`
}
