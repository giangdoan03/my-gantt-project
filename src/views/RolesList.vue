<template>
    <div class="role-management">
        <!-- Thanh tìm kiếm và thêm vai trò -->
        <a-row justify="space-between" class="search-bar">
            <a-col>
                <a-input v-model="searchKeyword" placeholder="🔍 Tìm kiếm vai trò" @input="filterRoles" />
            </a-col>
            <a-col>
                <a-button type="primary" @click="addRole">+ Thêm vai trò</a-button>
            </a-col>
        </a-row>

        <!-- Bảng danh sách vai trò -->
        <a-table :columns="columns" :data-source="filteredRoles" :row-key="record => record.id" bordered
            :pagination="false" class="role-table">
            <template #actions="{ record }">
                <a-space>
                    <!-- Nút Sửa -->
                    <a-button type="link" icon="edit" @click="editRole(record)">
                        Sửa
                    </a-button>
                    <!-- Nút Xóa -->
                    <a-popconfirm title="Bạn có chắc muốn xóa vai trò này không?" ok-text="Xóa" cancel-text="Hủy"
                        @confirm="deleteRole(record.id)">
                        <a-button type="link" danger>🗑️ Xóa</a-button>
                    </a-popconfirm>
                </a-space>
            </template>
        </a-table>
    </div>
</template>

<script>
import { fetchRoles, deleteRole } from "@/apis/roles";

export default {
    name: "RolesList",
    data() {
        return {
            roles: [], // Danh sách vai trò
            searchKeyword: "", // Từ khóa tìm kiếm
            columns: [
                {
                    title: "#",
                    dataIndex: "id",
                    key: "id",
                },
                {
                    title: "Tên vai trò",
                    dataIndex: "role_name",
                    key: "role_name",
                },
                {
                    title: "Mô tả",
                    dataIndex: "description",
                    key: "description",
                },
                {
                    title: "Hành động",
                    key: "actions",
                    scopedSlots: { customRender: "actions" },
                },
            ],
        };
    },
    computed: {
        filteredRoles() {
            // Lọc danh sách vai trò dựa trên từ khóa tìm kiếm
            if (!this.searchKeyword) {
                return this.roles;
            }
            return this.roles.filter((role) =>
                role.role_name.toLowerCase().includes(this.searchKeyword.toLowerCase())
            );
        },
    },
    methods: {
        async fetchRolesData() {
            try {
                const data = await fetchRoles(); // Gọi hàm API fetchRoles
                this.roles = data.data; // Gán danh sách vai trò từ API
            } catch (error) {
                console.error("Lỗi khi lấy danh sách vai trò:", error);
                this.$message.error("Không thể tải danh sách vai trò.");
            }
        },
        async deleteRoleData(roleId) {
            try {
                await deleteRole(roleId); // Gọi hàm API deleteRole
                this.$message.success("Xóa vai trò thành công!");
                this.fetchRolesData(); // Refresh danh sách vai trò
            } catch (error) {
                console.error("Lỗi khi xóa vai trò:", error);
                this.$message.error("Xóa vai trò thất bại. Vui lòng thử lại.");
            }
        },
        addRole() {
            this.$router.push({ name: "AddRole" });
        },
        editRole(role) {
            this.$router.push({ name: "EditRole", params: { id: role.id } });
        },
        filterRoles() {
            console.log("Tìm kiếm vai trò:", this.searchKeyword);
        },
    },
    mounted() {
        this.fetchRolesData(); // Lấy danh sách vai trò khi component được gắn vào
    },
};
</script>

<style scoped>
.role-management {
    padding: 20px;
}

.search-bar {
    margin-bottom: 20px;
}

.role-table .ant-btn-link {
    padding: 0;
}
</style>