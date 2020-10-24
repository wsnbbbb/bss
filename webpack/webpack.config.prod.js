const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin"); // 生成html
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WebpackVersionPlugin = require('webpack-version-plugin');
const { theme } = require("../theme.json");
const webpackBaseConfig = require('./webpack.config')();
const manifest = require("../dist/dll/manifest.json");
module.exports = merge(webpackBaseConfig, {
  mode: 'production',
  entry: {
    app: path.join(__dirname, "../src/app")
  },
  output: {
    path: path.join(__dirname, '../dist/'),
    filename: "js/[name].[chunkhash:8].js",
    // publicPath: process.env.BETA === 'true' ? '//your_cdn_path/beta/project_name/' : '//your_cdn_path/release/project_name/'
    publicPath: '/',
    chunkFilename: "js/[name].[chunkhash:8].chunk.js"
  },
  module: {
    rules: [
      {
        // .js .jsx用babel解析
        test: /\.js?$/,
        include: path.resolve(__dirname, "../src"),
        use: ["babel-loader"]
      },
      {
        // .css 解析
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
      {
        // .less 解析
        test: /\.less$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader",
          { loader: "less-loader", options: {
            javascriptEnabled: true,
            modifyVars: theme
          } }],
      },
      // {
      //   test: /\.(c|le)ss$/,
      //   use: [
      //     // MiniCssExtractPlugin.loader,
      //     {
      //       loader: MiniCssExtractPlugin.loader,
      //       options: {
      //         esModule: true,
      //       },
      //     },
      //     { loader: "style-loader"},
      //     {
      //       loader: "css-loader",
      //       options: {
      //         importLoaders: 1
      //       }
      //     },
      //     {
      //       loader: "postcss-loader",
      //       options: {
      //         plugins: function () {
      //           return [require('autoprefixer')()];
      //         }
      //       }
      //     },
      //     {
      //       loader: "less-loader",
      //       options: {
      //         modifyVars: theme,
      //         javascriptEnabled: true
      //       }
      //     }
      //   ],
      // },
      {
        // 文件解析
        test: /\.(eot|woff|otf|svg|ttf|woff2|appcache|mp3|mp4|pdf)(\?|$)/,
        include: path.resolve(__dirname, "../src"),
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: 'assets/font',  // 指定图片路径
              name: "assets/[name].[hash:4].[ext]"
            }
          }
        ]
      },
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
      },
      {
        // wasm文件解析
        test: /\.wasm$/,
        include: path.resolve(__dirname, "../src"),
        type: "webassembly/experimental"
      },
      {
        // xml文件解析
        test: /\.xml$/,
        include: path.resolve(__dirname, "../src"),
        use: ["xml-loader"]
      }
    ]
  },
  optimization: {
    // minimizer: [
    //   new UglifyJsPlugin({
    //     cache: true,
    //     parallel: true,
    //     uglifyOptions: {
    //       compress: {
    //         warnings: true,
    //         drop_debugger: true,
    //         drop_console: false
    //       }
    //     },
    //     output: {
    //       comments: false // 去掉注释
    //     },
    //   }),
    //   new OptimizeCSSAssetsPlugin({})
    // ],
    minimizer: [
      new TerserPlugin({
        parallel: true, // 多线程并行构建
        terserOptions: {
          output: {
            comments: false // 不保留注释
          }
        }
      }),
      new OptimizeCSSAssetsPlugin({})
    ],
    splitChunks: {
      chunks: "async",
    },
    // splitChunks: {
    //   // async表示只从异步加载得模块（动态加载import()）里面进行拆分
    //   // initial表示只从入口模块进行拆分
    //   // all表示以上两者都包括
    //   chunks: "async",
    //   minSize: 30000,   // 大于30k会被webpack进行拆包
    //   minChunks: 1,     // 被引用次数大于等于这个次数进行拆分
    //   // import()文件本身算一个
    //   // 只计算js，不算css
    //   // 如果同时有两个模块满足cacheGroup的规则要进行拆分，但是maxInitialRequests的值只能允许再拆分一个模块，那尺寸更大的模块会被拆分出来
    //   maxAsyncRequests: 5,  // 最大的按需加载（异步）请求次数
    //   // 最大的初始化加载请求次数,为了对请求数做限制，不至于拆分出来过多模块
    //   // 入口文件算一个
    //   // 如果这个模块有异步加载的不算
    //   // 只算js，不算css
    //   // 通过runtimeChunk拆分出来的runtime不算在内
    //   // 如果同时又两个模块满足cacheGroup的规则要进行拆分，但是maxInitialRequests的值只能允许再拆分一个模块，那尺寸更大的模块会被拆分出来
    //   maxInitialRequests: 3,
    //   automaticNameDelimiter: '~', // 打包分隔符
    //   name: true,
    //   cacheGroups: {
    //     // 默认的配置
    //     vendors: {
    //       test: /[\\/]node_modules[\\/]/,
    //       priority: -10
    //     },
    //     // 默认的配置，vendors规则不命中的话，就会命中这里
    //     default: {
    //       minChunks: 2, // 引用超过两次的模块 -> default
    //       priority: -20,
    //       reuseExistingChunk: true
    //     },
    //   },
    // }
  },
  plugins: [
    // new CleanWebpackPlugin(),
    new BundleAnalyzerPlugin(),
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest
    }),
    // new webpack.DefinePlugin({
    //   'process.env.BETA': JSON.stringify(process.env.BETA)
    // }),

    /**
     * 提取CSS等样式生成单独的CSS文件
     * **/
    // new MiniCssExtractPlugin({
    //   filename: "dist/[name].[chunkhash:8].css" // 生成的文件名
    // }),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
      ignoreOrder: true,
    }),

    /**
     * 自动生成HTML，并注入各参数
     * **/
    new HtmlWebpackPlugin({
      filename: "index.html", // 生成的html存放路径，相对于 output.path
      template: "./build.html", // html模板路径
      // templateParameters: {
      //   // 自动替换index.ejs中的参数
      //   dll: "",
      //   manifest: "<link rel='manifest' href='manifest.json'>"
      // },
      // hash: false, // 防止缓存，在引入的文件后面加hash (PWA就是要缓存，这里设置为false)
      inject: true // 是否将js放在body的末尾
    }),
    new WebpackVersionPlugin({
      cb: (hashMap) => {
        console.log(hashMap);
      }
    })
  ]
});
