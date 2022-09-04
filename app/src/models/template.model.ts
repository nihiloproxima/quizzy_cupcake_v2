import type { Timestamp } from "@firebase/firestore";

export type Template = {
  id: string;
  slug: string;
  name: string;
  cover_url: string;
  questions: Array<Question>;
  visibility: "public" | "private";
  tags: Array<string>;
  completed: number;
  created_at: Timestamp;
};

export type Question = {
  title: string;
  answers: Array<Answer>;
};

export type Answer = {
  text: string;
  valid: boolean;
};
