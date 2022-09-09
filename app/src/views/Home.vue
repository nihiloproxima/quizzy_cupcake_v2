<script setup lang="ts">
import { reactive } from '@vue/reactivity';
import { computed, onMounted } from '@vue/runtime-core';
import { firebaseApp } from '../lib/db';
import QuizzCard from '../components/QuizzCard.vue';
import type { Quizz } from '../models/quizz.model';
import { onSnapshot } from '@firebase/firestore';
import { collection, getFirestore, query, where } from 'firebase/firestore';
import { useUserStore } from '../stores/user.store';
import { parseQuizz } from '../parsers/quizz.parser';
import { ref } from 'vue';

const db = getFirestore(firebaseApp);
const userStore = useUserStore();
const selectedTemplate = ref<Quizz | null>(null);

const user = computed(() => userStore.user ?? null);
const quizzs = ref<Array<Quizz>>([]);

onMounted(() => {
	if (user.value) {
		const q = query(collection(db, 'quizzs'), where('user_id', '==', user.value.id));
		onSnapshot(q, (querySnapshot) => {
			quizzs.value = [];
			querySnapshot.forEach((doc) => quizzs.value.push(parseQuizz(doc)));
		});
	}
});
</script>

<template>
	<div class="p-10">
		<div class="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
			<div class="col-span-1 place-content-center" v-for="(item, index) in quizzs" :key="index">
				<QuizzCard @select-template="selectedTemplate = item" :quizz="item" />
			</div>
		</div>
	</div>
</template>
