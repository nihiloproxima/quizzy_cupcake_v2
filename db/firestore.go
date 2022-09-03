package db

import (
	"context"
	"log"
	"quizzy_cupcake/models"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
)

type Clients struct {
	Client *firestore.Client
	Auth   *auth.Client
	App    *firebase.App
}

func InitClients(ctx context.Context) *Clients {
	app, err := firebase.NewApp(ctx, nil)
	if err != nil {
		log.Fatalf("error initializing app: %v\n", err)
	}

	client, err := firestore.NewClient(ctx, "quizzy-cupcake")
	if err != nil {
		log.Fatalf("error getting Client client: %v\n", err)
	}

	auth, err := app.Auth(ctx)
	if err != nil {
		log.Fatalf("error getting Auth client: %v\n", err)
	}

	return &Clients{
		Client: client,
		Auth:   auth,
		App:    app,
	}
}

func GetUserId(ctx context.Context, clients *Clients, token string) (string, error) {

	authToken, err := clients.Auth.VerifyIDToken(ctx, token)
	return authToken.UID, err
}

func CreateUser(ctx context.Context, clients *Clients, user *models.User) {

	ref := clients.Client.Collection("users").Doc(user.Id)
	if _, err := ref.Set(ctx, user); err != nil {
		log.Fatal(err)
	}
}
