package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// 统一响应结构
type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// Success 成功响应
func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: "ok",
		Data:    data,
	})
}

// Created 创建成功
func Created(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, Response{
		Code:    0,
		Message: "created",
		Data:    data,
	})
}

// Error 错误响应（自动根据错误类型映射状态码）
func Error(c *gin.Context, err error) {
	code, msg := mapDomainError(err)
	c.JSON(code, Response{
		Code:    code,
		Message: msg,
	})
}

// mapDomainError 将领域错误映射为 HTTP 状态码
func mapDomainError(err error) (int, string) {
	switch err.Error() {
	case "user not found":
		return http.StatusNotFound, err.Error()
	case "user already exists", "username already taken", "email already taken":
		return http.StatusConflict, err.Error()
	case "invalid credentials", "token expired", "token invalid", "token missing",
		"session not found", "session expired", "refresh token invalid":
		return http.StatusUnauthorized, err.Error()
	case "not a chat member", "not authorized":
		return http.StatusForbidden, err.Error()
	case "chat not found", "message not found":
		return http.StatusNotFound, err.Error()
	case "invalid input":
		return http.StatusBadRequest, err.Error()
	default:
		return http.StatusInternalServerError, "internal server error"
	}
}