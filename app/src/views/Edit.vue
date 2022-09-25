<script setup lang="ts">
import _ from 'lodash';
import imageCompression from 'browser-image-compression';
import { computed, onMounted, ref as vueRef } from 'vue';
import { doc, getFirestore, onSnapshot, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, getStorage, ref as storageRef, uploadBytesResumable } from 'firebase/storage';
import { firebaseApp } from '../lib/db';
import { useUserStore } from '../stores/user.store';
import type { Answer, Question, Quizz } from '../models/quizz.model';
import { useRoute } from 'vue-router';
import router from '../router';

const alpha = 'ABCDE';

const userStore = useUserStore();
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
const route = useRoute();
const ref = doc(db, `quizzs/${route.params.id}`);

const quizz = vueRef<Quizz>();
const uploading = vueRef(false);
const uploadProgress = vueRef(0);

const templateId = computed(() => {
	return '';
});

async function input(e: any, prop: string) {
	_.set(quizz, prop, e.target.outerText);
	await save();
}

async function save() {
	return updateDoc(ref, quizz.value);
}

function removeQuestion(question: Question) {
	const index = quizz.value!.questions.indexOf(question);
	quizz.value!.questions.splice(index, 1);
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
		title: 'Question ' + (quizz.value!.questions.length + 1),
		image_url: null,
		answers: [],
	};
	_.set(quizz.value!, 'questions', [...quizz.value!.questions, question]);
	await save();
}

async function newAnswer(index: number) {
	const question = quizz.value!.questions[index];
	const answer: Answer = {
		text: '',
		valid: true,
	};
	_.set(quizz.value!, `questions[${index}].answers`, [...question.answers, answer]);
	await save();

	return focusAnswer(null, index, question.answers.length - 1);
}

function switchValid(questionIndex: number, answerIndex: number, currentValue: boolean) {
	_.set(quizz.value!, `questions[${questionIndex}].answers[${answerIndex}].valid`, !currentValue);
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

function clickFileInput(id: string) {
	const fileInput = document.getElementById(id);
	if (fileInput) {
		fileInput.click();
	}
}

async function removeImage(questionIndex?: number) {
	let fileName = '';
	if (questionIndex !== undefined) {
		const question = quizz.value!.questions[questionIndex];
		const suffix = question.image_url!.split('?')[0].split('.').pop() || '';
		fileName = `${quizz.value!.id}-${questionIndex}.${suffix}`;
	} else {
		const suffix = quizz.value!.thumbnail!.split('?')[0].split('.').pop() || '';
		fileName = `${quizz.value!.id}-thumbnail.${suffix}`;
	}

	const ref = storageRef(storage, `quizzs/${quizz.value!.id}/${fileName}`);
	try {
		await deleteObject(ref);
	} catch (error) {
		console.log(error);
	}

	if (questionIndex !== undefined) {
		_.set(quizz.value!, `questions[${questionIndex}].image_url`, null);
	} else {
		_.set(quizz.value!, 'thumbnail', null);
	}
	save();
}

async function uploadImage(event: any, questionIndex?: number) {
	uploading.value = true;

	const file = event.target.files[0];
	const isImage = file.type.match('image.*');

	if (isImage) {
		const compressedFile = await imageCompression(file, {
			maxSizeMB: 1,
			maxWidthOrHeight: 1920,
			useWebWorker: true,
		});
		const suffix = file.name.split('.').pop();
		const fileName = `${quizz.value!.id}-${questionIndex !== undefined ? questionIndex : 'thumbnail'}.${suffix}`;

		// Create a reference to 'assets/category/file.jpg'
		const imgRef = storageRef(storage, `quizzs/${quizz.value!.id}/${fileName}`);

		// Upload file and metadata to the object 'assets/category/file.jpg'
		const uploadTask = uploadBytesResumable(imgRef, compressedFile, {
			contentType: file.type,
		});

		// Listen for state changes, errors, and completion of the upload.
		uploadTask.on(
			'state_changed', // or 'state_changed'
			(snapshot) => {
				uploadProgress.value = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
				console.log(uploadProgress);
			},
			(error) => {
				console.error(error);
			},
			() => {
				// Upload completed successfully, now we can get the download URL
				getDownloadURL(imgRef).then((downloadURL: string) => {
					if (questionIndex !== undefined) {
						quizz.value!.questions[questionIndex].image_url = downloadURL;
					} else {
						quizz.value!.thumbnail = downloadURL;
					}
					uploadProgress.value = 0;
					uploading.value = false;
					return save();
				});
			}
		);
	}
	// }
}

function hasMultipleAnswer(question: Question): boolean {
	return question.answers.filter((a: any) => a.valid).length > 1;
}

onMounted(() => {
	onSnapshot(ref, (snapshot) => {
		if (!snapshot.exists()) {
			router.push('/');
		}

		quizz.value = { id: snapshot.id, ...snapshot.data() } as Quizz;
		if (quizz.value.user_id !== userStore.user?.id) {
			router.push('/');
		}
	});
});
</script>

<template>
	<div class="md:p-10" v-if="quizz">
		<div
			class="mx-auto sm:w-2/3 w-full bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700"
		>
			<div v-if="uploading" class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
				<div
					class="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full"
					:style="`width: ${uploadProgress}%`"
				></div>
			</div>
			<div class="p-6">
				<h1
					id="name"
					contenteditable
					@blur="input($event, 'name')"
					class="my-5 text-center mb-2 text-4xl font-semibold tracking-tight text-gray-900 dark:text-white"
				>
					{{ quizz.name }}
				</h1>
				<div class="my-5">
					<div class="float-right" v-if="quizz.thumbnail">
						<button
							@click="removeImage()"
							type="button"
							class="text-gray-700 border border-gray-700 hover:bg-gray-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:border-gray-500 dark:text-gray-500 dark:hover:text-white dark:focus:ring-gray-800"
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
						</button>
					</div>
					<img
						v-if="quizz.thumbnail"
						class="mx-auto mb-3 max-w-lg max-h-80 shadow-lg"
						:src="quizz.thumbnail"
					/>
					<div v-else class="flex justify-center items-center w-full">
						<label
							for="dropzone-file"
							class="flex flex-col justify-center items-center w-full h-64 bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed cursor-pointer dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
						>
							<div class="flex flex-col justify-center items-center pt-5 pb-6">
								<svg
									aria-hidden="true"
									class="mb-3 w-10 h-10 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
									></path>
								</svg>
								<p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
									<span class="font-semibold">Cliquez pour ajouter une image</span> ou glissez déposez
								</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">
									SVG, PNG, JPG or GIF (MAX. 800x400px)
								</p>
							</div>
						</label>
						<input id="dropzone-file" type="file" class="hidden" @change="uploadImage($event)" />
					</div>
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
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								></path>
							</svg>
						</button>
					</div>

					<div v-if="question.image_url" class="my-4">
						<div class="float-right mr-4">
							<button
								@click="removeImage(index)"
								type="button"
								class="text-gray-700 border border-gray-700 hover:bg-gray-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:border-gray-500 dark:text-gray-500 dark:hover:text-white dark:focus:ring-gray-800"
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
							</button>
						</div>

						<img
							class="max-w-lg h-auto max-h-80 rounded-lg mx-auto"
							:src="question.image_url"
							alt="image description"
						/>
					</div>

					<div v-else class="flex justify-center">
						<input type="file" @change="uploadImage($event, index)" :id="`img-${index}`" class="hidden" />

						<a
							href="#"
							@click="clickFileInput(`img-${index}`)"
							class="mb-3 font-normal text-gray-500 dark:text-gray-400 flex leading-2"
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
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								></path>
							</svg>
							Ajouter une image
						</a>
					</div>

					<!-- Answers list -->
					<div
						v-for="(answer, answerIndex) in question.answers"
						:key="answerIndex"
						class="flex items-stretch mb-2 px-2"
					>
						<p class="mr-2 font-bold leading-10">{{ alpha[answerIndex] }}</p>
						<p
							:id="`questions-${index}-answers-${answerIndex}`"
							class="mr-2 w-full leading-10 font-light"
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
							class="w-10 h-9 text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center mr-2"
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
						</button>

						<!-- Delete answer -->
						<button
							@click="removeAnswer(question, answer)"
							type="button"
							class="w-10 h-9 mr-2 text-gray-700 border border-gray-700 hover:bg-gray-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:border-gray-500 dark:text-gray-500 dark:hover:text-white dark:focus:ring-gray-800"
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
						</button>
					</div>

					<!-- New answer -->
					<div v-if="question.answers.length < 5" class="flex justify-center">
						<a
							href="#"
							@click="newAnswer(index)"
							class="mb-3 font-normal text-gray-500 dark:text-gray-400 flex leading02"
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
