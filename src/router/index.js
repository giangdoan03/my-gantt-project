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
                path: "contracts/:id",
                name: "ContractDetails", // Tên route
                component: () => import("@/views/ContractDetails.vue"), // Component chi tiết hợp đồng
                props: true, // Cho phép truyền tham số id dưới dạng props
            },

            // Trang biểu đồ gantt chart
            {
                path: "contracts/:id/chart",
                name: "SalesContract",
                component: () => import("@/views/SalesContract.vue"),
                props: true, // Truyền params dưới dạng props vào component
            },

            {
                path: "bids",
                name: "BidsList",
                component: () => import("@/views/BidsList.vue"), // Hiển thị danh sách gói thầu
            },
            {
                path: "bids/:id",
                name: "BidDetail",
                component: () => import("@/views/BidDetail.vue"), // Chi tiết gói thầu
            },
            {
                path: "bids/add",
                name: "BidAdd",
                component: () => import("@/views/BidAdd.vue"), // Thêm gói thầu mới
            },
            {
                path: "bids/edit/:id",
                name: "BidEdit",
                component: () => import("@/views/BidEdit.vue"), // Sửa gói thầu
            },

            {
                path: "pending-tasks",
                name: "PendingTasksList",
                component: () => import("@/views/PendingTasks/PendingTasksList.vue"), // Hiển thị danh sách đầu việc
            },
            {
                path: "pending-tasks/:id",
                name: "PendingTaskDetail",
                component: () => import("@/views/PendingTasks/PendingTaskDetail.vue"), // Chi tiết đầu việc
            },
            {
                path: "pending-tasks/add",
                name: "PendingTaskAdd",
                component: () => import("@/views/PendingTasks/PendingTaskAdd.vue"), // Thêm đầu việc mới
            },
            {
                path: "pending-tasks/edit/:id",
                name: "PendingTasksEdit",
                component: () => import("@/views/PendingTasks/PendingTasksEdit.vue"), // Sửa đầu việc
            },
            // Trang danh sách vai trò
            {
                path: "roles",
                name: "RolesList",
                component: () => import("@/views/RolesList.vue"),
            },
            // Chi tiết vai trò
            {
                path: "roles/:id",
                name: "RoleDetail",
                component: () => import("@/views/RoleDetail.vue"),
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
                path: "users/edit/:id",
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
                path: "customers/:id",
                name: "CustomerDetails",
                component: () => import("@/views/CustomerDetails.vue"), // Component chi tiết khách hàng
                props: true, // Cho phép truyền tham số id dưới dạng props
            },
            {
                path: "customers/edit/:id",
                name: "EditCustomer",
                component: () => import("@/views/EditCustomer.vue"), // Component sửa khách hàng
            },
            {
                path: "file/",
                name: "ListFileDepartment",
                component: () => import("@/views/DepartmentFileArchive.vue"),
            },
            {
                path: "chat/",
                name: "ChatApp",
                component: () => import("@/views/Chats/ChatApp.vue"),
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
