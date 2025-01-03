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
import {createTask, updateTask} from "@/apis/tasks";

export default {
    name: "GanttChart",
    data() {
        return {
            loading: false, // Khởi tạo trạng thái loading
            contractId: null, // Lưu contract_id từ URL

        };
    },
    mounted() {
        this.initializeGantt();
        // Lấy contract_id từ URL
        const path = window.location.pathname; // "/contracts/1/chart"
        const segments = path.split('/'); // ["", "contracts", "1", "chart"]
        this.contractId = segments[3]; // Lấy contract_id từ URL
        // Gắn sự kiện click để xử lý các nút
        window.clickGridButton = this.clickGridButton.bind(this); // Bind this vào phương thức
    },
    methods: {
        async handleLightboxSave(id, task, is_new) {
            console.log("Save button clicked in Lightbox", { id, task, is_new });

            // Nếu parent là 0, thay bằng root_id hoặc null
            if (!task.parent || task.parent === 0 || task.parent === "0") {
                task.parent = gantt.config.root_id || 0; // Gán parent là root nếu không có cha
            }

            // Tính toán sort_order và wbs
            task.sort_order = this.calculateSortOrder(id); // Tính sort_order
            task.wbs = this.calculateWBS(id); // Tính wbs

            // Thêm contract_id từ URL vào task
            task.contract_id = parseInt(this.contractId, 10);
            task.type = 'task';

            try {
                let response;

                if (is_new) {
                    // Gửi yêu cầu tạo mới task
                    response = await createTask(task);
                    console.log("Task created successfully:", response);

                    if (response.data && response.data.id) {
                        // Đồng bộ ID thực từ backend
                        gantt.changeTaskId(id, response.data.id);
                    }
                } else {
                    // Gửi yêu cầu cập nhật task
                    response = await updateTask(id, task); // Hàm cập nhật task (sẽ tạo bên dưới)
                    console.log("Task updated successfully:", response);
                }

                // Kiểm tra và xóa task tạm nếu tồn tại
                if (gantt.isTaskExists(task.id)) {
                    gantt.deleteTask(task.id);
                }

                this.fetchData(); // Lấy dữ liệu từ API để đồng bộ

                gantt.message({
                    type: "success",
                    text: is_new ? "Task created successfully" : "Task updated successfully"
                });
            } catch (error) {
                console.error(is_new ? "Failed to create task:" : "Failed to update task:", error);
                gantt.message({
                    type: "error",
                    text: is_new ? "Failed to create task" : "Failed to update task"
                });
            }

            return true; // Cho phép xử lý mặc định
        },

        calculateSortOrder(taskId) {
            const parent = gantt.getParent(taskId);
            const children = gantt.getChildren(parent);
            return children.indexOf(taskId) + 1;
        },

        calculateWBS(taskId) {
            const parent = gantt.getParent(taskId); // Lấy task cha
            console.log('parent', parent);
            const sortOrder = this.calculateSortOrder(taskId); // Tính sortOrder của task hiện tại

            // Xử lý nếu parent là 0 hoặc root
            if (!parent || parent === gantt.config.root_id || parent === "0" || parent === 0) {
                return `${sortOrder}`;
            }

            try {
                const parentTask = gantt.getTask(parent);
                console.log('parentTask', parentTask);

                if (!parentTask) {
                    console.error(`Parent task with ID ${parent} not found.`);
                    return `${sortOrder}`;
                }

                const parentWBS = parentTask.wbs || this.calculateWBS(parent); // Đệ quy tính toán WBS nếu cần
                return `${parentWBS}.${sortOrder}`;
            } catch (error) {
                console.error(`Error fetching parent task with ID ${parent}:`, error);
                return `${sortOrder}`; // Nếu có lỗi, trả về sortOrder
            }
        },

        handleAfterTaskUpdate(id, task) {
            console.log("Task updated:", { id, task });
            gantt.sort("sort_order", false); // Sắp xếp lại Gantt theo sort_order
        },

        async fetchData() {
            try {
                // Gọi API để lấy dữ liệu
                const contractId = this.$route.params.id;
                this.contract_details = await fetchContractDetails(contractId);
                const data = this.contract_details;

                // Chuyển đổi dữ liệu API về cấu trúc phù hợp cho Gantt
                let tasks = data.tasks.map((task) => ({
                    id: task.id,
                    text: task.text,
                    start_date: task.start_date,
                    duration: task.duration,
                    progress: task.progress,
                    parent: task.parent || null, // Đặt `0` nếu không có parent
                    sort_order: task.sort_order,
                }));
                // Sắp xếp dữ liệu theo `sort_order`
                tasks = tasks.sort((a, b) => a.sort_order - b.sort_order);

                // Render dữ liệu vào Gantt chart
                gantt.clearAll(); // Xóa các task cũ nếu có
                // Render dữ liệu vào Gantt chart
                gantt.parse({data: tasks});
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        },

        // Hàm xử lý sự kiện click nút trên grid
        clickGridButton(taskId, contractId) {
            // Chuyển hướng bằng Vue Router
            this.$router.push({
                name: "ContractDetails",
                params: { id: contractId }, // Truyền ID hợp đồng
                query: { task: taskId }, // Truyền ID task vào query string
            });
        },

        initializeGantt() {
            gantt.setSkin("material");
            gantt.plugins({
                tooltip: true,
            });
            gantt.config.xml_date = "%Y-%m-%d %H:%i:%s";
            gantt.config.use_utc = true; // Sử dụng UTC để tránh lỗi múi giờ

            gantt.locale.date.month_full = [
                "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"
            ];

            // Cột trong grid
            const colContent = (task) => {
                return `<i class="fa gantt_button_grid gantt_grid_redirect fa-arrow-right" onclick="clickGridButton(${task.id}, ${task.contract_id}, 'redirect')"></i>`;
            };
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
                {
                    name: "buttons",
                    label: "View",
                    width: 50,
                    align: "center",
                    template: colContent
                },
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

            gantt.config.drag_mode = {
                move: false,     // Cho phép di chuyển task
                resize: false,   // Cho phép thay đổi kích thước task
                progress: false, // Cho phép thay đổi tiến độ task
            };
            gantt.config.order_branch = false;  // Kéo thả trong cùng cấp
            gantt.config.order_branch_free = false; // Kéo thả tự do giữa các cấp

            // Bắt sự kiện lưu trong Lightbox
            gantt.attachEvent("onLightboxSave", this.handleLightboxSave);
            // Tự động sắp xếp lại Gantt khi task được cập nhật
            gantt.attachEvent("onAfterTaskUpdate", this.handleAfterTaskUpdate);

            gantt.init("gantt_here");
            this.fetchData(); // Lấy dữ liệu từ API
        },
    },
};
</script>
<style scoped>

.main-content {
    height: calc(100vh - 50px);
}

.completed_task .gantt_task_progress {
    --dhx-gantt-task-progress-color: #ACCAAC;
}

.dhtmlx-completed div {
    background: #81c97a;
}
</style>
