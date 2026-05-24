package main

import (
	"fmt"
	"log"
	"os"

	"aiim/internal/adapters/inbound/http"
	"aiim/internal/adapters/outbound/persistence"
	"aiim/internal/adapters/outbound/realtime"
	"aiim/internal/adapters/outbound/token"
	"aiim/internal/config"
	"aiim/internal/domain/service"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func main() {
	cfgPath := "config.yaml"
	if envPath := os.Getenv("AIIM_CONFIG"); envPath != "" {
		cfgPath = envPath
	}
	if err := config.Load(cfgPath); err != nil {
		log.Fatalf("配置加载失败: %v", err)
	}

	logger, _ := zap.NewProduction()
	defer logger.Sync()

	db, err := persistence.NewDB(
		config.Config.GetString("database.driver"),
		config.Config.GetString("database.dsn"),
	)
	if err != nil {
		logger.Fatal("数据库初始化失败", zap.Error(err))
	}

	// Outbound adapters（具体类型，Go 隐式满足接口）
	userRepo := persistence.NewGORMUserRepo(db)
	sessionRepo := persistence.NewGROMSessionRepo(db)
	chatRepo := persistence.NewGORMChatRepo(db)
	messageRepo := persistence.NewGORMMessageRepo(db)
	tokenSvc := token.NewJWTTokenService()
	wsHub := realtime.NewWSHub()

	// Domain Services（注入 Port 接口，具体类型自动满足接口）
	authSvc := service.NewAuthService(userRepo, sessionRepo, tokenSvc)
	userSvc := service.NewUserService(userRepo)
	messageSvc := service.NewMessageService(messageRepo, chatRepo, wsHub)

	// Inbound Handlers
	authHandler := http.NewAuthHandler(authSvc)
	userHandler := http.NewUserHandler(userSvc)
	wsHandler := http.NewWSHandler(messageSvc, wsHub)

	router := gin.Default()
	registerRoutes(router, authHandler, userHandler, wsHandler)

	addr := cfgHostPort()
	logger.Info("🚀 AIIM Backend 启动", zap.String("addr", addr))
	if err := router.Run(addr); err != nil {
		logger.Fatal("服务器启动失败", zap.Error(err))
	}
}

func cfgHostPort() string {
	return fmt.Sprintf("%s:%d",
		config.Config.GetString("app.host"),
		config.Config.GetInt("app.port"))
}

func registerRoutes(r *gin.Engine, ah *http.AuthHandler, uh *http.UserHandler, wh *http.WSHandler) {
	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", ah.Register)
			auth.POST("/login", ah.Login)
			auth.POST("/refresh", ah.RefreshToken)
			auth.POST("/logout", ah.Logout)
		}
		users := api.Group("/users")
		{
			users.GET("/search", uh.SearchUsers)
			users.GET("/:id", uh.GetUser)
			users.PUT("/profile", uh.UpdateProfile)
		}
		api.GET("/ws", wh.HandleWS)
	}
}