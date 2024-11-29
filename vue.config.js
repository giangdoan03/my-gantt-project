const path = require('path');

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  },
  devServer: {
    client: {
      overlay: false // Tắt overlay hiển thị lỗi
    }
  }
};
