package models

import (
	protoSale "golang_grpc_mysql/proto/salev1"
	"strconv"
	"time"

	"github.com/shopspring/decimal"
)

type Sale struct {
	ID          int             `gorm:"primaryKey"`
	Salesamount decimal.Decimal `gorm:"type:numeric(10,2);default:0.00"`
	Salesdate   time.Time       `gorm:"default:CURRENT_TIMESTAMP(3)"`
}

func (u *Sale) ToProto() *protoSale.SalesData {
	return &protoSale.SalesData{
		Id:          strconv.Itoa(u.ID),
		SalesAmount: u.Salesamount.String(),
		SalesDate:   u.Salesdate.String(),
	}
}
