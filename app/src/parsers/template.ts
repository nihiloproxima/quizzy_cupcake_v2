import _ from "lodash";
import { slugGenerator } from "@/lib/slug_generator";
import { Timestamp } from "firebase/firestore";
import type { Template } from "@/models/template.model";
import type { DocumentSnapshot } from "@firebase/firestore";

export function parseTemplate(snap: DocumentSnapshot): Template {
  if (!snap.exists()) {
    throw new Error(
      `This template does not exist: ${snap.id} (${snap.ref.path})`
    );
  }

  const templateDefault = {
    id: snap.id,
    name: "",
    slug: slugGenerator(),
    cover_url: "/icon.png",
    questions: [],
    visibility: "private",
    tags: Array<string>,
    completed: 0,
    created_at: Timestamp.now,
  };

  return _.defaultsDeep(snap.data(), templateDefault);
}
