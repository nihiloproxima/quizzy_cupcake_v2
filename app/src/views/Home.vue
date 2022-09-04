<script setup lang="ts">
import { reactive } from "@vue/reactivity";
import { computed, onMounted } from "@vue/runtime-core";
import { firebaseApp } from "../lib/db";
import TemplateCard from "../components/TemplateCard.vue";
import type { Template } from "../models/template.model";
import { onSnapshot } from "@firebase/firestore";
import { collection, getFirestore } from "firebase/firestore";
import { useUserStore } from "../stores/user.store";
import { parseTemplate } from "@/parsers/template";

const db = getFirestore(firebaseApp);
const userStore = useUserStore();

const user = computed(() => userStore.user ?? null);

let data = reactive<{ templates: Array<Template> }>({ templates: [] });

onMounted(() => {
  if (user.value) {
    onSnapshot(
      collection(db, `users/${user.value.id}/templates`),
      (snapshot) => {
        data.templates = snapshot.docs.map((doc) => parseTemplate(doc));
      }
    );
  }
});
</script>

<template>
  <div class="p-10">
    <div class="grid grid-cols-3 gap-4">
      <div
        class="col-span-1"
        v-for="(item, index) in data.templates"
        :key="index"
      >
        <TemplateCard :template="item" />
      </div>
    </div>
  </div>
</template>
