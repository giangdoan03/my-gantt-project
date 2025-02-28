import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Antd from 'ant-design-vue';
import 'ant-design-vue/es/style'; // Import đúng CSS cho Ant Design Vue 4
import 'normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { createPinia } from "pinia";

// Import Day.js và các plugin cần thiết
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/vi"; // Import ngôn ngữ Tiếng Việt

// Cấu hình Day.js
dayjs.extend(localeData);
dayjs.extend(localizedFormat);
dayjs.locale("vi"); // Thiết lập ngôn ngữ mặc định

// Tạo ứng dụng Vue
const app = createApp(App);

// Sử dụng các plugin và thư viện
app.use(router);
app.use(Antd);
app.use(createPinia());

// Gắn ứng dụng vào DOM
app.mount('#app');
