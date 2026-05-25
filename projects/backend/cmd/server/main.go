package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"aiim/internal/adapters/inbound/http"
	"aiim/internal/adapters/outbound/persistence"
	"aiim/internal/adapters/outbound/realtime"
	"aiim/internal/adapters/outbound/token"
	"aiim/internal/config"
	"aiim/internal/domain/service"
	"aiim/internal/ports/outbound"

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

	// Outbound adapters
	userRepo := persistence.NewGORMUserRepo(db)
	sessionRepo := persistence.NewGROMSessionRepo(db)
	chatRepo := persistence.NewGORMChatRepo(db)
	messageRepo := persistence.NewGORMMessageRepo(db)

	tokenSvc := token.NewJWTTokenService(
		config.Config.GetString("jwt.secret"),
		config.Config.GetInt("jwt.access_ttl_minutes"),
		config.Config.GetInt("jwt.refresh_ttl_days"),
	)

	wsHub := realtime.NewWSHub()

	// 设置聊天室广播回调（由 MessageService 发起，Hub 转发给聊天室成员）
	wsHub.SetChatBroadcastHandler(func(chatID string, msg outbound.WSMessage) {
		members, err := chatRepo.GetMembers(context.Background(), chatID)
		if err != nil {
			logger.Info("[BroadcastToChat] 获取成员失败", zap.Error(err))
			return
		}
		var memberIDs []string
		for _, m := range members {
			memberIDs = append(memberIDs, m.ID)
		}
		wsHub.SendToUsers(memberIDs, msg)
	})

	// Domain Services
	authSvc := service.NewAuthService(userRepo, sessionRepo, tokenSvc)
	userSvc := service.NewUserService(userRepo)
	messageSvc := service.NewMessageService(messageRepo, chatRepo, wsHub)

	// Inbound Handlers
	authHandler := http.NewAuthHandler(authSvc)
	userHandler := http.NewUserHandler(userSvc)
	wsHandler := http.NewWSHandler(messageSvc, wsHub, authSvc)
	authMiddleware := http.NewAuthMiddleware(authSvc)
	chatHandler := http.NewChatHandler(messageSvc, authSvc)
	uploadHandler := http.NewUploadHandler()

	// Graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// 启动 WebSocket Hub 事件循环
	go wsHub.Run(ctx)

	router := gin.Default()
	registerRoutes(router, authHandler, userHandler, wsHandler, authMiddleware, chatHandler, uploadHandler)

	// 信号处理（Ctrl+C / SIGTERM）
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-sigCh
		logger.Info("收到退出信号，正在关闭...")
		cancel()
		os.Exit(0)
	}()

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

func registerRoutes(r *gin.Engine, ah *http.AuthHandler, uh *http.UserHandler, wh *http.WSHandler, am *http.AuthMiddleware, ch *http.ChatHandler, up *http.UploadHandler) {
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
		users.Use(am.RequireAuth())
		{
			users.GET("/search", uh.SearchUsers)
			users.GET("/:id", uh.GetUser)
			users.PUT("/profile", uh.UpdateProfile)
		}

		chats := api.Group("/chats")
		chats.Use(am.RequireAuth())
		{
			chats.GET("/", ch.GetRecentChats)
			chats.GET("/:chat_id", ch.GetChatDetail)
			chats.GET("/:chat_id/messages", ch.GetChatMessages)
			chats.GET("/search", ch.SearchChats)
			chats.POST("/direct", ch.CreateDirectChat)
			chats.POST("/group", ch.CreateGroup)
			chats.PUT("/:chat_id", ch.UpdateGroupInfo)
			chats.POST("/:chat_id/members", ch.AddMembers)
			chats.DELETE("/:chat_id/members/:user_id", ch.RemoveMember)
			chats.DELETE("/:chat_id/members/me", ch.LeaveGroup)
		}

		api.GET("/ws", wh.HandleWS)

		// 静态文件服务（上传的文件）
		api.Static("/uploads", "uploads")
		api.POST("/upload", am.RequireAuth(), up.HandleUpload)
	}
}