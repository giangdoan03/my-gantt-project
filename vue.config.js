const path = require('path');

module.exports = {
    configureWebpack: {
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'), // Alias để truy cập nhanh thư mục src
            },
            extensions: ['.js', '.vue', '.json', '.jsx'], // Các phần mở rộng được Webpack tự động thêm khi import
        },
    },
    devServer: {
        client: {
            overlay: false, // Tắt overlay lỗi trên trình duyệt
        },
        hot: true, // Bật HMR (Hot Module Replacement) để cập nhật nhanh
    },
    chainWebpack: config => {
        config.module
            .rule('vue')
            .use('vue-loader')
            .loader('vue-loader')
            .tap(options => {
                // Tùy chỉnh vue-loader options nếu cần thiết
                return {
                    ...options,
                };
            });
    },
};
