## what's this?

bss后台系统<br/>

## 技术栈
react / mobx-react / webpack / antd4.0 / ES6+

<ul>
 <li>非服务端渲染</li>
</ul>

## 构建 Start

```javascript
yarn install       // 安装依赖模块
yarn dll           // 编译静态资源
yarn start         // 运行开发环境，默认监听8889端口
```

## 接口文档地址
http://10.2.5.205:8888/swagger-ui.html

## 文件结构说明
```bash
├──dist   // 编译后文档  
│
├──index.html     //模板文档  
│
├──dll    // 第三方库压缩包，提高性能 
│ 
├──mock   // 模拟数据，已经不需要使用了 
│ 
├──node_modules // 依赖包 
│ 
├──public  // 存放静态资源，不需要进行特殊处理的静态资源 
│ 
├──webpack  // webpack 相关配置 
│
├──src // 开发资源 
│   ├── assets // 静态资源 
│   ├── imgs // 图片 
│   ├──iconfont // 图标 
│   ├──components //针对整个项目，全局通用的组件库(遵循单一职责) 
│   ├──config      // 全局配置 
│   ├──containers   //全局可通用的模块，为后期通过配置就可以生成页面 
│   ├──layouts      //布局方便的通过模块 
│   ├──locales      // 多语言的翻译文档 
│   ├──pages     // 页面级别组件 
│   ├──router    // 路由入口 
│   ├── stores     // mobx 状态维护仓库 
│   ├──style       //全局样式 
│   ├──util        //实用工具库 
│   ├──app.js      //入口文件 

```


## 组件设计Note
在组件的设计上，应该明确`components`和`containers`目录中的组件职责：
- 尽量保持`components`中的为纯组件，一般来说它所需要的数据都来源于页面组件或者父组件传给它的`props`。
- `containers`是页面维度的组件，它的职责是绑定相关联的`stores`数据，以数据容器的角色包含其它子组件。
