package api

import (
	"fmt"
	"net/http"
	"time"

	"quizzy_cupcake/db"
	"quizzy_cupcake/models"

	"github.com/gin-gonic/gin"
)

func CreateUser(clients *db.Clients) gin.HandlerFunc {
	type response struct {
		Status string `json:"status"`
	}

	type body struct {
		Email string `json:"email"`
	}

	return func(c *gin.Context) {
		var params body
		if err := c.ShouldBindJSON(&params); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		token := c.Request.Header.Get("Authorization")

		userId, err := db.GetUserId(c.Request.Context(), clients, token)
		if err != nil {
			fmt.Printf("Error: %s", err)
			return
		}

		user := &models.User{
			Id:      userId,
			Email:   params.Email,
			Created: time.Now(),
		}

		db.CreateUser(c.Request.Context(), clients, user)

		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	}
}
