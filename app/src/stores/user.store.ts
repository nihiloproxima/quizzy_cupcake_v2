import { firebaseApp } from "@/lib/db";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { defineStore } from "pinia";
import { ref } from "vue";

import type { User } from "@/models/user.model";

const db = getFirestore(firebaseApp);

export const useUserStore = defineStore("user", () => {
  let user = ref<User | null>(null);

  async function set(uid: string) {
    const ref = doc(db, "users", uid);
    const snapshot = await getDoc(ref);
    user.value = { ...snapshot.data()!, id: snapshot.id } as User;
  }

  async function remove() {
    user.value = null;
  }

  return { user, set, remove };
});
