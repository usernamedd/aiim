package persistence

import (
	"fmt"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// DB GORM 数据库封装
type DB struct {
	*gorm.DB
}

// NewDB 根据 driver 创建数据库连接
func NewDB(driver, dsn string) (*DB, error) {
	var dial gorm.Dialector
	switch driver {
	case "sqlite":
		dial = sqlite.Open(dsn)
	case "postgres":
		// postgres://user:password@localhost:5432/aiim?sslmode=disable
		dial = nil // TODO: add pg driver
	default:
		return nil, fmt.Errorf("unsupported database driver: %s", driver)
	}

	db, err := gorm.Open(dial, &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// 自动迁移（开发阶段）
	// 生产用 migration SQL 文件
	if driver == "sqlite" {
		if err := autoMigrate(db); err != nil {
			return nil, err
		}
	}

	return &DB{db}, nil
}

func autoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&UserGORM{},
		&SessionGORM{},
		&ChatGORM{},
		&ChatMemberGORM{},
		&MessageGORM{},
	)
}