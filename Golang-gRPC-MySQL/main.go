package main

import (
	"context"
	"golang_grpc_mysql/proto/loginv1"
	"golang_grpc_mysql/proto/loginv1/loginv1connect"
	"golang_grpc_mysql/proto/mfav1"
	"golang_grpc_mysql/proto/mfav1/mfav1connect"
	"golang_grpc_mysql/proto/productv1"
	"golang_grpc_mysql/proto/productv1/productv1connect"
	"golang_grpc_mysql/proto/registerv1"
	"golang_grpc_mysql/proto/registerv1/registerv1connect"
	"golang_grpc_mysql/proto/salev1"
	"golang_grpc_mysql/proto/salev1/salev1connect"
	"golang_grpc_mysql/proto/uploadv1"
	"golang_grpc_mysql/proto/uploadv1/uploadv1connect"
	"golang_grpc_mysql/proto/userv1"
	"golang_grpc_mysql/proto/userv1/userv1connect"
	"golang_grpc_mysql/server"
	"log"
	"net"
	"net/http"

	"github.com/bufbuild/connect-go"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type registerConnectHandler struct{ *server.RegisterServer }

func (h *registerConnectHandler) Register(ctx context.Context, req *connect.Request[registerv1.RegisterRequest]) (*connect.Response[registerv1.RegisterResponse], error) {
	resp, err := h.RegisterServer.Register(ctx, req.Msg)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(resp), nil
}

type loginConnectHandler struct{ *server.LoginServer }

func (h *loginConnectHandler) Login(ctx context.Context, req *connect.Request[loginv1.LoginRequest]) (*connect.Response[loginv1.LoginResponse], error) {
	resp, err := h.LoginServer.Login(ctx, req.Msg)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(resp), nil
}

type mfaConnectHandler struct{ *server.MfaServer }

func (h *mfaConnectHandler) MfaActivation(ctx context.Context, req *connect.Request[mfav1.MfaActivationRequest]) (*connect.Response[mfav1.MfaActivationResponse], error) {
	resp, err := h.MfaServer.MfaActivation(ctx, req.Msg)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(resp), nil
}

func (h *mfaConnectHandler) MfaVerification(ctx context.Context, req *connect.Request[mfav1.MfaVerifyRequest]) (*connect.Response[mfav1.MfaVerifyResponse], error) {
	resp, err := h.MfaServer.MfaVerification(ctx, req.Msg)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(resp), nil
}

type productConnectHandler struct{ *server.ProductServer }

func (h *productConnectHandler) GetProductPdfReport(ctx context.Context, req *connect.Request[productv1.GetProductReportRequest]) (*connect.Response[productv1.GetProductReportResponse], error) {
	resp, err := h.ProductServer.GetProductPdfReport(ctx, req.Msg)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(resp), nil
}

func (h *productConnectHandler) GetProductList(ctx context.Context, req *connect.Request[productv1.GetProductListRequest]) (*connect.Response[productv1.GetProductListResponse], error) {
	resp, err := h.ProductServer.GetProductList(ctx, req.Msg)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(resp), nil
}

func (h *productConnectHandler) GetProductSearch(ctx context.Context, req *connect.Request[productv1.GetProductSearchRequest]) (*connect.Response[productv1.GetProductSearchResponse], error) {
	resp, err := h.ProductServer.GetProductSearch(ctx, req.Msg)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(resp), nil
}

type saleConnectHandler struct{ *server.SalesServer }

func (h *saleConnectHandler) GetSales(ctx context.Context, req *connect.Request[salev1.GetSalesRequest]) (*connect.Response[salev1.GetSalesResponse], error) {
	resp, err := h.SalesServer.GetSales(ctx, req.Msg)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(resp), nil
}

type uploadConnectHandler struct{ *server.UploadImageServer }

func (h *uploadConnectHandler) UploadProfilePicture(ctx context.Context, req *connect.Request[uploadv1.UserPictureRequest]) (*connect.Response[uploadv1.UserPictureResponse], error) {
	resp, err := h.UploadImageServer.UploadProfilePicture(ctx, req.Msg)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(resp), nil
}

type userConnectHandler struct{ *server.UserServer }

func (h *userConnectHandler) GetUser(ctx context.Context, req *connect.Request[userv1.GetUserRequest]) (*connect.Response[userv1.GetUserResponse], error) {
	resp, err := h.UserServer.GetUser(ctx, req.Msg)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(resp), nil
}

func (h *userConnectHandler) GetAllUsers(ctx context.Context, req *connect.Request[userv1.GetAllUsersRequest]) (*connect.Response[userv1.GetAllUsersResponse], error) {
	resp, err := h.UserServer.GetAllUsers(ctx, req.Msg)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(resp), nil
}

func (h *userConnectHandler) UpdateUserProfile(ctx context.Context, req *connect.Request[userv1.UpdateUserProfileRequest]) (*connect.Response[userv1.UpdateUserProfileResponse], error) {
	resp, err := h.UserServer.UpdateUserProfile(ctx, req.Msg)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(resp), nil
}

func (h *userConnectHandler) ChangePassword(ctx context.Context, req *connect.Request[userv1.ChangePasswordRequest]) (*connect.Response[userv1.ChangePasswordResponse], error) {
	resp, err := h.UserServer.ChangePassword(ctx, req.Msg)
	if err != nil {
		return nil, err
	}
	return connect.NewResponse(resp), nil
}

func main() {
	dsn := "rey:rey@tcp(127.0.0.1:3306)/golang_grpc?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	// 2. Initialize Service Implementations
	registerServer := &server.RegisterServer{DB: db}
	loginServer := &server.LoginServer{DB: db}
	userServer := &server.UserServer{DB: db}
	mfaServer := &server.MfaServer{DB: db}
	uploadImageServer := &server.UploadImageServer{DB: db}
	productServerInst := &server.ProductServer{DB: db}
	saleServer := &server.SalesServer{DB: db}

	// 3. Start Gin HTTP + ConnectRPC Server in a goroutine
	go func() {
		r := gin.Default()
		_ = r.SetTrustedProxies(nil)

		r.Use(cors.New(cors.Config{
			AllowOrigins:     []string{"http://localhost:5173"},
			AllowMethods:     []string{"POST", "GET", "OPTIONS"},
			AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Connect-Protocol-Version"},
			ExposeHeaders:    []string{"Content-Length", "Connect-Protocol-Version"},
			AllowCredentials: true,
		}))

		r.Use(static.Serve("/", static.LocalFile("templates", true)))
		r.Static("/assets", "./assets")

		r.GET("/", func(c *gin.Context) {
			c.HTML(200, "index.html", gin.H{"title": "Main Page"})
		})

		// ConnectRPC Route Registration
		connectGroup := r.Group("/")
		{
			registerConnect(connectGroup, func() (string, http.Handler) {
				return registerv1connect.NewAccountServiceHandler(&registerConnectHandler{RegisterServer: registerServer})
			})
			registerConnect(connectGroup, func() (string, http.Handler) {
				return loginv1connect.NewLoginServiceHandler(&loginConnectHandler{LoginServer: loginServer})
			})
			registerConnect(connectGroup, func() (string, http.Handler) {
				return mfav1connect.NewMfaServiceHandler(&mfaConnectHandler{MfaServer: mfaServer})
			})
			registerConnect(connectGroup, func() (string, http.Handler) {
				return productv1connect.NewProductServiceHandler(&productConnectHandler{ProductServer: productServerInst})
			})
			registerConnect(connectGroup, func() (string, http.Handler) {
				return salev1connect.NewSalesServiceHandler(&saleConnectHandler{SalesServer: saleServer})
			})
			registerConnect(connectGroup, func() (string, http.Handler) {
				return uploadv1connect.NewUploadPictureServiceHandler(&uploadConnectHandler{UploadImageServer: uploadImageServer})
			})
			registerConnect(connectGroup, func() (string, http.Handler) {
				return userv1connect.NewUserServiceHandler(&userConnectHandler{UserServer: userServer})
			})
		}

		log.Println("Gin HTTP + ConnectRPC Server running on port :8080")
		if err := r.Run(":8080"); err != nil {
			log.Fatalf("failed to run Gin server: %v", err)
		}
	}()

	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	grpcServer := grpc.NewServer()

	registerv1.RegisterAccountServiceServer(grpcServer, registerServer)
	loginv1.RegisterLoginServiceServer(grpcServer, loginServer)
	userv1.RegisterUserServiceServer(grpcServer, userServer)
	mfav1.RegisterMfaServiceServer(grpcServer, mfaServer)
	uploadv1.RegisterUploadPictureServiceServer(grpcServer, uploadImageServer)
	productv1.RegisterProductServiceServer(grpcServer, productServerInst)
	salev1.RegisterSalesServiceServer(grpcServer, saleServer)

	reflection.Register(grpcServer)

	log.Println("gRPC Server running on port :50051")
	if err := grpcServer.Serve(lis); err != nil {
		log.Fatalf("failed to serve gRPC: %v", err)
	}
}

func registerConnect(group *gin.RouterGroup, handlerRoute func() (string, http.Handler)) {
	path, handler := handlerRoute()
	group.Any(path+"/*action", gin.WrapH(handler))
}
