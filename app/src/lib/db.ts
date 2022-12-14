import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAnBHby9C0OxkIz56dM7698pT6zF_QLgDI",
  authDomain: "quizzy-cupcake.firebaseapp.com",
  projectId: "quizzy-cupcake",
  storageBucket: "quizzy-cupcake.appspot.com",
  messagingSenderId: "36767021979",
  appId: "1:36767021979:web:d0a47047a2bc355e53bf3e",
};

export const firebaseApp = initializeApp(firebaseConfig);

export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
