<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { signInWithEmailAndPassword, signInWithPopup } from '@firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/db';
import router from '../router';
import { onMounted } from '@vue/runtime-core';
import { reactive } from 'vue';

import type { UserCredential } from 'firebase/auth';

const state = reactive({
	email: '',
	password: '',
});

onMounted(() => {
	if (localStorage.getItem('token')) {
		router.push('/');
	}

	if (auth.currentUser) {
		router.push('/');
	}
});

async function loginWithGoogle(event: any) {
	event.preventDefault();
	let provider = new GoogleAuthProvider();

	try {
		const response = await signInWithPopup(auth, provider);
		await handleSuccess(response);
	} catch (error: any) {
		console.error(error);
	}
}

async function loginWithEmailAndPassword(event: any) {
	event.preventDefault();
	try {
		const response = await signInWithEmailAndPassword(auth, state.email, state.password);
		await handleSuccess(response);
	} catch (error: any) {
		console.error(error);
	}
}

async function handleSuccess(response: UserCredential) {
	if (response.user) {
		// This gives you a Google Access Token. You can use it to access the Google API.
		const token = await response.user.getIdToken();
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
					<img src="/icon.png" class="h-28 w-auto m-auto" />
					<h1 class="text-5xl font-bold text-white">Let's make a quizz!</h1>
					<p class="text-2xl text-white">Welcome to Quizzy Cupcake!</p>
				</div>
			</div>
		</div>
		<div class="px-10 place-self-center w-full">
			<form class="w-full">
				<h1 class="text-white text-2xl font-bold mb-5">Login</h1>

				<div class="mb-6">
					<label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
						>Your email</label
					>
					<input
						type="email"
						v-model="state.email"
						id="email"
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						placeholder="jon@snow.com"
						required
					/>
				</div>
				<div class="mb-6">
					<label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
						>Your password</label
					>
					<input
						type="password"
						v-model="state.password"
						id="password"
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						required
					/>
				</div>

				<RouterLink to="/register" class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
					>I don't have an account</RouterLink
				>"
				<div class="mt-5 flex justify-end">
					<button
						type="submit"
						class="text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"
					>
						Login
					</button>

					<button
						@click="loginWithGoogle($event)"
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
						Log in with Google
					</button>
				</div>
			</form>
		</div>
	</div>
</template>
