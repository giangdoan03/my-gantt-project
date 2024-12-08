import { createRouter, createWebHistory } from "vue-router";
import LoginForm from "@/views/LoginForm.vue";
import DashboardPage from "@/views/DashboardPage.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";

const routes = [
    // Route Login không sử dụng DefaultLayout
    {
        path: "/",
        name: "Login",
        component: LoginForm,
    },

    // Các route sử dụng DefaultLayout
    {
        path: "/dashboard",
        component: DefaultLayout,
        meta: { requiresAuth: true }, // Route yêu cầu xác thực
        children: [
            // Trang Dashboard
            {
                path: "",
                name: "DashboardPage",
                component: DashboardPage,
            },

            // Trang hợp đồng
            {
                path: "contracts",
                name: "ContractsList",
                component: () => import("@/views/ContractsList.vue"), // Component hiển thị danh sách hợp đồng
            },
            {
                path: "/contracts/:id",
                name: "ContractDetails", // Tên route
                component: () => import("@/views/ContractDetails.vue"), // Component chi tiết hợp đồng
                props: true, // Cho phép truyền tham số id dưới dạng props
            },

            // Trang biểu đồ gantt chart
            {
                path: "chart",
                name: "SalesContract",
                component: () => import("@/views/SalesContract.vue"),
            },

            // Trang danh sách vai trò
            {
                path: "roles",
                name: "RolesList",
                component: () => import("@/views/RolesList.vue"),
            },

            // Trang thêm mới hoặc chỉnh sửa vai trò
            {
                path: "roles/add",
                name: "AddRole",
                component: () => import("@/views/AddRole.vue"),
            },
            {
                path: "roles/:id/edit",
                name: "EditRole",
                component: () => import("@/views/AddRole.vue"),
            },
            // Trang danh sách người dùng
            {
                path: "users",
                name: "UserList",
                component: () => import("@/views/UserList.vue"),
            },
            {
                path: "users/add",
                name: "AddUser",
                component: () => import("@/views/UserForm.vue"),
            },
            {
                path: "/users/edit/:id",
                name: "EditUser",
                component: () => import("@/views/UserForm.vue"), // Form chỉnh sửa người dùng
                props: true, // Cho phép nhận tham số "id"
            },
            // **Trang khách hàng**
            {
                path: "customers",
                name: "CustomersList",
                component: () => import("@/views/CustomersList.vue"), // Component hiển thị danh sách khách hàng
            },
            {
                path: "/customers/:id",
                name: "CustomerDetails",
                component: () => import("@/views/CustomerDetails.vue"), // Component chi tiết khách hàng
                props: true, // Cho phép truyền tham số id dưới dạng props
            },
            {
                path: "/customers/edit/:id",
                name: "EditCustomer",
                component: () => import("@/views/EditCustomer.vue"), // Component sửa khách hàng
            },
        ],
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
