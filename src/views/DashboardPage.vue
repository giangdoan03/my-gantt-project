<template>
    <div>
        <h1 class="dashboard-title">Tổng quan công việc</h1>

        <!-- Bắt đầu phần thống kê -->
        <div class="dashboard-stats">
            <div class="stat-item" style="background-color: #007bff">
                <h2>Công việc tổng</h2>
                <p class="stat-value">26</p>
                <p>Tất cả các công việc</p>
            </div>
            <div class="stat-item" style="background-color: #28a745">
                <h2>Hoàn thành</h2>
                <p class="stat-value">4</p>
                <p>15% Đã hoàn thành</p>
            </div>
            <div class="stat-item" style="background-color: #ffc107">
                <h2>Đang làm</h2>
                <p class="stat-value">6</p>
                <p>23% Công việc đang thực hiện</p>
            </div>
            <div class="stat-item" style="background-color: #dc3545">
                <h2>Quá hạn</h2>
                <p class="stat-value">9</p>
                <p>35% Công việc quá hạn</p>
            </div>
        </div>

        <!-- Bắt đầu phần biểu đồ -->
        <div class="dashboard-charts">
            <div class="chart-item small-chart">
                <h3>Tiến độ công việc</h3>
                <canvas id="progressChart"></canvas>
            </div>
            <div class="chart-item large-chart">
                <h3>Công việc theo thời gian</h3>
                <canvas id="timeChart"></canvas>
            </div>
        </div>

        <!-- Bảng công việc gần đây -->
        <div class="recent-tasks">
            <h3>Công việc gần đây</h3>
            <a-table
                :columns="columns"
                :data-source="recentTasks"
                :scroll="{ x: 800 }"
                :pagination="{ pageSize: 5 }"
                bordered
                row-key="id"
            />
        </div>
    </div>
</template>


<script>
import {
    Chart,
    PieController,
    BarController,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Legend,
    Tooltip,
} from "chart.js";
import {handleLogout} from "@/apis/authApi";
import {message} from "ant-design-vue";

// Đăng ký các thành phần cần thiết cho Chart.js
Chart.register(
    PieController,
    BarController,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Legend,
    Tooltip
);

export default {
    name: "DashboardPage",
    data() {
        return {
            columns: [
                {
                    title: "#",
                    dataIndex: "index",
                    key: "index",
                    customRender: (_, __, index) => index + 1, // Tính toán số thứ tự
                },
                {
                    title: "Tiêu đề",
                    dataIndex: "title",
                    key: "title",
                },
                {
                    title: "Người thực hiện",
                    dataIndex: "assignee",
                    key: "assignee",
                },
                {
                    title: "Tiến độ",
                    dataIndex: "progress",
                    key: "progress",
                },
                {
                    title: "Ngày hết hạn",
                    dataIndex: "dueDate",
                    key: "dueDate",
                },
            ],
            recentTasks: [
                {
                    id: 1,
                    title: "Suscipit perferendis nulla sapiente",
                    assignee: "User 3",
                    progress: 95,
                    dueDate: "2024-12-13",
                },
                {
                    id: 2,
                    title: "Laborum id rem dicta cum",
                    assignee: "User 1",
                    progress: 60,
                    dueDate: "2024-12-08",
                },
                {
                    id: 3,
                    title: "Tempora vitae commodi ut delectus",
                    assignee: "User 1",
                    progress: 45,
                    dueDate: "2024-12-03",
                },
                {
                    id: 4,
                    title: "Totam distinctio velit quod consequatur",
                    assignee: "giang3",
                    progress: 86,
                    dueDate: "2024-12-03",
                },
                {
                    id: 5,
                    title: "Commodi quibusdam qui quisquam et",
                    assignee: "User 2",
                    progress: 22,
                    dueDate: "2024-12-10",
                },
            ],
        };
    },
    mounted() {
        this.renderCharts();
    },
    methods: {
        async logout() {
            try {
                await handleLogout();
                localStorage.removeItem("auth_token");
                message.success("Bạn đã đăng xuất khỏi hệ thống!");
                this.$router.push("/");
            } catch (error) {
                console.error("Logout failed:", error);
                message.error("Đăng xuất thất bại! Vui lòng thử lại.");
            }
        },
        renderCharts() {
            const progressCtx = document.getElementById("progressChart").getContext("2d");
            new Chart(progressCtx, {
                type: "pie",
                data: {
                    labels: ["Hoàn thành", "Chưa hoàn thành"],
                    datasets: [
                        {
                            label: "Tiến độ công việc",
                            data: [4, 22],
                            backgroundColor: ["#28a745", "#dc3545"],
                        },
                    ],
                },
            });
            const timeCtx = document.getElementById("timeChart").getContext("2d");
            new Chart(timeCtx, {
                type: "bar",
                data: {
                    labels: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"],
                    datasets: [
                        {
                            label: "Công việc hoàn thành",
                            data: [2, 3, 4, 5],
                            backgroundColor: "#28a745",
                        },
                        {
                            label: "Công việc chưa hoàn thành",
                            data: [6, 7, 5, 4],
                            backgroundColor: "#dc3545",
                        },
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: "top",
                        },
                    },
                },
            });
        },
    },
};
</script>

<style scoped>
.dashboard-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
}

.dashboard-stats {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
}

.stat-item {
    flex: 1;
    color: #fff;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
}

.stat-item h2 {
    font-size: 18px;
    margin-bottom: 10px;
}

.stat-value {
    font-size: 36px;
    font-weight: bold;
}

.dashboard-charts {
    display: flex;
    gap: 20px;
}

.chart-item {
    flex: 1;
}

.chart-item.small-chart {
    flex: 0 0 30%;
    /* Chỉ chiếm 30% chiều rộng của container */
}

.chart-item.small-chart canvas {
    width: 100%;
    /* Đảm bảo canvas chiếm toàn bộ container */
    height: auto;
}

.recent-tasks {
    margin-top: 20px;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tasks-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
}

.tasks-table th,
.tasks-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

.tasks-table th {
    background-color: #f8f9fa;
    font-weight: bold;
}

.progress-container {
    background-color: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    height: 20px;
}

.progress-bar {
    height: 100%;
    background-color: #007bff;
    text-align: center;
    color: #fff;
    white-space: nowrap;
    line-height: 20px;
    border-radius: 4px;
}

.dashboard-charts {
    display: flex;
    gap: 20px;
}

.chart-item {
    flex: 1;
    text-align: center;
}

.small-chart {
    flex: 0 0 30%;
    /* Thu nhỏ "Tiến độ công việc" */
}

.smaller-chart {
    flex: 0 0 40%;
    /* Thu nhỏ "Công việc theo thời gian" */
}

.smaller-chart canvas {
    width: 100%;
    /* Đảm bảo canvas thu nhỏ theo container */
    height: auto;
}

.dashboard-charts {
    display: flex;
    justify-content: space-between;
    /* Tạo khoảng cách đều giữa các biểu đồ */
    gap: 20px;
    /* Khoảng cách giữa các biểu đồ */
}

.chart-item {
    text-align: center;
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.balanced-chart {
    flex: 0 0 40%;
    /* Mỗi biểu đồ chiếm 45% chiều rộng container */
}

.balanced-chart canvas {
    width: 100%;
    /* Đảm bảo canvas thu nhỏ theo container */
    height: auto;
}

.dashboard-charts {
    display: flex;
    gap: 20px; /* Khoảng cách giữa các biểu đồ */
}

.chart-item {
    text-align: center;
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.small-chart {
    flex: 4; /* Chiếm 4 phần */
}

.large-chart {
    flex: 8; /* Chiếm 8 phần */
}

.chart-item canvas {
    width: 100%; /* Đảm bảo canvas thu nhỏ theo container */
    height: auto;
}

@media only screen and (max-width: 600px) {
    .dashboard-stats {
        display: block;
    }
}
/* Trên màn hình nhỏ (mobile) */
@media (max-width: 768px) {
    .chart-item.small-chart {
        flex: 0 0 100%; /* Mỗi biểu đồ chiếm toàn bộ chiều rộng */
    }
    .dashboard-charts {
        display: block;
        gap: 20px;
    }
    .stat-item {
        margin-bottom: 20px;
    }
}
</style>