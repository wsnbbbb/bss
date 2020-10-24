const path = require("path");
const webpack = require("webpack");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const WebpackVersionPlugin = require("webpack-version-plugin");
const { dependencies } = require("../package.json");
module.exports = {
  mode: "development",
  entry: {
    vendor: Object.keys(dependencies)
  },
  output: {
    path: path.join(__dirname, "../dist/dll/"), // 生成的dll 路径，我是存在/dist/vendor中
    filename: "[name].dll.js", // 生成的文件名字
    library: "[name]" // 生成文件的一些映射关系，与下面DllPlugin中配置对应
  },
  plugins: [
    new CleanWebpackPlugin(),
    // 使用DllPlugin插件编译上面配置的NPM包
    new webpack.DllPlugin({
      // 会生成一个json文件，里面是关于dll.js的一些配置信息
      path: path.join(__dirname, "../dist/dll/manifest.json"),
      name: "[name]",
      context: __dirname
    }),
    new WebpackVersionPlugin({
      cb: (hashMap) => {
        console.log(hashMap);
      }
    })
  ]
};
