<template>
    <div class="chat-app">
        <ChatSidebar :users="users" @selectUser="selectUser"/>
        <ChatWindow :selectedUser="selectedUser" />
    </div>
</template>

<script>
import ChatSidebar from './ChatSidebar.vue';
import ChatWindow from './ChatWindow.vue';

export default {
    name: 'ChatApp',
    components: {
        ChatSidebar,
        ChatWindow
    },
    data() {
        return {
            users: [
                { id: 1, name: 'User 1' },
                { id: 2, name: 'User 2' },
                { id: 3, name: 'User 3' }
            ],
            selectedUser: null
        };
    },
    methods: {
        selectUser(user) {
            this.selectedUser = user;
        }
    }
};
</script>

<style>
.chat-app {
    display: flex;
}
body{margin-top:20px;}

.chat-online {
    color: #34ce57
}

.chat-offline {
    color: #e4606d
}

.chat-messages {
    display: flex;
    flex-direction: column;
    max-height: 800px;
    overflow-y: scroll
}

.chat-message-left,
.chat-message-right {
    display: flex;
    flex-shrink: 0
}

.chat-message-left {
    margin-right: auto
}

.chat-message-right {
    flex-direction: row-reverse;
    margin-left: auto
}
.py-3 {
    padding-top: 1rem!important;
    padding-bottom: 1rem!important;
}
.px-4 {
    padding-right: 1.5rem!important;
    padding-left: 1.5rem!important;
}
.flex-grow-0 {
    flex-grow: 0!important;
}
.border-top {
    border-top: 1px solid #dee2e6!important;
}
</style>
