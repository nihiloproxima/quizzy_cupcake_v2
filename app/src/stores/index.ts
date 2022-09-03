import { defineStore } from "pinia";

export const useStore = defineStore({
  id: "user",
  state: () => ({
    user: null,
  }),
  getters: {
    user: (state) => state.user,
  },
  actions: {},
});
