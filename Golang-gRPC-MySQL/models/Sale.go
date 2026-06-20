package models

import (
	"time"

	"github.com/shopspring/decimal"
)

type Sale struct {
	ID          int             `gorm:"primaryKey"`
	Salesamount decimal.Decimal `gorm:"type:numeric(10,2);default:0.00"`
	Salesdate   time.Time       `gorm:"default:CURRENT_TIMESTAMP(3)"`
}
