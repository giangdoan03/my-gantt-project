<template>
    <div>
        <h1>Thêm gói thầu mới</h1>
        <a-form @submit.prevent="handleSubmit">
            <!-- Tên dự án -->
            <a-form-item label="Tên dự án" required>
                <a-input v-model="bid.project_name" placeholder="Nhập tên dự án" />
            </a-form-item>

            <!-- Tổ chức mời thầu -->
            <a-form-item label="Tổ chức mời thầu" required>
                <a-input v-model="bid.organization" placeholder="Nhập tổ chức mời thầu" />
            </a-form-item>

            <!-- Giá trị dự thầu -->
            <a-form-item label="Giá trị dự thầu" required>
                <a-input-number
                    v-model="bid.bid_amount"
                    placeholder="Nhập giá trị dự thầu"
                    style="width: 100%;"
                />
            </a-form-item>

            <!-- Ngày nộp hồ sơ -->
            <a-form-item label="Ngày nộp hồ sơ" required>
                <a-date-picker v-model="bid.submission_date" placeholder="Chọn ngày nộp hồ sơ" style="width: 100%;" />
            </a-form-item>

            <!-- Trạng thái -->
            <a-form-item label="Trạng thái" required>
                <a-select v-model="bid.status" placeholder="Chọn trạng thái">
                    <a-select-option value="Đang xét duyệt">Đang xét duyệt</a-select-option>
                    <a-select-option value="Đã trúng thầu">Đã trúng thầu</a-select-option>
                    <a-select-option value="Không trúng thầu">Không trúng thầu</a-select-option>
                </a-select>
            </a-form-item>

            <!-- Lý do không trúng thầu -->
            <a-form-item v-if="bid.status === 'Không trúng thầu'" label="Lý do không trúng thầu">
                <a-input
                    v-model="bid.reason"
                    placeholder="Nhập lý do không trúng thầu"
                />
            </a-form-item>

            <!-- Tài liệu đính kèm -->
            <a-form-item label="Tài liệu đính kèm">
                <a-input
                    v-model="document.name"
                    placeholder="Nhập tên tài liệu"
                    style="margin-bottom: 10px;"
                />
                <a-input
                    v-model="document.path"
                    placeholder="Nhập đường dẫn tài liệu"
                    style="margin-bottom: 10px;"
                />
                <a-button type="primary" @click="addDocument">Thêm tài liệu</a-button>
                <ul>
                    <li v-for="(doc, index) in bid.documents" :key="index">
                        {{ doc.name }} - {{ doc.path }}
                        <a-button type="link" @click="removeDocument(index)">Xóa</a-button>
                    </li>
                </ul>
            </a-form-item>

            <!-- Nút Lưu -->
            <a-form-item>
                <a-button type="primary" html-type="submit">Lưu</a-button>
            </a-form-item>
        </a-form>
    </div>
</template>

<script>
import { createBid } from "@/apis/bids"; // Import API để thêm gói thầu mới

export default {
    data() {
        return {
            bid: {
                project_name: "",
                organization: "",
                bid_amount: null,
                submission_date: null,
                status: "Đang xét duyệt",
                reason: "",
                documents: [],
            },
            document: {
                name: "",
                path: "",
            },
        };
    },
    methods: {
        // Thêm tài liệu vào danh sách documents
        addDocument() {
            if (this.document.name && this.document.path) {
                this.bid.documents.push({ ...this.document });
                this.document.name = "";
                this.document.path = "";
            } else {
                this.$message.error("Vui lòng nhập tên và đường dẫn tài liệu!");
            }
        },

        // Xóa tài liệu khỏi danh sách documents
        removeDocument(index) {
            this.bid.documents.splice(index, 1);
        },

        // Gửi dữ liệu lên server
        async handleSubmit() {
            try {
                await createBid(this.bid);
                this.$message.success("Thêm gói thầu thành công!");
                this.$router.push("/bids"); // Chuyển hướng về danh sách gói thầu
            } catch (error) {
                this.$message.error("Không thể thêm gói thầu!");
                console.error("Failed to create bid:", error);
            }
        },
    },
};
</script>
