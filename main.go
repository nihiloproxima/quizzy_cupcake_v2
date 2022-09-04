package main

import (
	"context"
	"net/http"
	"quizzy_cupcake/api"
	"quizzy_cupcake/db"

	"github.com/gin-gonic/gin"
)

func redirect(w http.ResponseWriter, req *http.Request) {
	http.Redirect(w, req,
		"https://"+req.Host+req.URL.String(),
		http.StatusMovedPermanently)
}

func main() {
	clients := db.InitClients(context.Background())

	r := gin.Default()

	r.POST("/api/v1/users", api.CreateUser(clients))

	r.StaticFS("/", http.Dir("dist"))

	r.Run() // listen and serve on 0.0.0.0:8080 (for windows "localhost:8080")
}
