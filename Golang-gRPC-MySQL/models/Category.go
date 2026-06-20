package models

import (
	"gorm.io/gorm"
)

type Category struct {
	gorm.Model
	ID   int    `gorm:"type:integer;primarykey"`
	Name string `gorm:"size:25;default:null"`

	Products []Product `gorm:"many2many:product_categories;"`
}
