<template>
    <a-list
        item-layout="horizontal"
        :data-source="files"
        :render-item="renderFile"
    >
    </a-list>
</template>

<script>
export default {
    name: "FileList",
    props: {
        files: {
            type: Array,
            required: true,
        },
    },
    methods: {
        renderFile(file) {
            return (
                <a-list-item>
                    <a-list-item-meta
                        title={file.name}
                        description={`Ngày tải lên: ${file.date}`}
                    />
                    <template
                    #actions>
                    <a-button type="link" icon="download" @click={() => this.downloadFile(file.id)}>
                    Tải xuống
                </a-button>
        </template>
        </a-list-item>
        )
            ;
        },
        downloadFile(fileId) {
            console.log("Tải xuống file ID:", fileId);
        },
    },
};
</script>
