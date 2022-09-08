<script setup lang="ts">
import _ from 'lodash';
import { computed, onMounted, reactive } from 'vue';
import { doc, getFirestore, onSnapshot, updateDoc } from 'firebase/firestore';
import { firebaseApp } from '../lib/db';
import { useUserStore } from '../stores/user.store';
import type { Answer, Question, Template } from '../models/template.model';
import { useRoute } from 'vue-router';
import router from '../router';

const alpha = 'abcde';

const userStore = useUserStore();
const db = getFirestore(firebaseApp);
const route = useRoute();

const ref = doc(db, `users/${userStore.user!.id}/templates/${route.params.id}`);

const state = reactive<{
	template: any;
	uploadedImage: any;
	uploadedFile: any;
}>({
	template: null,
	uploadedImage: null,
	uploadedFile: null,
});

const templateId = computed(() => {
	return '';
});

async function input(e: any, prop: string) {
	_.set(state.template, prop, e.target.outerText);
	await save();
}

async function save() {
	return updateDoc(ref, state.template);
}

function removeQuestion(question: Question) {
	const index = state.template.questions.indexOf(question);
	state.template.questions.splice(index, 1);
	save();
}

function removeAnswer(question: Question, answer: Answer) {
	const index = question.answers.indexOf(answer);
	if (index > -1) {
		question.answers.splice(index, 1);
		return save();
	}
}

async function newQuestion() {
	const question: Question = {
		title: 'Question ' + (state.template.questions.length + 1),
		answers: [],
	};
	_.set(state.template, 'questions', [...state.template.questions, question]);
	await save();
}

async function newAnswer(index: number) {
	const question = state.template.questions[index];
	const answer: Answer = {
		text: '',
		valid: true,
	};
	_.set(state.template, `questions[${index}].answers`, [...question.answers, answer]);
	await save();

	return focusAnswer(null, index, question.answers.length - 1);
}

function switchValid(questionIndex: number, answerIndex: number, currentValue: boolean) {
	_.set(state.template, `questions[${questionIndex}].answers[${answerIndex}].valid`, !currentValue);
	return save();
}

async function focusAnswer(event: any, questionIndex: number, answerIndex: number): Promise<any> {
	if (event) {
		event.preventDefault();
	}

	const elem = document.getElementById(`questions-${questionIndex}-answers-${answerIndex}`);

	if (!elem && answerIndex < 5) {
		await newAnswer(questionIndex);
		return focusAnswer(event, questionIndex, answerIndex);
	}

	if (elem) {
		elem!.focus();
	}
}

function hasMultipleAnswer(question: Question): boolean {
	return question.answers.filter((a: any) => a.valid).length > 1;
}

onMounted(() => {
	onSnapshot(ref, (snapshot) => {
		if (!snapshot.exists()) {
			router.push('/');
		}
		state.template = { id: snapshot.id, ...snapshot.data() } as Template;
	});
});
</script>

<template>
	<div class="md:p-10" v-if="state.template">
		<div
			class="mx-auto sm:w-2/3 w-full bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700"
		>
			<div class="p-6">
				<div class="mb-5">
					<img class="mx-auto mb-3 w-24 h-24 shadow-lg" :src="state.template.cover_url" alt="Bonnie image" />

					<h5
						id="name"
						contenteditable
						@blur="input($event, 'name')"
						class="my-5 text-center mb-2 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white"
					>
						{{ state.template.name }}
					</h5>
				</div>

				<!-- Question title -->
				<div
					class="text-xl dark:text-white text-gray-900 front-bold mb-5"
					v-for="(question, index) in state.template.questions"
					:key="index"
				>
					<div class="flex items-stretch px-2 mb-2">
						<h5 class="mb-2 w-full text-2xl font-semibold text-gray-900 dark:text-white">
							{{ index + 1 }}.
							<span
								contenteditable
								@blur="input($event, `questions[${index}].title`)"
								@keydown.enter="focusAnswer($event, index, 0)"
							>
								{{ question.title }}</span
							>
							<span class="ml-2 text-sm" v-if="hasMultipleAnswer(question)"
								>(Plusieurs réponses possibles)</span
							><span class="ml-2 text-sm" v-else>(Une seule réponse possible)</span>
						</h5>
						<div>
							<button
								@click="removeQuestion(question)"
								type="button"
								class="relative mr-2 text-gray-700 border border-gray-700 hover:bg-gray-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:border-gray-500 dark:text-gray-500 dark:hover:text-white dark:focus:ring-gray-800"
							>
								<svg
									class="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M20 12H4"
									></path>
								</svg>
								<span class="sr-only">Icon description</span>
							</button>
						</div>
					</div>
					<!-- Answers list -->
					<div
						v-for="(answer, answerIndex) in question.answers"
						:key="answerIndex"
						class="flex items-stretch mb-2 px-2"
					>
						<p class="mr-2">{{ alpha[answerIndex] }}.</p>
						<p
							:id="`questions-${index}-answers-${answerIndex}`"
							class="mr-2 w-full"
							contenteditable
							@keydown.enter="focusAnswer($event, index, answerIndex + 1)"
							@blur="input($event, `questions[${index}].answers[${answerIndex}].text`)"
						>
							{{ answer.text }}
						</p>

						<!-- Valid/invalid -->
						<button
							@click="switchValid(index, answerIndex, answer.valid)"
							type="button"
							class="text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center mr-2"
							:class="answer.valid ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-800'"
						>
							<svg
								v-if="answer.valid"
								class="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M5 13l4 4L19 7"
								></path>
							</svg>
							<svg
								v-else
								class="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								></path>
							</svg>
							<span class="sr-only">Icon description</span>
						</button>

						<!-- Delete answer -->
						<button
							@click="removeAnswer(question, answer)"
							type="button"
							class="mr-2 text-gray-700 border border-gray-700 hover:bg-gray-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:border-gray-500 dark:text-gray-500 dark:hover:text-white dark:focus:ring-gray-800"
						>
							<svg
								class="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								></path>
							</svg>
							<span class="sr-only">Icon description</span>
						</button>
					</div>

					<!-- New answer -->
					<div v-if="question.answers.length < 5">
						<a
							href="#"
							@click="newAnswer(index)"
							class="mb-3 font-normal text-gray-500 dark:text-gray-400 flex"
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
									d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
								></path>
							</svg>
							Ajouter une nouvelle réponse
						</a>
					</div>
				</div>

				<div class="text-center mt-10">
					<button
						type="button"
						class="inline-flex text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
						@click="newQuestion()"
					>
						<svg
							class="w-6 h-6 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 6v6m0 0v6m0-6h6m-6 0H6"
							></path>
						</svg>

						Ajouter une question
					</button>
				</div>
			</div>
		</div>
	</div>
</template>
