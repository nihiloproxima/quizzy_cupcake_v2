import type { Timestamp } from '@firebase/firestore';

export type Quizz = {
	id: string;
	slug: string;
	name: string;
	thumbnail: string | null;
	questions: Array<Question>;
	visibility: 'public' | 'private';
	tags: Array<string>;
	user_id: string;
	completed: number;
	created_at: Timestamp;
};

export type Question = {
	title: string;
	image_url: string | null;
	answers: Array<Answer>;
};

export type Answer = {
	text: string;
	valid: boolean;
};
