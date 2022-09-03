<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { useStore } from "@/stores";
import { auth } from "@/lib/db";
import { onAuthStateChanged } from "firebase/auth";
import { computed } from "@vue/runtime-core";

let user = computed(() => {
  return useStore().state.user;
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in");
  } else {
    console.log("User is signed out");
  }
});
</script>

<template>
  <RouterView />
</template>
