<template>
    <div>
        <a-spin :spinning="loading" tip="Loading...">
            <div class="main-content">
                <div id="gantt_here" style="width: 100%; height: 100%; padding: 0"></div>
            </div>
        </a-spin>
    </div>
</template>

<script>
import "dhtmlx-gantt/codebase/dhtmlxgantt.css";
import gantt from "@/assets/js/dhtmlxgantt.js";
import {fetchContractDetails} from "@/apis/contracts";

export default {
    name: "GanttChart",
    data() {
        return {
            loading: false, // Khởi tạo trạng thái loading

        };
    },
    methods: {
        createTask() {
            gantt.createTask();
        },
        showQuickInfo() {
            const tasks = gantt.getTaskByTime();
            if (tasks.length > 0) {
                gantt.showQuickInfo(tasks[0].id);
            }
        },
        async fetchData() {
            try {
                // Gọi API để lấy dữ liệu
                const contractId = this.$route.params.id;
                this.contract_details = await fetchContractDetails(contractId);
                const data = this.contract_details;

                // Chuyển đổi dữ liệu API về cấu trúc phù hợp cho Gantt
                const tasks = data.tasks.map((task) => ({
                    id: task.id,
                    text: task.text,
                    start_date: task.start_date,
                    duration: task.duration,
                    progress: task.progress,
                    parent: task.parent || 0, // Đặt `0` nếu không có parent
                }));

                // Render dữ liệu vào Gantt chart
                gantt.parse({data: tasks});
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        },
        addClickListener() {
            // Lắng nghe sự kiện click trên nút "Xem chi tiết"
            document.addEventListener("click", (e) => {
                if (e.target.classList.contains("details-button")) {
                    const taskId = e.target.getAttribute("data-task-id");
                    const contractId = e.target.getAttribute("data-contract-id");

                    // Chuyển hướng bằng Vue Router
                    this.$router.push({
                        name: "ContractDetails", // Tên route trong Vue Router
                        params: { id: contractId }, // Truyền contractId
                        query: { task: taskId }, // Truyền taskId qua query string
                    });
                }
            });
        },

        initializeGantt() {
            gantt.setSkin("material");
            gantt.plugins({
                quick_info: true,
                tooltip: true,
                critical_path: true,
            });
            gantt.config.xml_date = "%Y-%m-%d %H:%i:%s";

            gantt.locale.date.month_full = [
                "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"
            ];

            gantt.config.columns = [
                {name: "wbs", label: "WBS", width: 50, template: gantt.getWBSCode, resize: true},
                {name: "text", label: "Task name", tree: true, width: 170, resize: true, min_width: 10},
                {
                    name: "start_date",
                    align: "center",
                    width: 90,
                    resize: true,
                    template: function (task) {
                        return gantt.date.date_to_str("%d-%m-%Y")(task.start_date); // Định dạng ngày thành MM-DD-YYYY
                    }
                },
                {name: "duration", align: "center", width: 80, resize: true},
                {name: "add", width: 40},
            ];

            gantt.templates.rightside_text = function (start, end, task) {
                if (task.type === gantt.config.types.milestone) {
                    return task.text + " / ID: #" + task.id;
                }
                return "";
            };

            gantt.templates.tooltip_text = function (start, end, task) {
                // Chuyển đổi định dạng ngày
                const formatDate = gantt.date.date_to_str("%d-%m-%Y"); // Định dạng ngày thành DD-MM-YYYY

                return `
                    <b>Tên việc:</b> ${task.text} <br/>
                    <b>Ngày bắt đầu:</b> ${formatDate(start)}
                    <b>Ngày kết thúc:</b> ${formatDate(end)}
                  `;
            };


            gantt.config.start_on_monday = false;

            gantt.config.scale_height = 36 * 3;
            gantt.config.scales = [
                {
                    unit: "month",
                    step: 1,
                    format: function (date) {
                        const month = gantt.date.date_to_str("%m")(date); // Lấy tháng dạng số
                        return `Tháng ${month}`; // Hiển thị "Tháng 11", "Tháng 12", ...
                    },
                },
                {
                    unit: "week",
                    step: 1,
                    format: function (date) {
                        const dateToStr = gantt.date.date_to_str("%d"); // Lấy ngày
                        const monthToStr = gantt.date.date_to_str("%m"); // Lấy tháng
                        const endDate = gantt.date.add(date, 6, "day"); // Ngày cuối tuần
                        return `${dateToStr(date)} tháng ${monthToStr(date)} - ${dateToStr(endDate)} tháng ${monthToStr(endDate)}`;
                    },
                },
                {
                    unit: "day",
                    step: 1,
                    format: function (date) {
                        const days = [
                            "Chủ nhật", // Ngày 0
                            "Thứ 2",
                            "Thứ 3",
                            "Thứ 4",
                            "Thứ 5",
                            "Thứ 6",
                            "Thứ 7",
                        ];
                        return days[date.getDay()]; // Lấy tên ngày theo chỉ số (0-6)
                    },
                },
            ];


            gantt.templates.quick_info_title = function (start, end, task) {
                return `<b>${task.text}</b>`;
            };
// Hàm lấy ID hợp đồng từ URL
//             function getContractIdFromUrl() {
//                 const url = window.location.href; // Lấy URL hiện tại
//                 const matches = url.match(/\/contracts\/(\d+)/); // Tìm đoạn /contracts/{id}
//                 return matches ? matches[1] : null; // Trả về ID nếu tìm thấy
//             }

// Cấu hình popup của Gantt Chart
            gantt.templates.quick_info_content = function (start, end, task) {
                const contractId = 1;
                return `
                <p>Ngày bắt đầu: ${gantt.templates.date_grid(start)}</p>
                <p>Ngày kết thúc: ${gantt.templates.date_grid(end)}</p>
                <p>Trạng thái: <b>${task.status || "Chưa xác định"}</b></p>
                <button class="details-button" data-task-id="${task.id}" data-contract-id="${contractId}">
                    Xem chi tiết
                </button>
            `;
            };



            gantt.config.order_branch = true;

            gantt.init("gantt_here");
            this.fetchData(); // Lấy dữ liệu từ API
        },
    },
    mounted() {
        this.initializeGantt();
        this.addClickListener(); // Thêm sự kiện click
        console.log("Nút có tồn tại:", document.querySelector(".details-button"));
    },
};
</script>
<style scoped>

.main-content {
    height: calc(100vh - 50px);
}
</style>
