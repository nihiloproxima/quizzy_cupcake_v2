<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { doc, addDoc, getFirestore, setDoc } from '@firebase/firestore';
import { collection, Timestamp } from 'firebase/firestore';
import { firebaseApp } from '../lib/db';
import { slugGenerator } from '../lib/slug_generator';
import { useUserStore } from '../stores/user.store';
import type { Quizz } from '../models/quizz.model';

const db = getFirestore(firebaseApp);
const userStore = useUserStore();
const route = useRoute();

async function createQuizz() {
	const template: Partial<Quizz> = {
		slug: slugGenerator(),
		thumbnail: null,
		name: 'Mon super Quizz!',
		questions: [],
		tags: [],
		completed: 0,
		user_id: userStore.user?.id ?? '',
		created_at: Timestamp.now(),
	};
	const ref = collection(db, 'quizzs');
	const docRef = await addDoc(ref, template);

	const templatesRef = doc(db, `users/${userStore.user!.id}/templates/${docRef.id}`);
	await setDoc(templatesRef, {
		id: docRef.id,
		created_at: Timestamp.now(),
	});
}
</script>

<template>
	<nav
		class="px-2 sm:px-4 py-2.5 dark:bg-gray-800 fixed w-full z-20 top-0 left-0 border-b border-gray-200 dark:border-gray-600"
	>
		<div class="container flex flex-wrap justify-between items-center mx-auto">
			<RouterLink to="/" class="flex items-center">
				<img src="/icon.png" class="mr-3 h-6 sm:h-9" alt="Flowbite Logo" />
				<span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Quizzy Cupcake</span>
			</RouterLink>
			<div v-if="route.path == '/'" class="flex md:order-2 pt-2">
				<button
					type="button"
					class="text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
					@click="createQuizz()"
				>
					Créer un nouveau quizz
				</button>
			</div>
		</div>
	</nav>
</template>
