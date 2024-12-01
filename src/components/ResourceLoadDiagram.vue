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
</template >

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
        };
    },
    methods: {
        // Fetch data từ API
        async fetchData() {
            try {
                const tasksResponse = await getTasks();
                const resourcesResponse = await getResources();
                const prioritiesResponse = await getPriorities();
                const ownersResponse = await getOwners();

                console.log('ownersResponse', ownersResponse);


                // Cập nhật dữ liệu vào Gantt
                // this.ganttData.data = tasksResponse; // Tasks

                this.ganttData.data = tasksResponse.map((task) => {
                    // Nếu start_date/end_date là chuỗi
                    if (typeof task.start_date === "string") {
                        task.start_date = new Date(task.start_date.replace(" ", "T"));
                    }

                    if (typeof task.end_date === "string") {
                        task.end_date = new Date(task.end_date.replace(" ", "T"));
                    }

                    return task;
                });

                this.resourceData = resourcesResponse; // Resources

                gantt.serverList("priority", prioritiesResponse); // Priorities
                gantt.serverList("owner", ownersResponse); // Owners

                // Khởi tạo Gantt sau khi có dữ liệu
                this.initGantt();
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        },

        // Khởi tạo Gantt Chart
        initGantt() {
            gantt.plugins({grouping: true});

            // Cấu hình Gantt Chart
            gantt.config.open_tree_initially = true;


            gantt.locale.labels.section_split = "Display";
            gantt.locale.labels.section_priority = "Priority";
            gantt.config.resource_store = "resource";
            gantt.config.resource_property = "material";
            gantt.locale.labels.section_owner = "Owner";
            gantt.locale.labels.section_material = "Material";

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
                            return formatDateToVietnameseDateOnly(task.start_date); // Hiển thị ngày/tháng/năm
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
                {name: "time", type: "duration", map_to: "auto"},
            ];

            // Khởi tạo dữ liệu vào Gantt
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
            console.log('owners', owners);

            if (task.owner && Array.isArray(task.owner)) {
                return task.owner.map((id) => {
                    const owner = owners.find((o) => o.key === id);
                    return owner ? `<div>${owner.label}</div>` : "";
                }).join("");
            }
            return "Unassigned";
        },

        // Render priorities trong cột Priorities
        renderPriorities(task) {
            const priorities = gantt.serverList("priority");
            const priority = priorities.find((p) => p.key === task.priority);
            console.log('priorities', priorities);
            console.log('task', task);
            return priority ? priority.label : "Unassigned";
        },
    },

    mounted() {
        this.fetchData(); // Gọi API khi component được mount
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
