package main

import (
	proto "golang_grpc_mysql/proto"
	"golang_grpc_mysql/server"

	"log"
	"net"

	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func main() {
	dsn := "rey:rey@tcp(127.0.0.1:3306)/golang_grpc?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	// if err := db.AutoMigrate(&models.User{}); err != nil {
	// 	log.Fatalf("failed to migrate database: %v", err)
	// }

	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer()

	loginServer := &server.LoginServer{DB: db}
	registerServer := &server.RegisterServer{DB: db}

	proto.RegisterRegisterServiceServer(grpcServer, registerServer)
	proto.RegisterLoginServiceServer(grpcServer, loginServer)

	reflection.Register(grpcServer)

	log.Println("gRPC Server running on port :50051")
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve gRPC: %v", err)
	}
}

// package main

// import (
// 	"fmt"
// 	"log"
// 	"net/http"
// 	"time"

// 	"github.com/gin-contrib/cors"
// 	"github.com/gin-gonic/gin"
// 	"github.com/joho/godotenv"

// 	"golang_grpc_mysql/config"
// 	"github.com/gin-gonic/contrib/static"
// )

// func init() {
// 	err1 := godotenv.Load(".env")
// 	if err1 != nil {
// 		log.Fatalf("Error loading .env file")
// 	}
// 	config.Connection()
// }

// func main() {

// 	gin.SetMode(gin.ReleaseMode)
// 	router := gin.Default()

// 	router.Use(static.Serve("/", static.LocalFile("templates", true)))
// 	router.Static("/assets", "./assets")

// 	router.Use(cors.New(cors.Config{
// 		AllowOrigins:     []string{"http://localhost:8080", "http://localhost", "http://localhost:5000", "http://localhost:5173"},
// 		AllowMethods:     []string{"GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE", "HEAD"},
// 		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
// 		ExposeHeaders:    []string{"Content-Length"},
// 		AllowCredentials: true,
// 		MaxAge:           12 * time.Hour,
// 	}))

// 	host := "0.0.0.0"
// 	port := "5000"
// 	address := fmt.Sprintf("%s:%s", host, port)
// 	log.Print("Listening to ", address)
// 	log.Fatal(http.ListenAndServe("0.0.0.0:5000", router))

// }
