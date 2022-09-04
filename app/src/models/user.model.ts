import type { Timestamp } from "firebase/firestore";

export interface User {
  id: string;
  email: string;
  created: Timestamp;
}
