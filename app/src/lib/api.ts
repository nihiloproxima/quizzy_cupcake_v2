import axios from "axios";

const instance = axios.create({
  baseURL: process.env.VUE_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const api: any = {
  post: async (url: string, data: any) => {
    const token = localStorage.getItem("token");

    return instance.post(`/api/v1${url}`, data, {
      headers: {
        Authorization: token || "",
      },
    });
  },

  get: async (url: string, data: any) => {
    const token = localStorage.getItem("token");

    return instance.get(`/api/v1/${url}`, {
      headers: {
        Authorization: token || "",
      },
    });
  },
};
