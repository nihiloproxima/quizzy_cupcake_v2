package models

import "time"

type User struct {
	Id      string    `firestore:"id"`
	Email   string    `firestore:"email"`
	Created time.Time `firestore:"created,omitempty"`
}
