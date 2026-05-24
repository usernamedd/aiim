# AIIM 后端 · M1 实现计划
> 基础框架 + 认证 + WebSocket 基础设施
> 版本: v1.0 | 状态: 待开发 | 日期: 2026-05-24

---

## 🎯 M1 交付目标

**M1** 是后端的地基，完成后应具备：
1. 可运行的 Go Web 服务（`gin` + `gorm`）
2. JWT 认证体系（注册/登录/刷新/登出）
3. WebSocket 实时通信通道
4. 本地开发环境可跑通

---

## 📦 技术栈版本（锁定）

```json
{
  "language": "Go 1.22",
  "web": "Gin v1.10",
  "orm": "GORM v1.25 (SQLite dev, PostgreSQL prod)",
  "websocket": "gorilla/websocket v1.5",
  "jwt": "golang-jwt/v5 v5.2",
  "bcrypt": "golang.org/x/crypto/bcrypt",
  "log": "go.uber.org/zap v1.27",
  "config": "github.com/spf13/viper v1.18"
}
```

---

## 📁 项目结构

```
projects/backend/
├── cmd/
│   └── server/
│       └── main.go              ← 入口
├── internal/
│   ├── config/
│   │   └── config.go            ← 配置加载（Viper）
│   ├── model/
│   │   ├── user.go              ← 用户模型
│   │   └── session.go           ← 会话/Token模型
│   ├── repository/
│   │   ├── user_repo.go         ← 用户数据层
│   │   └── session_repo.go      ← 会话数据层
│   ├── service/
│   │   ├── auth_service.go      ← 认证业务逻辑
│   │   └── user_service.go      ← 用户业务逻辑
│   ├── handler/
│   │   ├── auth_handler.go      ← 认证 HTTP 处理
│   │   └── user_handler.go      ← 用户 HTTP 处理
│   ├── middleware/
│   │   ├── auth.go              ← JWT 鉴权中间件
│   │   ├── cors.go              ← CORS 中间件
│   │   └── logger.go            ← 请求日志中间件
│   └── websocket/
│       ├── hub.go               ← WS 连接管理中心
│       ├── client.go             ← 单个 WS 客户端
│       └── message.go            ← 消息定义
├── pkg/
│   ├── response/
│   │   └── response.go          ← 统一响应格式
│   └── errors/
│       └── errors.go            ← 统一错误定义
├── migrations/
│   └── 001_initial.sql          ← 初始化 SQL（Users表）
├── config.yaml                  ← 开发环境配置
├── go.mod
├── go.sum
└── Makefile
```

---

## 🔢 任务分解

### 模块 1：项目脚手架 + 配置

#### 1.1 初始化 Go Module

```bash
cd projects/backend
go mod init github.com/aiim/backend
```

#### 1.2 安装依赖

```bash
# 所有依赖一次装完
go get github.com/gin-gonic/gin@v1.10
go get gorm.io/gorm@v1.25
go get gorm.io/driver/sqlite@v1.5
go get github.com/gorilla/websocket@v1.5
go get github.com/golang-jwt/jwt/v5@v5.2
go get golang.org/x/crypto/bcrypt
go get go.uber.org/zap@v1.27
go get github.com/spf13/viper@v1.18
```

#### 1.3 配置文件

```yaml
# config.yaml
app:
  host: "0.0.0.0"
  port: 8080
  env: "development"

database:
  driver: "sqlite"
  dsn: "./aiim.db"

jwt:
  secret: "your-secret-key-change-in-production"
  access_token_ttl:  "15m"
  refresh_token_ttl: "7d"

websocket:
  read_buffer_size:  1024
  write_buffer_size: 1024
  ping_interval: "15s"
  pong_timeout: "60s"
```

#### 1.4 配置加载（Viper）

```go
// internal/config/config.go
type Config struct {
    App      AppConfig
    Database DatabaseConfig
    JWT      JWTConfig
    WebSocket WebSocketConfig
}
```

**任务清单：**
- [ ] `go.mod` 初始化
- [ ] 所有依赖安装
- [ ] `config.yaml` 开发配置
- [ ] `internal/config/config.go` 配置加载逻辑

---

### 模块 2：数据库模型 + 迁移

#### 2.1 User 模型

```go
// internal/model/user.go
type User struct {
    ID           int64     `gorm:"primaryKey;autoIncrement"`
    Username     string    `gorm:"uniqueIndex;size:64;not null"`
    Phone        *string   `gorm:"uniqueIndex;size:20"`
    Email        *string   `gorm:"uniqueIndex;size:128"`
    PasswordHash string    `gorm:"size:255;not null"`
    Nickname     string    `gorm:"size:64"`
    AvatarURL    string    `gorm:"size:512"`
    Bio          string    `gorm:"type:text"`
    IsActive     bool      `gorm:"default:true"`
    LastSeenAt   *time.Time
    CreatedAt    time.Time
    UpdatedAt    time.Time
}
```

#### 2.2 Session 模型

```go
// internal/model/session.go
type Session struct {
    ID        int64     `gorm:"primaryKey;autoIncrement"`
    UserID    int64     `gorm:"index;not null"`
    Token     string    `gorm:"uniqueIndex;size:512;not null"`
    Type      string    `gorm:"size:16;not null"`  // "access" | "refresh"
    ExpiresAt time.Time `gorm:"not null"`
    CreatedAt time.Time
}
```

#### 2.3 初始化迁移 SQL

```sql
-- migrations/001_initial.sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    nickname TEXT,
    avatar_url TEXT,
    bio TEXT,
    is_active INTEGER DEFAULT 1,
    last_seen_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
```

**任务清单：**
- [ ] `internal/model/user.go` User 模型
- [ ] `internal/model/session.go` Session 模型
- [ ] `migrations/001_initial.sql` 建表脚本
- [ ] `internal/database/database.go` 数据库连接逻辑（SQLite 开发）
- [ ] GORM AutoMigrate 自动同步模型

---

### 模块 3：统一响应 + 错误处理

#### 3.1 统一响应格式

```go
// pkg/response/response.go
type Response struct {
    Code    int         `json:"code"`
    Message string      `json:"message"`
    Data    interface{} `json:"data,omitempty"`
}

// 成功
func Success(c *gin.Context, data interface{})
func SuccessWithMessage(c *gin.Context, msg string)

// 失败
func Error(c *gin.Context, code int, message string)
func Error401(c *gin.Context, message string)
func Error403(c *gin.Context, message string)
func Error404(c *gin.Context, message string)
func Error500(c *gin.Context, message string)
```

#### 3.2 统一错误定义

```go
// pkg/errors/errors.go
var (
    ErrUserNotFound      = errors.New("用户不存在")
    ErrInvalidCredential = errors.New("用户名或密码错误")
    ErrTokenExpired      = errors.New("Token 已过期")
    ErrTokenInvalid      = errors.New("Token 无效")
    ErrUserAlreadyExists = errors.New("用户已存在")
    // ...
)
```

**任务清单：**
- [ ] `pkg/response/response.go` 统一响应
- [ ] `pkg/errors/errors.go` 统一错误定义
- [ ] Gin 统一错误处理中间件

---

### 模块 4：认证功能

#### 4.1 注册

```
POST /api/v1/auth/register
Body: { "username": "ddx", "password": "Ddx@123", "email": "ddx@example.com" }
Response: { "code": 0, "message": "注册成功", "data": { "user_id": 1 } }
```

**实现流程：**
1. 参数校验（username 4-32字符，password 长度>=8）
2. 检查 username/email 是否已存在
3. bcrypt 加密密码
4. 插入 users 表
5. 返回 user_id

#### 4.2 登录

```
POST /api/v1/auth/login
Body: { "username": "ddx", "password": "Ddx@123" }
Response: {
    "code": 0,
    "data": {
        "user_id": 1,
        "username": "ddx",
        "access_token": "eyJhb...",
        "refresh_token": "eyJhb...",
        "expires_in": 900
    }
}
```

**实现流程：**
1. 查找用户（username）
2. bcrypt 校验密码
3. 生成 access_token（JWT，15min）+ refresh_token（7天）
4. 写入 sessions 表
5. 更新 last_seen_at
6. 返回 Token + 用户信息

#### 4.3 刷新 Token

```
POST /api/v1/auth/refresh
Body: { "refresh_token": "eyJhb..." }
Response: { "access_token": "...", "expires_in": 900 }
```

**实现流程：**
1. 校验 refresh_token 签名
2. 查找 session，确认未过期
3. 删除旧 session
4. 生成新的 access_token
5. 写入新 session
6. 返回新 access_token

#### 4.4 登出

```
POST /api/v1/auth/logout
Header: Authorization: Bearer <access_token>
Response: { "code": 0, "message": "登出成功" }
```

**实现流程：**
1. JWT 中间件鉴权获取 user_id
2. 删除所有属于该用户的 session
3. 返回成功

**任务清单：**
- [ ] `internal/service/auth_service.go`
  - `Register(username, password, email) (userID, error)`
  - `Login(username, password) (tokens, user, error)`
  - `Refresh(refreshToken) (accessToken, error)`
  - `Logout(userID) error`
- [ ] `internal/handler/auth_handler.go`
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
- [ ] `internal/middleware/auth.go` JWT 中间件（`AuthRequired()`）

---

### 模块 5：用户功能

#### 5.1 获取当前用户资料

```
GET /api/v1/users/me
Header: Authorization: Bearer <access_token>
Response: { "code": 0, "data": { "id": 1, "username": "ddx", ... } }
```

#### 5.2 修改个人资料

```
PUT /api/v1/users/me
Header: Authorization: Bearer <access_token>
Body: { "nickname": "DDX", "bio": "Hello", "avatar_url": "https://..." }
Response: { "code": 0, "message": "更新成功" }
```

#### 5.3 搜索用户

```
GET /api/v1/users/search?q=ddx&page=1&page_size=20
Header: Authorization: Bearer <access_token>
Response: { "code": 0, "data": { "users": [...], "total": 10 } }
```

**任务清单：**
- [ ] `internal/service/user_service.go`
  - `GetProfile(userID) (User, error)`
  - `UpdateProfile(userID, updates) (User, error)`
  - `SearchUsers(query, page, pageSize) (users [], total, error)`
- [ ] `internal/handler/user_handler.go`
  - `GET /api/v1/users/me`
  - `PUT /api/v1/users/me`
  - `GET /api/v1/users/search`
  - `GET /api/v1/users/:id`

---

### 模块 6：WebSocket 实时通信

#### 6.1 Hub（连接管理中心）

```go
// internal/websocket/hub.go
type Hub struct {
    clients    map[int64]*Client  // userID -> Client
    regster    chan *Client
    unregister chan *Client
    broadcast  chan *Message
    mu         sync.RWMutex
}

func (h *Hub) Run()
func (h *Hub) Register(client *Client)
func (h *Hub) Unregister(client *Client)
func (h *Hub) SendToUser(userID int64, msg *Message)
func (h *Hub) Broadcast(msg *Message)  // 群发
```

#### 6.2 Client（单个连接）

```go
// internal/websocket/client.go
type Client struct {
    userID    int64
    conn      *websocket.Conn
    hub       *Hub
    send      chan []byte
    lastPing  time.Time
}

func (c *Client) ReadPump()  // 读协程：处理客户端发来的消息
func (c *Client) WritePump() // 写协程：处理服务端发来的消息
```

#### 6.3 消息类型定义

```go
// internal/websocket/message.go
type WSMessage struct {
    Type      string          `json:"type"`                 // message/ack/ping/pong
    ChatID    int64           `json:"chat_id,omitempty"`    // 聊天ID
    Content   string          `json:"content,omitempty"`   // 文本内容
    ClientMsgID string        `json:"client_msg_id,omitempty"` // 客户端消息ID（用于ACK）
    Metadata  json.RawMessage `json:"metadata,omitempty"`   // 附加信息
}

// 客户端 → 服务端：发送消息
type SendMessageReq struct {
    Type      string `json:"type"`      // "message"
    ChatID    int64  `json:"chat_id"`
    Content   string `json:"content"`
    ClientMsgID string `json:"client_msg_id"`
}

// 服务端 → 客户端：推送消息
type PushMessageReq struct {
    Type      string `json:"type"`      // "message"
    MsgID     int64  `json:"msg_id"`
    ChatID    int64  `json:"chat_id"`
    SenderID  int64  `json:"sender_id"`
    Content   string `json:"content"`
    CreatedAt string `json:"created_at"`
}

// 服务端 → 客户端：消息 ACK
type Ack struct {
    Type        string `json:"type"`           // "ack"
    ClientMsgID string `json:"client_msg_id"`
    MsgID       int64  `json:"msg_id"`
    Status      string `json:"status"`         // "delivered"
}
```

#### 6.4 WebSocket 端点

```
WebSocket /ws?token=<access_token>
```

**连接流程：**
1. 客户端升级 HTTP → WebSocket
2. 鉴权：解析 token，获取 userID
3. 注册到 Hub
4. 启动 ReadPump + WritePump

**断线处理：**
- 心跳：客户端每 15s 发 `ping`，服务端回复 `pong`
- 超时：60s 无响应则断开
- 重连：客户端自动重连，发送离线期间消息（按时间戳拉取）

**任务清单：**
- [ ] `internal/websocket/hub.go` 连接管理中心（注册/注销/广播）
- [ ] `internal/websocket/client.go` 单连接客户端（读写Pump）
- [ ] `internal/websocket/message.go` 消息类型定义
- [ ] `internal/handler/ws_handler.go` WebSocket HTTP 升级处理
- [ ] 心跳机制（ping/pong）
- [ ] JWT 鉴权（WebSocket 升级时验证）

---

### 模块 7：消息收发（基础版）

#### 7.1 私聊消息模型

```go
// internal/model/message.go
type Message struct {
    ID        int64           `gorm:"primaryKey;autoIncrement"`
    ChatID    int64           `gorm:"index;not null"`
    SenderID  int64           `gorm:"index;not null"`
    Content   string          `gorm:"type:text;not null"`
    Type      string          `gorm:"size:16;default:text"`
    Metadata  string          `gorm:"type:text"`   // JSON
    CreatedAt time.Time
}
```

#### 7.2 WebSocket 发送消息

```
客户端 → 服务端：
{
    "type": "message",
    "chat_id": 123,
    "content": "你好",
    "client_msg_id": "uuid-v4"
}

服务端 → 接收方：
{
    "type": "message",
    "msg_id": 456,
    "chat_id": 123,
    "sender_id": 789,
    "content": "你好",
    "created_at": "2026-05-24T10:00:00Z"
}

服务端 → 发送方（ACK）：
{
    "type": "ack",
    "client_msg_id": "uuid-v4",
    "msg_id": 456,
    "status": "delivered"
}
```

**实现流程（发送消息）：**
1. 接收 WS `SendMessageReq`
2. 鉴权（发送者是否在 chat 参与者中）
3. 写入 messages 表（ContentType=text）
4. 生成 MsgID
5. 调用 Hub.SendToUser(接收方, PushMessageReq)
6. 推送 ACK 给发送方

#### 7.3 拉取历史消息

```
GET /api/v1/chats/:chat_id/messages?page=1&page_size=20&before=<msg_id>
Header: Authorization: Bearer <access_token>
Response: {
    "code": 0,
    "data": {
        "messages": [...],
        "has_more": true
    }
}
```

**任务清单：**
- [ ] `internal/model/message.go` 消息模型
- [ ] `internal/handler/chat_handler.go` 历史消息接口
- [ ] WS `message` 类型处理（发送 + 存储 + 推送）
- [ ] WS `ack` 类型处理（发送方ACK）
- [ ] WebSocket `ping/pong` 心跳处理

---

### 模块 8：主程序入口 + 中间件组装

```go
// cmd/server/main.go
func main() {
    // 加载配置
    cfg := config.Load()
    
    // 初始化数据库
    db := database.Init(cfg)
    
    // 初始化 WebSocket Hub
    hub := websocket.NewHub()
    go hub.Run()
    
    // 设置 Gin Router
    r := gin.New()
    r.Use(middleware.Logger(zap.L()))
    r.Use(middleware.Recovery())
    r.Use(middleware.CORS())
    
    // 注册路由
    authHandler := handler.NewAuthHandler(authService)
    userHandler := handler.NewUserHandler(userService)
    wsHandler := handler.NewWSHandler(hub)
    
    api := r.Group("/api/v1")
    {
        auth := api.Group("/auth")
        {
            auth.POST("/register", authHandler.Register)
            auth.POST("/login", authHandler.Login)
            auth.POST("/refresh", authHandler.Refresh)
            auth.POST("/logout", authHandler.Logout)
        }
        
        users := api.Group("/users")
        {
            users.Use(middleware.AuthRequired(jwtService))
            users.GET("/me", userHandler.GetProfile)
            users.PUT("/me", userHandler.UpdateProfile)
            users.GET("/search", userHandler.SearchUsers)
            users.GET("/:id", userHandler.GetUser)
        }
        
        chats := api.Group("/chats")
        {
            chats.Use(middleware.AuthRequired(jwtService))
            chats.GET("/:chat_id/messages", chatHandler.GetMessages)
        }
    }
    
    // WebSocket 端点
    r.GET("/ws", wsHandler.HandleWebSocket)
    
    // 启动服务
    r.Run(cfg.App.Host + ":" + cfg.App.Port)
}
```

**任务清单：**
- [ ] `cmd/server/main.go` 入口组装
- [ ] `Makefile` 开发常用命令（`make run` / `make migrate` / `make test`）

---

## 🔢 开发顺序（依赖关系）

```
Step 1: 脚手架
├── go mod init
├── config.yaml + config.go
└── Makefile

Step 2: 模型 + 数据库
├── model/user.go + model/session.go + model/message.go
├── migrations/001_initial.sql
└── database.go 连接

Step 3: 响应 + 错误
├── pkg/response/response.go
└── pkg/errors/errors.go

Step 4: 认证（不依赖数据库外的任何东西）
├── auth_service (Register/Login/Refresh/Logout)
├── auth_handler (4个HTTP接口)
└── middleware/auth.go (JWT中间件)

Step 5: 用户模块（依赖认证中间件）
├── user_service
└── user_handler (GET /me, PUT /me, GET /search, GET /:id)

Step 6: WebSocket Hub
├── hub.go
├── client.go
├── message.go
└── ws_handler.go (WebSocket升级 + 注册)

Step 7: 消息收发
├── message 模型
├── 发送消息流程 (WS message 类型处理)
├── ACK 流程
├── 历史消息拉取 (API)
└── ping/pong 心跳

Step 8: 入口组装
├── main.go 组装所有模块
└── Makefile 添加启动命令
```

---

## ⚠️ 风险点

| 风险 | 应对 |
|------|------|
| WebSocket 并发读写 | `sync.RWMutex` + channel buffer，避免数据竞争 |
| Token 安全 | refresh_token 一次一换，logout 时删除所有 session |
| 并发写入 messages | GORM 事务保护，WebSocket 推送失败不阻塞主流程 |
| 断线重连 | Hub 用 `userID` 映射，删除时注意 map 并发安全 |
| CORS | 开发环境允许 `localhost:*`，生产环境配白名单 |

---

## ✅ 验收标准（M1 完成条件）

- [ ] `POST /api/v1/auth/register` 注册成功，返回 user_id
- [ ] `POST /api/v1/auth/login` 登录成功，返回 access_token + refresh_token
- [ ] `POST /api/v1/auth/refresh` refresh_token 换取新的 access_token
- [ ] `POST /api/v1/auth/logout` 登出成功，session 删除
- [ ] `GET /api/v1/users/me` 获取当前用户资料
- [ ] `PUT /api/v1/users/me` 更新个人资料成功
- [ ] WebSocket `/ws` 连接成功（带 token）
- [ ] 发送消息后，对方能实时收到推送
- [ ] 发送消息后，能收到 ACK（带 msg_id）
- [ ] `GET /api/v1/chats/:chat_id/messages` 能拉取历史消息
- [ ] 服务启动后能用 `curl` 或 Postman 测试所有接口
- [ ] `make run` 能本地启动服务

---

*M1 完成可进入 M2：预置 Agent（软件工程/金融/医疗）+ AI Gateway*
