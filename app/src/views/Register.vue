<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { reactive } from '@vue/reactivity';
import {
	GoogleAuthProvider,
	setPersistence,
	signInWithPopup,
	browserLocalPersistence,
	createUserWithEmailAndPassword,
} from '@firebase/auth';
import { auth } from '../lib/db';
import router from '../router';
import { api } from '@/lib/api';

import type { UserCredential } from 'firebase/auth';

const state = reactive({
	errorMessage: '',
	email: '',
	password: '',
	passwordConfirm: '',
});

async function registerWithGoogle(event: Event) {
	event.preventDefault();
	let provider = new GoogleAuthProvider();

	setPersistence(auth, browserLocalPersistence);

	try {
		const response = await signInWithPopup(auth, provider);
		await handleSuccess(response);
	} catch (e) {
		state.errorMessage = `${e}`;
	}
}

async function registerWithEmailAndPassword(event: Event) {
	event.preventDefault();

	setPersistence(auth, browserLocalPersistence);

	try {
		const response = await createUserWithEmailAndPassword(auth, state.email, state.password);
		await handleSuccess(response);
	} catch (e) {
		state.errorMessage = `${e}`;
	}
}

async function handleSuccess(response: UserCredential) {
	if (response.user) {
		const token = await response.user.getIdToken();

		await api.post('/users', {
			email: response.user.email,
		});

		localStorage.setItem('token', token);

		router.push('/');
	}
}
</script>

<template>
	<div class="grid grid-cols-3 h-screen dark:bg-gray-800">
		<div class="bg-gradient-to-r from-purple-500 to-pink-500 col-span-2">
			<div class="flex items-center justify-center h-full">
				<div class="text-center">
					<h1 class="text-5xl font-bold text-white">Bienvenue sur Quizzy Cupcake !</h1>
					<p class="text-2xl text-white">Vous devez avoir un compte pour créer des quizzs personnalisés</p>
				</div>
			</div>
		</div>
		<div class="px-10 place-self-center w-full">
			<form>
				<h1 class="text-white text-2xl font-bold mb-5">Inscription</h1>
				<div class="mb-6">
					<label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
						>Email</label
					>
					<input
						v-model="state.email"
						type="email"
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						placeholder="jon@snow.com"
						required
					/>
				</div>
				<div class="mb-6">
					<label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
						>Mot de passe</label
					>
					<input
						v-model="state.password"
						type="password"
						id="password"
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						required
					/>
				</div>
				<div class="mb-6">
					<label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
						>Confirmation du mot de passe</label
					>
					<input
						v-model="state.passwordConfirm"
						type="password"
						id="password-confirm"
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						required
					/>
				</div>

				<RouterLink to="/login" class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
					>I already have an account</RouterLink
				>"
				<div class="mt-5 flex justify-end">
					<button
						@click="registerWithEmailAndPassword"
						class="text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
					>
						Register
					</button>

					<button
						@click="registerWithGoogle($event)"
						type="button"
						class="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 mr-2 mb-2"
					>
						<svg
							class="mr-2 -ml-1 w-4 h-4"
							aria-hidden="true"
							focusable="false"
							data-prefix="fab"
							data-icon="google"
							role="img"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 488 512"
						>
							<path
								fill="currentColor"
								d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
							></path>
						</svg>
						Register with Google
					</button>
				</div>
			</form>
		</div>
	</div>
</template>
