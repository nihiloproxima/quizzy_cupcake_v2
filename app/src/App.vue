<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { auth } from "./lib/db";
import { onAuthStateChanged } from "firebase/auth";
import { reactive } from "@vue/runtime-core";
import Navbar from "./components/Navbar.vue";
import { useUserStore } from "./stores/user.store";

const userStore = useUserStore();

onAuthStateChanged(auth, async (authUser) => {
  if (authUser) {
    const token = await authUser.getIdToken();
    localStorage.setItem("token", token);
    return userStore.set(authUser.uid);
  } else {
    localStorage.removeItem("token");
    return userStore.remove();
  }
});
</script>

<template>
  <div v-if="userStore.user">
    <Navbar />

    <main class="mt-20">
      <RouterView />
    </main>
  </div>
  <div v-else>
    <RouterView />
  </div>
</template>
