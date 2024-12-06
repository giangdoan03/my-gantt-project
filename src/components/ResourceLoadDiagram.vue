<template>
    <div>
        <div class="gantt_control">
            <label title="Change the vertical task reorder in the grid">
                Reorder mode:
                <select class="reorder_mode" @change="changeReorderMode($event.target.value)">
                    <option value="marker">Marker</option>
                    <option value="true">Classic</option>
                </select>
            </label>
            <label>Group:</label>
            <input type="button" id="default" @click="showGroups()" value="Tree"/>
            <input type="button" id="resources" @click="showGroups('resources')" value="Group by Resources"/>
            <input type="button" id="user" @click="showGroups('owner')" value="Group by owner"/>
            <input type="button" id="priority" @click="showGroups('priority')" value="Group by priority"/>
        </div>
        <div id="gantt_here" style="width: 100%; height: calc(100vh - 52px);"></div>
    </div>
</template>

<script>
import gantt from "@/assets/js/dhtmlxgantt.js";
import {getTasks, getResources, getPriorities, getOwners} from "@/apis/tasks";
import {formatDateToVietnameseDateOnly} from "@/utils/customize";

export default {
    name: "GanttChart",
    data() {
        return {
            ganttData: {data: [], links: []}, // Dữ liệu cho tasks và links
            resourceData: [], // Dữ liệu cho resources
            prioritiesData: [], // Dữ liệu cho priorities
            ownersData: [], // Dữ liệu cho owners
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
                const tasksResponse = await getTasks();
                this.resourceData = await getResources();
                this.prioritie_data = await getPriorities();
                const ownersResponse = await getOwners();
                this.ownersData = ownersResponse;

                console.log('ownersResponse',ownersResponse)

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

                // Cập nhật tasks vào Gantt
                this.ganttData.data = tasksResponse.map((task) => {
                    task.start_date = new Date(task.start_date.replace(" ", "T"));
                    task.end_date = new Date(task.end_date.replace(" ", "T"));
                    return task;
                });

            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        },

        getUserList(data) {
            console.log('data', data)
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
            return result.map(function (entry) {
                return {key: entry, label: entry};
            });
        },
        // Khởi tạo Gantt Chart
        initGantt() {
            gantt.plugins({grouping: true});

            function byId(list, id) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].key == id)
                        return list[i].label || "";
                }
                return "";
            }



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
                {name: "text", tree: true, width: 200, resize: true},
                {
                    name: "start_date",
                    align: "center",
                    width: 100,
                    resize: true,
                    template: (task) => {
                        if (task.start_date instanceof Date) {
                            return formatDateToVietnameseDateOnly(task.start_date);
                        }
                        return "N/A";
                    },
                },
                {
                    name: "owners",
                    width: 70,
                    label: "Owner",
                    align: "center",
                    resize: true,
                    template: function (task) {
                        var result = "";
                        var owners = task.owner

                        if (!owners)
                            return;

                        if (owners.length == 1) {
                            return byId(gantt.serverList('owner'), owners);
                        }

                        owners.forEach(function (element) {
                            var owner = byId(gantt.serverList('owner'), element);
                            result += "<div class='owner-label' title='" + owner + "'>" + owner.substr(0, 1) + "</div>";

                        });

                        return result
                    }
                },
                // {
                //     name: "users",
                //     label: "Users",
                //     align: "center",
                //     width: 120,
                //     template: function (task) {
                //         let result = "";
                //         var users = task.owner
                //         if (!users)
                //             return;
                //
                //         if (users.length == 1) {
                //             return byId(gantt.serverList('owner'), users);
                //         }
                //         users.forEach(function (element) {
                //             var users = byId(gantt.serverList('owner'), element);
                //             result += "<div class='owner-label' title='" + users + "'>" + users.substr(0, 1) + "</div>";
                //
                //         });
                //
                //         return result
                //     }
                // },
                {
                    name: "material",
                    align: "center",
                    width: 95,
                    label: "Material",
                    template: (task) => this.renderMaterials(task),
                    resize: true,
                },
                {
                    name: "priority",
                    label: "Priority",
                    width: 65,
                    align: "center",
                    resize: true,
                    template: (task) => this.renderPriorities(task),
                },
                {name: "duration", label: "Duration", width: 40, align: "center", resize: true},
                {name: "add", width: 44},
            ];
            // Cấu hình lightbox

            gantt.locale.labels.section_split = "Display";

            // gantt.config.resource_store = "resource";
            gantt.config.resource_property = "material";

            gantt.locale.labels.section_owner = "Owner";
            gantt.locale.labels.section_material = "Material";
            gantt.locale.labels.section_priority = "Priority";
            gantt.locale.labels.section_assigned = "User";

            gantt.config.lightbox.sections = [
                {name: "description", height: 38, map_to: "text", type: "textarea", focus: true},
                {name: "priority", type: "select", map_to: "priority", options: gantt.serverList("priority")},

                {
                    name: "assigned",  // Phần này bạn có thể thay đổi tên tùy ý
                    type: "checkbox",
                    map_to: "users",   // Ánh xạ trường "users" từ dữ liệu
                    options: this.getUserList(this.ganttData.data),// Dữ liệu người dùng// Dữ liệu người dùng
                    onchange: function() {
                        console.log("checkbox switched");
                    }
                },
                {name: "owner", type: "checkbox", map_to: "owner_details", options: this.getUserList(this.ganttData.data)},
                // {
                //     name: "assigned",  // Phần này bạn có thể thay đổi tên tùy ý
                //     type: "checkbox",
                //     map_to: "users",   // Ánh xạ trường "users" từ dữ liệu
                //     options: this.getUserList(this.ganttData.data),// Dữ liệu người dùng// Dữ liệu người dùng
                //     onchange: function() {
                //         console.log("checkbox switched");
                //     }
                // },
                {
                    name: "material",
                    type: "resources",
                    map_to: "material",
                    options: gantt.serverList("material"),
                    default_value: 1,
                },
                {name: "time", type: "duration", map_to: "auto"},
            ];

            // Khởi tạo Gantt
            gantt.init("gantt_here");
            gantt.parse(this.ganttData);
        },


        // Hiển thị groups (resources, owners, priorities)
        showGroups(type) {
            gantt.$groupMode = true;
            if (type) {
                console.log('gantt',gantt.serverList(type) )
                gantt.groupBy({
                    groups: gantt.serverList(type),
                    relation_property: type,
                    group_id: "key",
                    group_text: "label",
                    default_group_label: "Unassigned",
                    save_tree_structure: true
                });
            } else {
                gantt.groupBy(false); // Không group
            }
        },

        // Thay đổi chế độ reorder
        changeReorderMode(value) {
            gantt.config.order_branch = value;
            gantt.init("gantt_here");
        },

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

        // Render materials trong cột Material
        renderMaterials(task) {
            if (task.type === gantt.config.types.project) {
                return ""; // Nếu task là dự án, không hiển thị material
            }

            const store = gantt.getDatastore("resource"); // Lấy datastore của resources
            const assignments = task[gantt.config.resource_property]; // Lấy materials từ task

            if (!assignments || !assignments.length) {
                return "Unassigned"; // Nếu không có material nào, trả về "Unassigned"
            }

            // Nếu chỉ có 1 material
            if (assignments.length === 1 && assignments[0].resource_id) {
                const resource = store.getItem(assignments[0].resource_id);
                return resource ? resource.text : "Unknown"; // Trả về tên material hoặc "Unknown"
            }

            // Nếu có nhiều material
            return assignments
                .map((assignment) => {
                    const resource = store.getItem(assignment.resource_id);
                    if (!resource) return ""; // Nếu không tìm thấy resource, bỏ qua
                    return `<div class='owner-label' title='${resource.text}'>${resource.text.substr(0, 1)}</div>`;
                })
                .join(""); // Trả về danh sách các materials, mỗi material là một `<div>`
        },
    },
};
</script>

<style>
html,
body {
    padding: 0px;
    margin: 0px;
    height: 100%;
}

#gantt_here {
    width: 100%;
    height: 800px;
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
    width: 20px;
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
