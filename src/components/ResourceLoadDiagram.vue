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
            <input type="button" id="default" @click="showGroups()" value="Tree" />
            <input type="button" id="resources" @click="showGroups('resources')" value="Group by Resources" />
            <input type="button" id="user" @click="showGroups('owner')" value="Group by owner" />
            <input type="button" id="priority" @click="showGroups('priority')" value="Group by priority" />
        </div>
        <div id="gantt_here" style="width: 100%; height: calc(100vh - 52px);"></div>
    </div>
</template>

<script>
import gantt from "@/assets/js/dhtmlxgantt.js";
import { getTasks, getResources, getPriorities, getOwners } from "@/apis/tasks";
import { formatDateToVietnameseDateOnly } from "@/utils/customize";

export default {
    name: "GanttChart",
    data() {
        return {
            ganttData: { data: [], links: [] }, // Dữ liệu cho tasks và links
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

                // Khởi tạo Datastore cho resources
                if (!gantt.$resourcesStore) {
                    gantt.$resourcesStore = gantt.createDatastore({
                        name: gantt.config.resource_store,
                        type: "treeDatastore",
                        initItem: (item) => {
                            console.log(item);
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

                // Parse resources vào Datastore
                if (gantt.$resourcesStore) {

                    gantt.$resourcesStore.parse([
                        { id: 1, text: "Wood", parent: null },
                        { id: 2, text: "Iron", parent: null },
                        { id: 3, text: "Plastic", parent: null },
                        { id: 4, text: "Concrete", parent: null },
                        { id: 5, text: "Glass", parent: null },
                        { id: 6, text: "Rubber", parent: null },
                        { id: 7, text: "Polymer", parent: null },
                        { id: 8, text: "Plywood", parent: null },
                        { id: 9, text: "Carton", parent: null },
                        { id: 10, text: "Paper", parent: null }
                    ]);

                    console.log('gantt.$resourcesStore', gantt.$resourcesStore)
                }

                // Lưu dữ liệu vào serverList
                gantt.serverList("priority", this.prioritie_data);
                gantt.serverList("owner", ownersResponse);

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
        // Khởi tạo Gantt Chart
        initGantt() {
            gantt.plugins({grouping: true});



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
                    template: (task) => this.renderOwners(task),
                },
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
            gantt.config.lightbox.sections = [
                {name: "description", height: 38, map_to: "text", type: "textarea", focus: true},
                {name: "priority", type: "select", map_to: "priority", options: gantt.serverList("priority")},
                {name: "owner", type: "checkbox", map_to: "owner", options: gantt.serverList("owner")},
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
            if (type) {
                gantt.groupBy({
                    groups: gantt.serverList(type),
                    relation_property: type,
                    group_id: "key",
                    group_text: "label",
                    default_group_label: "Unassigned",
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
        renderOwners(task) {
            const owners = gantt.serverList("owner");
            if (task.owner && Array.isArray(task.owner)) {
                return task.owner
                    .map((id) => {
                        const owner = owners.find((o) => o.key === id);
                        return owner ? `<div>${owner.label}</div>` : "";
                    })
                    .join("");
            }
            return "Unassigned";
        },

        // Render priorities trong cột Priorities
        renderPriorities(task) {
            const priorities = gantt.serverList("priority");
            // console.log(priorities);
            const priority = priorities.find((p) => p.key === Number(task.priority));
            return priority ? priority.label : "Unassigned";
        },

        // Render materials trong cột Material
        renderMaterials(task) {
            const store = gantt.getDatastore("resource");
            const assignments = task[gantt.config.resource_property];
            // console.log('assignments',assignments[0].resource_id);
            if (!assignments || !assignments.length) {
                return "Unassigned";
            }
            if (assignments.length === 1 && assignments[0].resource_id) {
                const item = store.getItem(assignments[0].resource_id);
                return item ? item.text : "Unknown";
            }
            return assignments.map((assignment) => {
                    const item = store.getItem(assignment.resource_id);
                    return item ? `<div>${item.text}</div>` : "";
                }).join("");
        },
    },
};
</script>

<style scoped>
#gantt_here {
    width: 100%;
    height: calc(100vh - 52px);
}

.gantt_control {
    margin-bottom: 10px;
}

.gantt_grid_scale .gantt_grid_head_cell {
    font-weight: bold;
    font-size: 14px;
}
</style>
