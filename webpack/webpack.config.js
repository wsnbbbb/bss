const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin"); // 动态生成html插件
const manifest = require("../dist/dll/manifest.json");

module.exports = () => {
  const config = {
    module: {
      rules: [
        {
          test: /\.js[x]?$/,
          use: "babel-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
          use: "file-loader?name=fonts/[name].[ext]",
        },
        // {
        //   // 图片解析
        //   test: /\.(png|jpe?g?)(\?[a-z0-9=&.]+)?$/,
        //   include: path.resolve(__dirname, "../src"),
        //   use: [
        //     {
        //       loader: "url-loader",
        //       options: {
        //         limit: 8192,
        //         name: "assets/[name].[hash:4].[ext]"
        //       }
        //     }
        //   ]
        // },
        // {
        //   // 图片解析
        //   test: /\.(png|jpg|jpeg|gif)$/i,
        //   include: path.resolve(__dirname, '../src'),
        //   use: [
        //     {
        //       loader: 'file-loader',
        //       options: {
        //         // outputPath: 'assets/imgs',  // 指定图片路径
        //         // useRelativePath: true
        //       }
        //       // loader: 'url-loader',
        //       // options: {
        //       //   limit: 8192,
        //       //   name: 'assets/[name].[hash:4].[ext]',
        //       // },
        //     },
        //   ],
        // }
      ],
    },
    plugins: [
      new webpack.DllReferencePlugin({
        context: __dirname,
        manifest,
      }),
      // new HtmlWebpackPlugin({
      //   // 根据模板插入css/js等生成最终HTML
      //   filename: 'index.html', // 生成的html存放路径，相对于 output.path
      //   favicon: './public/favicon.png', // 自动把根目录下的favicon.ico图片加入html
      //   template: './public/index.ejs', // html模板路径
      //   inject: true, // 是否将js放在body的末尾
      //   templateParameters: {
      //     dll: "<script src='/vendor.dll.js'></script>",
      //     manifest: '',
      //   },
      // }),
    ],
    resolve: {
      extensions: [".js", ".jsx", ".less"], // 后缀名自动补全
      alias: {
        "@src": path.resolve(__dirname, "../src"),
      },
    },
  };

  return config;
};
