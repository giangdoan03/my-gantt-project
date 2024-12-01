import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        token: localStorage.getItem("auth_token") || null,
        user: JSON.parse(localStorage.getItem("auth_user")) || null,
    }),
    actions: {
        setAuthData(token, user) {
            this.token = token;
            this.user = user;
        },
        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
        },
    },
});
