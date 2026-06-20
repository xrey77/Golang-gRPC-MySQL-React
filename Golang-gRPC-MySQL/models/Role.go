package models

import (
	"gorm.io/gorm"
)

type Role struct {
	gorm.Model
	ID   int    `gorm:"type:integer;primarykey"`
	Name string `gorm:"size:25;default:null"`
}
