<script setup lang="ts">
import { RouterLink } from "vue-router";
import { getFirestore, deleteDoc } from "@firebase/firestore";
import { reactive } from "@vue/reactivity";
import { doc } from "firebase/firestore";
import { firebaseApp } from "../lib/db";
import type { Template } from "../models/template.model";
import { useUserStore } from "../stores/user.store";

const userStore = useUserStore();
const db = getFirestore(firebaseApp);

const state = reactive({
  showMenu: false,
});

const props = defineProps<{ template: Template }>();

async function deleteTemplate() {
  const ref = doc(
    db,
    `users/${userStore.user!.id}/templates/${props.template.id}`
  );
  await deleteDoc(ref);
}
</script>

<template>
  <div
    v-if="template"
    class="relative w-full max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700"
  >
    <div class="flex justify-end px-4 pt-4">
      <button
        id="dropdownButton"
        @click="state.showMenu = !state.showMenu"
        data-dropdown-toggle="dropdown"
        class="inline-block text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-1.5"
        type="button"
      >
        <span class="sr-only">Open dropdown</span>
        <svg
          class="w-6 h-6"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"
          ></path>
        </svg>
      </button>
      <!-- Dropdown menu -->
      <div
        id="dropdown"
        v-if="state.showMenu"
        class="absolute top-14 z-10 w-44 text-base list-none bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700"
      >
        <ul class="py-1" aria-labelledby="dropdownButton">
          <li>
            <RouterLink
              :to="`/edit/${template.id}`"
              class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
              >Edit</RouterLink
            >
          </li>
          <li @click="deleteTemplate()">
            <a
              href="#"
              class="block py-2 px-4 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
              >Delete</a
            >
          </li>
        </ul>
      </div>
    </div>
    <div class="flex flex-col items-center pb-10">
      <img
        class="mb-3 w-24 h-24 shadow-lg"
        :src="template.cover_url"
        alt="Bonnie image"
      />
      <h5 class="mb-1 text-xl font-medium text-gray-900 dark:text-white">
        <RouterLink :to="`/edit/${template.id}`">
          {{ template.name }}
        </RouterLink>
      </h5>
      <span class="text-sm text-gray-500 dark:text-gray-400">{{
        template.created_at.toDate().toLocaleString()
      }}</span>
      <div class="flex mt-4 space-x-3 md:mt-6">
        <button
          class="text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
        >
          Share
        </button>
      </div>
    </div>
  </div>
</template>
