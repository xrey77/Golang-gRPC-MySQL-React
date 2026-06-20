package config

import (
	"fmt"
	"log"
	"os"
	"golang_grpc_mysql/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connection() *gorm.DB {
	host := os.Getenv("DB_HOST") // "host.docker.internal"
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", user, pass, host, port, dbname)

	DB, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Println("Could not connect to MySQL database.")
	}

	err = DB.AutoMigrate(&models.User{}, &models.Role{}, &models.Product{}, &models.Sale{})
	if err != nil {
		log.Fatalf("Failed to auto migrate database: %v", err)
	}
	// log.Print("Tables Created....")

	return DB

}
