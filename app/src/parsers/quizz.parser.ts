import _ from 'lodash';
import { slugGenerator } from '@/lib/slug_generator';
import { Timestamp } from 'firebase/firestore';
import type { Quizz } from '@/models/quizz.model';
import type { DocumentSnapshot } from '@firebase/firestore';

export function parseQuizz(snap: DocumentSnapshot): Quizz {
	if (!snap.exists()) {
		throw new Error(`This quizz does not exist: ${snap.id} (${snap.ref.path})`);
	}

	const quizzDefault: Quizz = {
		id: snap.id,
		name: '',
		slug: slugGenerator(),
		thumbnail: '/icon.png',
		questions: [],
		visibility: 'private',
		tags: [],
		user_id: '',
		completed: 0,
		created_at: Timestamp.now(),
	};

	return _.defaultsDeep(snap.data(), quizzDefault);
}
