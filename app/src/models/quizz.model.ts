import type { Timestamp } from '@firebase/firestore';

export type Quizz = {
	id: string;
	slug: string;
	name: string;
	cover_url: string;
	questions: Array<Question>;
	visibility: 'public' | 'private';
	tags: Array<string>;
	user_id: string;
	completed: number;
	created_at: Timestamp;
};

export type Question = {
	title: string;
	image_url?: string;
	answers: Array<Answer>;
};

export type Answer = {
	text: string;
	valid: boolean;
};
