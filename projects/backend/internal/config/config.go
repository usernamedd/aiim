package config

import (
	"fmt"
	"strings"

	"github.com/spf13/viper"
)

// Config 全局配置
var Config *viper.Viper

// Load 加载配置
func Load(configPath string) error {
	v := viper.New()

	// 自动环境变量绑定
	v.SetEnvPrefix("AIIM")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	// 配置文件
	v.SetConfigFile(configPath)
	v.SetConfigType("yaml")

	// 读取配置文件
	if err := v.ReadInConfig(); err != nil {
		return fmt.Errorf("failed to read config file: %w", err)
	}

	// 验证必填项
	if !v.IsSet("app.name") {
		return fmt.Errorf("app.name is required")
	}
	if !v.IsSet("database.driver") {
		return fmt.Errorf("database.driver is required")
	}
	if !v.IsSet("jwt.secret") {
		return fmt.Errorf("jwt.secret is required")
	}

	Config = v
	return nil
}

// GetEnv 获取环境（development / production）
func GetEnv() string {
	return Config.GetString("app.env")
}

// IsProduction 是否生产环境
func IsProduction() bool {
	return GetEnv() == "production"
}