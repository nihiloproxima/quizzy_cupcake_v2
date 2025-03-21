package main

import (
	"context"
	"net/http"
	"quizzy_cupcake/api"
	"quizzy_cupcake/db"

	"github.com/gin-gonic/gin"
)

func main() {
	clients := db.InitClients(context.Background())

	r := gin.Default()

	r.StaticFS("/", http.Dir("dist"))
	r.POST("/api/v1/users", api.CreateUser(clients))
	r.NoRoute(func(c *gin.Context) {
		c.Redirect(301, "/")
	})

	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
