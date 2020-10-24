const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const Dashboard = require("webpack-dashboard");
const DashboardPlugin = require("webpack-dashboard/plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpackBaseConfig = require("./webpack.config")();
const { theme } = require("../theme.json");
const dashboard = new Dashboard();

module.exports = merge(webpackBaseConfig, {
  mode: "development",
  entry: {
    app: [
      "react-hot-loader/patch",
      // activate HMR for React

      "webpack-dev-server/client?http://localhost:8889",
      // bundle the client for webpack-dev-server
      // and connect to the provided endpoint

      "webpack/hot/only-dev-server",
      // bundle the client for hot reloading
      // only- means to only hot reload for successful updates

      path.join(__dirname, "../src/app")
      // the entry point of our app
    ]
  },
  output: {
    path: path.join(__dirname, "../dist/"),
    filename: "js/[name].dev.js",
    publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.(c|le)ss$/,
        use: [
          'css-hot-loader',
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              importLoaders: 1
            }
          },
          {
            loader: "postcss-loader",
            options: {
              plugins: function () {
                return [require('autoprefixer')()];
              }
            }
          },
          {
            loader: "less-loader",
            options: {
              modifyVars: theme,
              javascriptEnabled: true
            }
          }
        ],
      },
      {
        test: /\.js[x]?$/,
        use: "babel-loader",
        exclude: /node_modules/
      },
      // {
      //   test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
      //   use: "file-loader?name=fonts/[name].[ext]"
      // },
      {
        // 图片解析
        test: /\.(png|jpg|jpeg|gif)$/i,
        include: path.resolve(__dirname, '../src'),
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'assets/imgs',  // 指定图片路径
              useRelativePath: true
            }
          },
        ],
      }
    ]
  },
  // devtool: "eval-source-map", // 报错的时候在控制台输出哪一行报错
  devtool: 'source-map',
  devServer: {
    hot: true,
    // enable HMR on the server
    // match the output path
    publicPath: "/",
    // match the output `publicPath`
    historyApiFallback: true,
    port: 8889,
    // host: "10.2.3.37",
    // proxy: {
    // "/bendi/api": {
    //   changeOrigin: true,
    //   pathRewrite: {'^/bendi/api': ''}, // 可转换
    //   target: "http://10.2.5.205:8081",
    // }
    // }
  },
  plugins: [
    // new DashboardPlugin(dashboard.setData),
    new webpack.HotModuleReplacementPlugin(),
    new MiniCssExtractPlugin({
      filename: "css/[name].css"
    })
  ]
});
