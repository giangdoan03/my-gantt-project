<template>
    <div>
        <a-spin :spinning="loading" tip="Loading...">
            <div class="gantt_control">
                <!--                <label title="Change the vertical task reorder in the grid">-->
                <!--                    Reorder mode:-->
                <!--                    <select class="reorder_mode" @change="changeReorderMode($event.target.value)">-->
                <!--                        <option value="marker">Marker</option>-->
                <!--                        <option value="true">Classic</option>-->
                <!--                    </select>-->
                <!--                </label>-->
                <label>Nhóm:</label>
                <input type="button" id="default" @click="showGroups()" value="Dạng cây"/>
                <input type="button" id="resources" @click="showGroups('resources')" value="Tài nguyên"/>
                <input type="button" id="user" @click="showGroups('owner')" value="Thực hiện"/>
                <input type="button" id="priority" @click="showGroups('priority')" value="Mức độ ưu tiên"/>
            </div>
            <div id="gantt_here" style="width: 100%; height: calc(100vh - 52px);"></div>
        </a-spin>
    </div>
</template>

<script>
import gantt from "@/assets/js/dhtmlxgantt.js";
import {createTask, updateTask, getResources, getPriorities, getOwners, getDepartments} from "@/apis/tasks";
import { fetchContractDetails } from "@/apis/contracts";
import {fetchFormattedUsers} from "@/apis/users";
import {fetchFormattedDepartments} from "@/apis/department";
import {formatDateToVietnameseDateOnly} from "@/utils/customize";

export default {
    name: "GanttChart",
    data() {
        return {
            ganttData: {data: [], links: []}, // Dữ liệu cho tasks và links
            resourceData: [], // Dữ liệu cho resources
            prioritiesData: [], // Dữ liệu cho priorities
            ownersData: [], // Dữ liệu cho owners
            department_data: [], // Dữ liệu cho department_data
            collaboration: [], // Dữ liệu cho department_data
            loading: false, // Khởi tạo trạng thái loading
            departmentListFilter: '',
            departments_format: '',
            list_user_format: '',
            contract_details: '',
        };
    },
    async mounted() {
        await this.fetchData(); // Gọi API khi component được mount
        this.initGantt(); // Khởi tạo Gantt Chart sau khi đã có dữ liệu

    },
    methods: {
        // Fetch data từ API
        async fetchData() {
            try {
                this.loading = true; // Bắt đầu loading
                // const tasksResponse = await getTasks();
                this.resourceData = await getResources();
                this.prioritie_data = await getPriorities();
                this.department_data = await getDepartments();
                this.departments_format = await fetchFormattedDepartments();
                this.list_user_format = await fetchFormattedUsers();
                const contractId = this.$route.params.id;
                this.contract_details = await fetchContractDetails(contractId);
                console.log('contract_details', this.contract_details);
                console.log('departments_format', this.departments_format);
                console.log('list_user_format', this.list_user_format);
                const ownersResponse = await getOwners();
                this.ownersData = ownersResponse;
                this.collaboration = JSON.parse(JSON.stringify(this.department_data));

                // Khởi tạo Datastore cho resources
                if (!gantt.$resourcesStore) {
                    gantt.$resourcesStore = gantt.createDatastore({
                        name: gantt.config.resource_store,
                        type: "treeDatastore",
                        initItem: (item) => {
                            item.parent = item.parent || gantt.config.root_id;
                            item[gantt.config.resource_property] = item.parent;
                            item.open = true;
                            return item;
                        },
                    });
                }

                // Đính kèm sự kiện `onParse` cho $resourcesStore
                gantt.$resourcesStore.attachEvent("onParse", function () {
                    const material = [];

                    // Duyệt qua tất cả các item trong Datastore
                    gantt.$resourcesStore.eachItem(function (res) {
                        if (!gantt.$resourcesStore.hasChild(res.id)) {
                            const copy = gantt.copy(res); // Tạo bản sao
                            copy.key = res.id;
                            copy.label = res.text;
                            copy.unit = "hours"; // Đặt đơn vị (e.g., hours)
                            material.push(copy);
                        }
                    });

                    // Cập nhật Collection "material"
                    gantt.updateCollection("material", material);
                });


                gantt.attachEvent("onParse", function () {
                    const ownerCollection = [];

                    // Duyệt qua danh sách owner trong serverList
                    const owners = gantt.serverList("owner");
                    if (owners) {
                        owners.forEach((owner) => {
                            const copy = {...owner}; // Tạo bản sao
                            copy.key = owner.key;
                            copy.label = owner.label;
                            ownerCollection.push(copy);
                        });

                        // Cập nhật Collection "owner"
                        gantt.updateCollection("owner", ownerCollection);
                    }
                });

                // Parse resources vào Datastore
                if (gantt.$resourcesStore) {
                    gantt.$resourcesStore.parse(this.resourceData.data);
                }

                // Lưu dữ liệu vào serverList
                gantt.serverList("priority", this.prioritie_data);
                gantt.serverList("owner", ownersResponse);
                gantt.serverList("users", this.resourceData.data);
                gantt.serverList("departments", this.department_data);
                // gantt.serverList("collaboration", this.collaboration);

                // Cập nhật tasks vào Gantt
                this.ganttData.data = this.contract_details.tasks.map((task) => {
                    task.start_date = new Date(task.start_date.replace(" ", "T"));
                    task.end_date = new Date(task.end_date.replace(" ", "T"));
                    console.log('task', task)
                    return task;
                });

            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                this.loading = false; // Kết thúc trạng thái loading
            }
        },
        async loadDepartments() {
            try {
                const departments = await fetchFormattedDepartments();
                console.log("Departments:", departments);
            } catch (error) {
                console.error(error);
            }
        },
        getFormattedDepartmentList(selectedValue) {
            console.log('this.collaboration', this.collaboration)
            // Lọc và chuyển đổi mảng `collaboration`
            let formattedList = this.collaboration
                .filter(department => department && department.label) // Lọc các mục không hợp lệ
                .map(department => ({
                    key: department.label, // Sử dụng giá trị từ `label` làm `key`
                    label: department.label // Sử dụng giá trị từ `label`
                }));

            // Loại bỏ các phần tử trùng lặp với `selectedValue`
            formattedList = formattedList.filter(department => department.label !== selectedValue);

            console.log("Formatted departments after filtering:", formattedList);

            return formattedList;
        },

        getUserList(data) {
            var users = [];
            var uniqueUsers = {};
            var i;
            var result = [];

            // Kết hợp tất cả người dùng từ các tác vụ
            for (i = 0; i < data.length; i++) {
                users = users.concat(data[i].users);
            }

            // Lọc các người dùng duy nhất
            for (i = 0; i < users.length; i++) {
                uniqueUsers[users[i]] = true;
            }

            // Sử dụng Object.prototype.hasOwnProperty.call để kiểm tra
            for (var key in uniqueUsers) {
                if (Object.prototype.hasOwnProperty.call(uniqueUsers, key)) {
                    result.push(key);
                }
            }

            // Sắp xếp kết quả và trả về mảng các đối tượng {key, label}
            result.sort();
            console.log('result', result)
            return result.map(function (entry) {
                return {key: entry, label: entry};
            });
        },
        // Khởi tạo Gantt Chart
        initGantt() {
            gantt.plugins({grouping: true});

            // function byId(list, id) {
            //     for (var i = 0; i < list.length; i++) {
            //         if (list[i].key == id)
            //             return list[i].label || "";
            //     }
            //     return "";
            // }


            gantt.config.order_branch = true;
            gantt.config.order_branch = "marker";
            gantt.config.order_branch_free = true;
            gantt.config.open_tree_initially = true;


            // Cấu hình Gantt Chart
            gantt.config.resource_store = "resource";
            gantt.config.resource_property = "material";
            gantt.config.open_tree_initially = true;

            gantt.config.scales = [
                {unit: "month", step: 1, format: "%F, %Y"},
                {unit: "day", step: 1, format: "%d %M"},
            ];

            gantt.config.columns = [
                {name: "text", tree: true, width: 200, label: "Nội dung công việc", resize: true},
                {
                    name: "start_date",
                    align: "center",
                    width: 100,
                    label: "Bắt đầu",
                    resize: true,
                    template: (task) => {
                        if (task.start_date instanceof Date) {
                            return formatDateToVietnameseDateOnly(task.start_date);
                        }
                        return "N/A";
                    },
                },
                {name: "duration", label: "Số ngày", width: 40, align: "center", resize: true},
                {
                    name: "end_date",
                    align: "center",
                    width: 100,
                    label: "Kết thúc",
                    resize: true,
                    template: (task) => {
                        if (task.end_date instanceof Date) {
                            return formatDateToVietnameseDateOnly(task.end_date);
                        }
                        return "N/A";
                    },
                },
                {
                    name: "owners",
                    width: 70,
                    label: "Thực hiện",
                    align: "center",
                    resize: true,
                    template: function (task) {
                        let result = "";
                        var department = task.department;

                        if (!department) return;

                        // Kiểm tra nếu department là một đối tượng
                        if (!Array.isArray(department)) {
                            // Xử lý trường hợp department là một đối tượng đơn lẻ
                            return `<div class='owner-label' title='${department.name}'>${department.short_name}</div>`;
                        }

                        // Nếu department là mảng, xử lý từng phần tử
                        department.forEach(function (element) {
                            result += `<div class='owner-label' title='${element.name}'>${element.short_name}</div>`;
                        });

                        return result;
                    }
                },
                {
                    name: "material",
                    label: "Phối hợp",
                    align: "center",
                    width: 120,
                    template: function (task) {
                        let result = "";
                        const collaborationDetails = task.collaboration_details;
                        const iDdepartment = task.department ? task.department.id : null; // Kiểm tra nếu department tồn tại

                        if (!collaborationDetails) return;

                        // Nếu collaborationDetails là mảng, lọc bỏ iDdepartment
                        const filteredDetails = Array.isArray(collaborationDetails)
                            ? collaborationDetails.filter(detail => detail.id !== iDdepartment)
                            : [];

                        // Xử lý từng phần tử sau khi lọc
                        filteredDetails.forEach(function (element) {
                            result += `<div class='owner-label' title='${element.name}'>${element.short_name}</div>`;
                        });

                        return result;
                    }
                },
                // {
                //     name: "material",
                //     align: "center",
                //     width: 95,
                //     label: "Phối hợp",
                //     template: (task) => this.renderMaterials(task),
                //     resize: true,
                // },
                {
                    name: "priority",
                    label: "Độ ưu tiên",
                    width: 65,
                    align: "center",
                    resize: true,
                    template: (task) => this.renderPriorities(task),
                },
                {name: "add", width: 44},
            ];
            // Cấu hình lightbox

            gantt.locale.labels.section_split = "Display";

            // gantt.config.resource_store = "resource";
            gantt.config.resource_property = "material";

            // gantt.config.resource_store = "collaboration_details";
            gantt.config.resource_property = "collaboration_details";

            gantt.locale.labels.section_department = "Phòng thực hiện";
            gantt.locale.labels.section_collaboration = "Phòng phối hợp";
            gantt.locale.labels.section_assigned = "Người thực hiện";
            gantt.locale.labels.section_priority = "Priority";

            console.log('gantt.serverList("priority")', gantt.serverList("priority"))
            gantt.config.lightbox.sections = [
                {name: "description", height: 38, map_to: "text", type: "textarea", focus: true},
                {name: "priority", type: "select", map_to: "priority", options: gantt.serverList("priority")},
                {
                    name: "department",
                    type: "select",
                    map_to: "department_id",
                    options: gantt.serverList("departments"),
                    onchange: (e) => {
                        const selectedValue = e.target.value; // Lấy giá trị `value` được chọn
                        console.log("Selected value:", selectedValue);

                        // Lấy danh sách các options từ `gantt.serverList`
                        const departments = gantt.serverList("departments");

                        // Tìm đối tượng trong danh sách tương ứng với `value` được chọn
                        const selectedDepartment = departments.find(dept => dept.key == selectedValue);

                        // Lấy giá trị `label` của đối tượng vừa tìm thấy
                        const selectedLabel = selectedDepartment ? selectedDepartment.label : null;
                        console.log("Selected label:", selectedLabel);

                        // Gọi hàm từ Vue component nếu cần
                        const formattedDepartments = this.getFormattedDepartmentList(selectedLabel);
                        console.log("Formatted departments:", formattedDepartments);
                    }

                },
                {
                    name: "collaboration",  // Phần này bạn có thể thay đổi tên tùy ý
                    type: "checkbox",
                    map_to: "collaboration_departments",   // Ánh xạ trường "collaboration_departments" từ dữ liệu
                    options: this.departments_format,// Dữ liệu người dùng// Dữ liệu người dùng

                },

                {
                    name: "assigned",  // Phần này bạn có thể thay đổi tên tùy ý
                    type: "checkbox",
                    map_to: "owner",   // Ánh xạ trường "users" từ dữ liệu
                    options: this.list_user_format,// Dữ liệu người dùng// Dữ liệu người dùng
                    onchange: function () {
                        console.log("checkbox switched");
                    }
                },

                // {
                //     name: "material",
                //     type: "resources",
                //     map_to: "material",
                //     options: gantt.serverList("material"),
                //     default_value: 1,
                // },
                {name: "time", type: "duration", map_to: "auto"},
            ];

            // Khởi tạo Gantt
            gantt.init("gantt_here");

            gantt.attachEvent("onTaskClick", async function () {

            });
            // gantt.parse({
            //     data: [
            //         { id: 1, text: "Task #1", start_date: "2025-04-01", duration: 5, progress: 0.6, owner: [1, 2], priority: 1 },
            //         { id: 2, text: "Task #2", start_date: "2025-04-02", duration: 3, progress: 0.4, owner: [2], priority: 2 }
            //     ]
            // });

            // Đính kèm sự kiện onLightboxSave
            gantt.attachEvent("onLightboxSave", this.onLightboxSave);

            gantt.parse(this.ganttData);
        },
        onLightboxSave(id, task, isNew) {
            console.log("Task Saved:", { id, task, isNew });

            const task1 = gantt.getTask(id);
            console.log("Lightbox Opened for Task:", task1);

            console.log("task:", task);

            // Gửi dữ liệu task đến API hoặc xử lý tại đây
            this.saveTaskToServer(task, isNew);

            return true; // Trả về true để đóng lightbox
        },

        async saveTaskToServer(task, isNew) {
            try {
                console.log("Saving task to server:", task);

                // Lấy `contract_id` từ URL
                const contractId = this.$route.params.id; // Giả sử bạn đang sử dụng Vue Router

                if (!contractId) {
                    console.error("Contract ID is missing from the URL.");
                    gantt.message({
                        type: "error",
                        text: "Contract ID is required to save the task.",
                    });
                    return;
                }

                // Thêm `contract_id` vào task
                task.contract_id = contractId;

                // Xác định `type` dựa trên `duration`
                task.type = task.duration > 0 ? "task" : "milestone";

                console.log(`Task type set to: ${task.type}`);
                console.log(`Task with contract_id (${contractId}):`, task);

                if (isNew) {
                    // Gọi API tạo mới task
                    const response = await createTask(task);

                    console.log("Task created successfully:", response);

                    // Cập nhật task vào Gantt
                    gantt.updateTask(response.id, response); // Giả sử API trả về task mới
                } else {
                    // Xử lý cập nhật task (nếu cần)
                    console.log("Updating existing task logic here...");
                    // Ví dụ: gọi API cập nhật task
                    const contractId = this.$route.params.id;
                    const response = await updateTask(contractId, task);
                    gantt.updateTask(response.id, response);
                }
            } catch (error) {
                console.error("Failed to save task:", error);
                gantt.message({
                    type: "error",
                    text: "Failed to save task. Please try again.",
                });
            }
        },
        // Hiển thị groups (resources, owners, priorities)
        showGroups(type) {
            gantt.$groupMode = true;
            if (type) {
                if (type === "resources") {
                    // Lấy tất cả các resources từ store và tạo nhóm mới
                    var groups = gantt.$resourcesStore.getItems().map(function (item) {
                        var group = gantt.copy(item);
                        group.group_id = group.id;
                        group.id = gantt.uid();
                        return group;
                    });

                    gantt.groupBy({
                        groups: groups,
                        relation_property: gantt.config.resource_property,
                        group_id: "group_id",
                        group_text: "text",
                        delimiter: ", ",
                        default_group_label: "No Material",
                        save_tree_structure: true
                    });
                } else {
                    gantt.groupBy({
                        groups: gantt.serverList(type),
                        relation_property: type,
                        group_id: "key",
                        group_text: "label",
                        default_group_label: "Unassigned",
                        save_tree_structure: true
                    });
                }
            } else {
                gantt.groupBy(false); // Không group
            }
        },

        // Thay đổi chế độ reorder
        // changeReorderMode(value) {
        //     gantt.config.order_branch = value;
        //     gantt.init("gantt_here");
        // },

        // Render owners trong cột Owners
        // renderOwners(task) {
        //     const byId = (list, id) => {
        //         // Hàm tìm kiếm `owner` trong danh sách theo id
        //         const owner = list.find((o) => o.key === id);
        //         return owner ? owner.label : "Unknown";
        //     };
        //
        //     const owners = task.owner; // Lấy danh sách `owner` từ task
        //     if (!owners || !Array.isArray(owners) || owners.length === 0) {
        //         return ""; // Nếu không có `owner`, trả về chuỗi rỗng
        //     }
        //
        //     // Nếu chỉ có một `owner`
        //     if (owners.length === 1) {
        //         return byId(gantt.serverList("owner"), owners[0]);
        //     }
        //
        //     // Nếu có nhiều `owner`
        //     let result = "";
        //     owners.forEach((ownerId) => {
        //         const owner = byId(gantt.serverList("owner"), ownerId);
        //         if (owner) {
        //             result += `<div class='owner-label' title='${owner}'>${owner.substr(0, 1)}</div>`;
        //         }
        //     });
        //
        //     return result; // Trả về danh sách HTML các `owner`
        // },

        // Render priorities trong cột Priorities
        renderPriorities(task) {
            const priorities = gantt.serverList("priority");
            const priority = priorities.find((p) => p.key === Number(task.priority));
            return priority ? priority.label : "Unassigned";
        },


    },
};
</script>

<style>
#gantt_here {
    width: 100%;
    height: calc(100vh - 52px);
}

.gantt_grid_scale .gantt_grid_head_cell,
.gantt_task .gantt_task_scale .gantt_scale_cell {
    font-weight: bold;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.7);
}

.resource_marker {
    text-align: center;
}

.resource_marker div {
    width: 28px;
    height: 28px;
    border-radius: 15px;
    color: #FFF;
    margin: 3px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
}

.resource_marker.workday_ok div {
    background: var(--dhx-gantt-base-colors-success);
}

.resource_marker.workday_over div {
    background: var(--dhx-gantt-base-colors-error);
}

.folder_row {
    font-weight: bold;
}

.highlighted_resource,
.highlighted_resource.odd {
    background-color: rgba(255, 251, 224, 0.6);
}

.resource-controls .gantt_layout_content {
    padding: 7px;
    overflow: hidden;
}

.resource-controls label {
    margin: 0 10px;
    vertical-align: bottom;
    display: inline-block;
    color: #3e3e3e;
    padding: 2px;
    transition: box-shadow 0.2s;
}

.gantt_cal_lsection {
    margin-top: 20px !important;
}

.resource-controls label:hover {
    box-shadow: 0 2px rgba(84, 147, 255, 0.42);
}

.resource-controls label.active,
.resource-controls label.active:hover {
    box-shadow: 0 2px #5493ffae;
    color: #1f1f1f;
}

.resource-controls input {
    vertical-align: top;
}

.gantt_task_cell.week_end, .gantt_task_cell.no_work_hour {
    background-color: var(--dhx-gantt-base-colors-background-alt);
}

.gantt_task_row.gantt_selected .gantt_task_cell.week_end {
    background-color: var(--dhx-gantt-base-colors-select);
}


.group_row,
.group_row.odd,
.gantt_task_row.group_row {
    background-color: rgba(232, 232, 232, 0.6);
    font-weight: bold;
}

.owner-label {
    height: 20px;
    font-size: 12px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #cccccc;
    border-radius: 25px;
    background: #e6e6e6;
    color: #6f6f6f;
    margin: 0 3px;
    font-weight: bold;
    padding: 2px 5px;
}

.gantt_tree_content {
    height: 100%;
    white-space: nowrap;
    min-width: 0;
    overflow: hidden;
    width: auto;
    text-overflow: ellipsis;
}


</style>
