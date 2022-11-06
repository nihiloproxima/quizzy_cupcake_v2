import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router';

const router = createRouter({
	history: createWebHashHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: () => import('../views/Home.vue'),
			meta: {
				requiresAuth: true,
			},
		},
		{
			path: '/edit/:id',
			name: 'Edit',
			component: () => import('../views/Edit.vue'),
			meta: {
				requiresAuth: true,
			},
		},
		{
			path: '/quizz/:slug',
			name: 'Quizz',
			component: () => import('../views/Quizz.vue'),
			meta: {
				requiresAuth: false,
			},
		},
		{
			path: '/login',
			name: 'login',
			component: () => import('../views/Login.vue'),
		},
		{
			path: '/register',
			name: 'register',
			component: () => import('../views/Register.vue'),
		},
	],
});

router.beforeEach((to, from, next) => {
	// if user is not logged in and is not on the login page
	const token = localStorage.getItem('token');
	if (!token && to.meta.requiresAuth) {
		next({ name: 'login' });
	}

	next();
});
export default router;
