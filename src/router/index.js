import { createRouter, createWebHistory } from "vue-router";
import LoginForm from "@/views/LoginForm.vue";
import DashboardPage from "@/views/DashboardPage.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";

const routes = [
  {
    path: "/",
    name: "Login",
    component: LoginForm,
  },
  {
    path: "/dashboard",
    component: DefaultLayout,
    children: [
      {
        path: "",
        name: "DashboardPage",
        component: DashboardPage,
      },
    ],
    meta: { requiresAuth: true }, // Route yêu cầu xác thực
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("auth_token"); // Kiểm tra token

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Nếu route yêu cầu xác thực nhưng chưa đăng nhập
    next({ path: "/" }); // Chuyển về trang login
  } else if (to.name === "Login" && isAuthenticated) {
    // Nếu đã đăng nhập mà vào trang login
    next({ path: "/dashboard" }); // Chuyển đến dashboard
  } else {
    next(); // Cho phép tiếp tục
  }
});

export default router;
