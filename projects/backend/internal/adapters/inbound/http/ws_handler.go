package http

import (
	"github.com/gin-gonic/gin"
)

type WSHandler struct{}

func NewWSHandler(msgSvc, wsHub interface{}) *WSHandler {
	return &WSHandler{}
}

func (h *WSHandler) HandleWS(c *gin.Context) { c.JSON(200, nil) }