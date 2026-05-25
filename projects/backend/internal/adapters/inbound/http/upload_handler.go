package http

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"aiim/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	maxFileSize = 50 * 1024 * 1024 // 50MB
	uploadDir  = "uploads"
)

// fileExts 允许的图片和文件扩展名
var allowedExts = map[string]string{
	".jpg":  "image/jpeg",
	".jpeg": "image/jpeg",
	".png":  "image/png",
	".gif":  "image/gif",
	".webp": "image/webp",
	".mp4":  "video/mp4",
	".mov":  "video/quicktime",
	".pdf":  "application/pdf",
	".doc":  "application/msword",
	".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	".xls":  "application/vnd.ms-excel",
	".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	".zip":  "application/zip",
	".txt":  "text/plain",
}

// UploadHandler 文件上传处理
type UploadHandler struct{}

func NewUploadHandler() *UploadHandler {
	return &UploadHandler{}
}

// HandleUpload POST /api/v1/upload
// Header: Authorization: Bearer ***
// Form: file (multipart/form-data)
// Response: { "code": 0, "data": { "url": "/uploads/xxx.jpg", "mime_type": "image/jpeg", "size": 12345 } }
func (h *UploadHandler) HandleUpload(c *gin.Context) {
	_, ok := c.Get("userID")
	if !ok {
		response.Error(c, &authError{msg: "unauthorized"})
		return
	}

	file, header, err := c.Request.FormFile("file")
	if err != nil {
		response.Error(c, &inputError{msg: "请选择要上传的文件"})
		return
	}
	defer file.Close()

	// 大小校验
	if header.Size > maxFileSize {
		response.Error(c, &inputError{msg: fmt.Sprintf("文件大小超过限制（最大 %dMB）", maxFileSize/1024/1024)})
		return
	}

	// 扩展名校验
	ext := strings.ToLower(filepath.Ext(header.Filename))
	mimeType, ok := allowedExts[ext]
	if !ok {
		response.Error(c, &inputError{msg: "不支持的文件类型"})
		return
	}

	// 生成唯一文件名
	ext = strings.ToLower(filepath.Ext(header.Filename))
	filename := fmt.Sprintf("%s_%s%s", time.Now().Format("20060102150405"), uuid.New().String()[:8], ext)

	// 确保 uploads 目录存在（使用工作目录作为基准）
	uploadsPath := uploadDir
	if !filepath.IsAbs(uploadDir) {
		// 相对路径：以进程工作目录为准
		wd, err := os.Getwd()
		if err == nil {
			uploadsPath = filepath.Join(wd, uploadDir)
		}
	}
	if err := os.MkdirAll(uploadsPath, 0755); err != nil {
		response.Error(c, &inputError{msg: "服务器内部错误，无法创建上传目录"})
		return
	}

	// 保存文件
	dstPath := filepath.Join(uploadsPath, filename)
	dst, err := os.Create(dstPath)
	if err != nil {
		response.Error(c, &inputError{msg: "无法保存文件"})
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		os.Remove(dstPath)
		response.Error(c, &inputError{msg: "文件写入失败"})
		return
	}

	// 返回相对 URL
	url := "/" + uploadDir + "/" + filename
	response.Success(c, gin.H{
		"url":       url,
		"mime_type": mimeType,
		"size":      header.Size,
		"filename":  header.Filename,
	})
}

// authError / inputError 简单的错误类型（避免引入额外的 errors 包）
type authError struct{ msg string }
type inputError struct{ msg string }

func (e *authError) Error() string   { return e.msg }
func (e *inputError) Error() string { return e.msg }