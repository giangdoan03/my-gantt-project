<template>
    <div>
        <a-list
            v-if="files && files.length > 0"
            item-layout="horizontal"
            :data-source="files"
        >
            <template #renderItem="{ item }">
                <a-list-item>
                    <a-list-item-meta
                        :title="item.name"
                        :description="`Ngày tải lên: ${item.date}`"
                    />
                    <template #actions>
                        <a-button
                            type="link"
                            @click="downloadFile(item.id)"
                        >
                            <download-outlined />
                            Tải xuống
                        </a-button>
                    </template>
                </a-list-item>
            </template>
        </a-list>
        <div v-else class="no-data">
            <a-empty description="Không có tài liệu nào được tìm thấy" />
        </div>
    </div>
</template>

<script>
import { DownloadOutlined } from "@ant-design/icons-vue";

export default {
    name: "FileList",
    components: {
        DownloadOutlined,
    },
    props: {
        files: {
            type: Array,
            required: true,
        },
    },
    methods: {
        downloadFile(fileId) {
            console.log("Tải xuống file ID:", fileId);
        },
    },
};
</script>

<style scoped>
.no-data {
    text-align: center;
    padding: 20px;
}
</style>
