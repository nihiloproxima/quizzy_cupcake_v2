<script setup lang="ts">
import { getFirestore, where, query, collection, getDocs } from 'firebase/firestore';
import { onMounted } from 'vue';
import _ from 'lodash';
import { useRoute } from 'vue-router';
import { firebaseApp } from '../lib/db';
import type { Question, Quizz } from '../models/quizz.model';

const db = getFirestore(firebaseApp);
const route = useRoute();
const quizz = $ref<Quizz | null>(null);
const answers = $ref<Array<{ q: number; a: Array<number> }>>([]);
const finished = $ref<boolean>(false);
const alpha = 'ABCDE';

function hasMultipleAnswers(question: Question): boolean {
	return question.answers.filter((a: any) => a.valid).length > 1;
}

function isSelected(qIndex: number, aIndex: number): boolean {
	return answers.some((answer: any) => answer.q === qIndex && answer.a.includes(aIndex));
}

function backgroundColor(qIndex: number, aIndex: number): string {
	const status = answerStatus(qIndex, aIndex);

	switch (status) {
		case 'correct':
			return 'bg-green-500 border-2 rounded-lg border-green-500';
		case 'incorrect':
			return 'bg-red-500 line-through rounded-lg border-2 border-red-500';
		case 'unanswered':
			return 'border border-green-500 rounded-lg bg-gray-700';
		case 'selected':
			return 'border-2 rounded-lg border-green-500';
		default:
			return 'bg-gray-800 hover:bg-gray-700';
	}
}

function answerStatus(qIndex: number, aIndex: number): string {
	const question = quizz.questions[qIndex];
	const answer = question.answers[aIndex];

	if (finished) {
		if (answer.valid && isSelected(qIndex, aIndex)) {
			return 'correct';
		} else if (!answer.valid && isSelected(qIndex, aIndex)) {
			return 'incorrect';
		} else if (answer.valid && !isSelected(qIndex, aIndex)) {
			return 'unanswered';
		} else {
			return 'neutral';
		}
	} else {
		if (isSelected(qIndex, aIndex)) {
			return 'selected';
		} else {
			return 'neutral';
		}
	}
}

function retry() {
	answers = [];
	finished = false;
}

function clickAnswer(questionIndex: number, answerIndex: number) {
	if (finished) return;

	const question = quizz?.questions[questionIndex] as Question;
	const multipleAnswers = hasMultipleAnswers(question);

	const answer = _.find(answers, { q: questionIndex });
	if (answer) {
		if (!multipleAnswers && answer.a.length > 0) {
			answer.a = [];
		}

		if (answer.a.includes(answerIndex)) {
			answer.a = _.without(answer.a, answerIndex);
		} else {
			answer.a.push(answerIndex);
		}
	} else {
		answers.push({ q: questionIndex, a: [answerIndex] });
	}
}

onMounted(async () => {
	if (route.params.slug) {
		const q = query(collection(db, 'quizzs'), where('slug', '==', route.params.slug));
		const querySnapshots = await getDocs(q);
		if (querySnapshots.size) {
			quizz = querySnapshots.docs[0].data() as Quizz;
		}
	}
});
</script>

<template>
	<div class="md:p-10" v-if="quizz">
		<div class="mx-auto sm:w-2/3 w-full rounded-lg border-2 shadow-md dark:bg-gray-800 dark:border-gray-700">
			<div class="p-6">
				<div class="mb-5">
					<img class="mx-auto mb-3 max-w-lg max-h-80 shadow-lg" :src="quizz.cover_url" alt="Bonnie image" />

					<h5
						id="name"
						class="my-5 text-center mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white"
					>
						{{ quizz.name }}
					</h5>
				</div>

				<!-- Question title -->
				<div
					class="text-xl dark:text-white text-gray-900 front-bold mb-5"
					v-for="(question, index) in quizz.questions"
					:key="index"
				>
					<div class="flex items-stretch px-2 mb-2">
						<h5 class="mb-2 w-full text-2xl font-semibold text-gray-900 dark:text-white">
							{{ index + 1 }}.
							<span> {{ question.title }}</span>
							<span class="ml-2 text-sm" v-if="hasMultipleAnswers(question)"
								>(Plusieurs réponses possibles)</span
							><span class="ml-2 text-sm" v-else>(Une seule réponse possible)</span>
						</h5>
					</div>

					<div v-if="question.image_url" class="my-4">
						<img
							class="max-w-lg h-auto rounded-lg mx-auto max-h-80"
							:src="question.image_url"
							alt="image description"
						/>
					</div>

					<!-- Answers list -->
					<div id="answers" class="rounded-lg divide-y divide-slate-700">
						<div v-for="(answer, answerIndex) in question.answers" :key="answerIndex" class="">
							<div
								@click="clickAnswer(index, answerIndex)"
								class="flex items-stretch p-5"
								:class="backgroundColor(index, answerIndex)"
							>
								<p class="mr-2 font-bold leading-10">{{ alpha[answerIndex] }}</p>
								<p
									:id="`questions-${index}-answers-${answerIndex}`"
									class="mr-2 w-full font-light text-base leading-10"
								>
									{{ answer.text }}
								</p>
							</div>
						</div>
					</div>
				</div>

				<div class="text-center mt-10">
					<button
						v-if="!finished"
						@click="finished = true"
						type="button"
						class="inline-flex text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
					>
						<svg
							class="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
							></path>
						</svg>
						<span class="ml-2"> J'ai terminé ! </span>
					</button>
					<button
						v-else
						@click="retry()"
						type="button"
						class="inline-flex text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
					>
						<svg
							class="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
							></path>
						</svg>
						<span class="ml-2"> Je veux réessayer ! </span>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>
