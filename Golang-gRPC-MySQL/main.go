package main

import (
	"golang_grpc_mysql/server"
	"time"

	protoLogin "golang_grpc_mysql/proto/loginv1"
	protoMfa "golang_grpc_mysql/proto/mfav1"
	protoUpload "golang_grpc_mysql/proto/uploadv1"

	protoProduct "golang_grpc_mysql/proto/productv1"
	protoRegister "golang_grpc_mysql/proto/registerv1"
	protoSales "golang_grpc_mysql/proto/salev1"
	protoUser "golang_grpc_mysql/proto/userv1"
	"log"
	"net"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
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

	go func() {
		r := gin.Default()

		_ = r.SetTrustedProxies(nil)

		r.Use(static.Serve("/", static.LocalFile("templates", true)))
		r.Static("/assets", "./assets")

		r.Use(cors.New(cors.Config{
			AllowOrigins:     []string{"http://localhost:8080", "http://localhost", "http://localhost:5000", "http://localhost:5173"},
			AllowMethods:     []string{"GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE", "HEAD"},
			AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
			ExposeHeaders:    []string{"Content-Length"},
			AllowCredentials: true,
			MaxAge:           12 * time.Hour,
		}))

		r.GET("/", func(c *gin.Context) {
			c.HTML(200, "index.html", gin.H{
				"title": "Main Page",
			})
		})

		log.Println("Gin HTTP Server running on port :8080")
		if err := r.Run(":8080"); err != nil {
			log.Fatalf("failed to run Gin server: %v", err)
		}
	}()

	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer()

	registerServer := &server.RegisterServer{DB: db}
	loginServer := &server.LoginServer{DB: db}
	userServer := &server.UserServer{DB: db}
	mfaServer := &server.MfaServer{DB: db}
	uploadImageServer := &server.UploadImageServer{DB: db}
	productServerInst := &server.ProductServer{DB: db}
	saleServer := &server.SalesServer{DB: db}

	protoRegister.RegisterAccountServiceServer(grpcServer, registerServer)
	protoLogin.RegisterLoginServiceServer(grpcServer, loginServer)
	protoUser.RegisterUserServiceServer(grpcServer, userServer)
	protoMfa.RegisterMfaServiceServer(grpcServer, mfaServer)
	protoUpload.RegisterUploadPictureServiceServer(grpcServer, uploadImageServer)
	protoProduct.RegisterProductServiceServer(grpcServer, productServerInst)
	protoSales.RegisterSalesServiceServer(grpcServer, saleServer)

	reflection.Register(grpcServer)

	log.Println("gRPC Server running on port :50051")
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve gRPC: %v", err)
	}
}
