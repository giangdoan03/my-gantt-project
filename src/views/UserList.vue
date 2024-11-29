<template>
    <div class="user-management">
        <!-- Thanh tìm kiếm và thêm người dùng -->
        <a-row justify="space-between" class="search-bar">
            <a-col>
                <a-input v-model="searchKeyword" placeholder="🔍 Tìm kiếm người dùng" @input="filterUsers" />
            </a-col>
            <a-col>
                <a-button type="primary" @click="addUser">+ Thêm người dùng</a-button>
            </a-col>
        </a-row>

        <!-- Bảng danh sách người dùng -->
        <a-table :columns="columns" :data-source="filteredUsers" :row-key="record => record.id" bordered>
            <!-- Kiểm tra column và xác định cột "Hành động" -->
            <template v-slot:bodyCell="{ column, record }">
                <template v-if="column && column.key === 'actions'">
                    <a-space>
                        <!-- Nút Sửa -->
                        <a-tooltip title="Sửa">
                            <a-button type="link" @click="editUser(record)">
                                <edit-outlined />
                            </a-button>
                        </a-tooltip>
                        <!-- Nút Xóa -->
                        <a-tooltip title="Xóa">
                            <a-popconfirm title="Bạn có chắc muốn xóa người dùng này không?" ok-text="Xóa"
                                cancel-text="Hủy" @confirm="deleteUser(record.id)">
                                <a-button type="link" danger>
                                    <delete-outlined />
                                </a-button>
                            </a-popconfirm>
                        </a-tooltip>

                    </a-space>
                </template>
            </template>
        </a-table>


    </div>
</template>

<script>
import { fetchUsers, deleteUser } from "@/apis/users";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons-vue";

export default {
    name: "UserList",
    components: {
        EditOutlined,
        DeleteOutlined,
    },
    data() {
        return {
            users: [], // Danh sách người dùng
            searchKeyword: "", // Từ khóa tìm kiếm
            columns: [
                {
                    title: "#",
                    dataIndex: "id",
                    key: "id",
                },
                {
                    title: "Tên người dùng",
                    dataIndex: "name",
                    key: "name",
                },
                {
                    title: "Email",
                    dataIndex: "email",
                    key: "email",
                },
                {
                    title: "Vai trò",
                    dataIndex: "role",
                    key: "role",
                },
                {
                    title: "Hành động",
                    key: "actions", // Phải có `key` cho cột "Hành động"
                },
            ],

        };
    },
    computed: {
        filteredUsers() {
            // Lọc danh sách người dùng dựa trên từ khóa tìm kiếm
            if (!this.searchKeyword) {
                return this.users;
            }
            return this.users.filter((user) =>
                user.name.toLowerCase().includes(this.searchKeyword.toLowerCase())
            );
        },
    },
    methods: {
        async fetchUsersData() {
            try {
                const data = await fetchUsers(); // Gọi hàm API fetchUsers
                this.users = data.data; // Gán danh sách người dùng từ API
            } catch (error) {
                console.error("Lỗi khi lấy danh sách người dùng:", error);
                this.$message.error("Không thể tải danh sách người dùng.");
            }
        },
        async deleteUser(userId) {
            try {
                // Gọi API xóa người dùng
                await deleteUser(userId);
                this.$message.success("Xóa người dùng thành công!");
                // Refresh lại danh sách người dùng sau khi xóa
                this.fetchUsersData();
            } catch (error) {
                console.error("Lỗi khi xóa người dùng:", error);
                this.$message.error("Xóa người dùng thất bại. Vui lòng thử lại.");
            }
        },

        addUser() {
            this.$router.push({ name: "AddUser" });
        },
        editUser(user) {
            if (user && user.id) {
                this.$router.push({ name: "EditUser", params: { id: user.id } });
            } else {
                console.warn("User ID is invalid or undefined.");
            }
        },
        filterUsers() {
            console.log("Tìm kiếm người dùng:", this.searchKeyword);
        },
    },
    mounted() {
        this.fetchUsersData(); // Lấy danh sách người dùng khi component được gắn vào
    },
};
</script>

<style scoped>
.user-management {
    padding: 20px;
}

.search-bar {
    margin-bottom: 20px;
}

.user-table .ant-btn-link {
    padding: 0;
}

.user-table .ant-btn-link:hover {
    color: #1890ff;
}
</style>
