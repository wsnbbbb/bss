
# babel-polyfill 与 babel-runtime 
https://www.jianshu.com/p/73ba084795ce

babel-polyfill与babel-runtime相比虽然有各种缺点，但在某些情况下仍然不能被babel-runtime替代， 例如，代码：[1, 2, 3].includes(3)，Object.assign({}, {key: 'value'})，Array，Object以及其他”实例”下es6的方法，babel-runtime是无法支持的， 因为babel-runtime只支持到static的方法。


# Babel编译转码的范围
Babel默认只转换新的JavaScript语法，而不转换新的API。 例如，Iterator、Generator、Set、Maps、Proxy、Reflect、Symbol、Promise 等全局对象，以及一些定义在全局对象上的方法（比如 Object.assign）都不会转译。 如果想使用这些新的对象和方法，则需要为当前环境提供一个polyfill
# babel-polyfill
目前最常用的配合Babel一起使用的polyfill是babel-polyfill，它会”加载整个polyfill库”，针对编译的代码中新的API进行处理，并且在代码中插入一些帮助函数。

这段代码
const key = 'babel'
const obj = {
    [key]: 'polyfill',
}
转码后：
function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
    } else {
        obj[key] = value;
    }
    return obj;
}
var key = 'babel';
var obj = _defineProperty({}, key, Object.assign({}, { key: 'polyfill' }));

# babel-runtime 
babel-polyfill解决了Babel不转换新API的问题，但是直接在代码中插入帮助函数，会导致污染了全局环境，并且不同的代码文件中包含重复的代码，导致编译后的代码体积变大。 （比如：上述的帮助函数_defineProperty有可能在很多的代码模块文件中都会被插入）

Babel为了解决这个问题，提供了单独的包babel-runtime用以提供编译模块的工具函数， 启用插件babel-plugin-transform-runtime后，Babel就会使用babel-runtime下的工具函数，上述的代码就会变成这样

` var _defineProperty2 = __webpack_require__("./node_modules/babel-runtime/helpers/defineProperty.js");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = __webpack_require__("./node_modules/babel-runtime/core-js/object/assign.js");

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { 
    return obj && obj.__esModule ? obj : { default: obj }; 
}

var key = 'babel';
var obj = (0, _defineProperty3.default)(
            {}, key, (0, _assign2.default)({}, { key: 'polyfill' })
          );`
可以看到上述转换后的代码中_defineProperty帮助函数是通过babel-runtime下的模块引用的， 同时Object.assign也变成了模块引用, 这样可以避免自行引入polyfill时导致的污染全局命名空间的问题。

作者：zackxizi
链接：https://www.jianshu.com/p/73ba084795ce
来源：简书
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

# @babel/plugin-proposal-class-properties 
## 功能：
> Below is a class with four class properties which will be transformed
> 用来编译类(class)
> 特别是calss类组件里面可以使用箭头函数

### 安装
 ` npm install --save-dev @babel/plugin-proposal-class-properties `
### 配置  .babelrc
      有参数：{ "plugins": [ ["@babel/plugin-proposal-class-properties", { "loose": true }] ] }   
      没参数：{ "plugins": ["@babel/plugin-proposal-class-properties"] }
### 效果
` class Bork {
    static a = 'foo';
    static b;

    x = 'bar';
    y;
  } `
1. Without { "loose": true }, the above code will compile to the following, using Object.defineProperty:
    ` var Bork = function Bork() {
      babelHelpers.classCallCheck(this, Bork);
      Object.defineProperty(this, "x", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: 'bar'
      });
      Object.defineProperty(this, "y", {
        configurable: true,
        enumerable: true,
        writable: true,
        value: void 0
      });
    };

    Object.defineProperty(Bork, "a", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: 'foo'
    });
    Object.defineProperty(Bork, "b", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: void 0
    }); 
    `

2. However, with { "loose": true }, it will compile using assignment expressions:
` var Bork = function Bork() {
  babelHelpers.classCallCheck(this, Bork);
  this.x = 'bar';
  this.y = void 0;
};

Bork.a = 'foo';
Bork.b = void 0; `

# @babel/plugin-proposal-decorators
## 功能
 代码中可以使用装饰器
 1. Simple class decorator

 ` @annotation
class MyClass { }

function annotation(target) {
   target.annotated = true;
} `

2. Class decorator

` @isTestable(true)
class MyClass { }

function isTestable(value) {
   return function decorator(target) {
      target.isTestable = value;
   }
} `

3. Class function decorator
` class C {
  @enumerable(false)
  method() { }
}

function enumerable(value) {
  return function (target, key, descriptor) {
     descriptor.enumerable = value;
     return descriptor;
  }
} `


## 安装
 ` npm install --save-dev @babel/plugin-proposal-decorators `

## 使用 With a configuration file (Recommended)
` {
  "plugins": ["@babel/plugin-proposal-decorators"]
} `

# @babel/plugin-proposal-object-rest-spread

## 功能
1. Rest Properties
 ` let { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };
console.log(x); // 1
console.log(y); // 2
console.log(z); // { a: 3, b: 4 }
`
2. Spread Properties
` let n = { x, y, ...z };
console.log(n); // { x: 1, y: 2, a: 3, b: 4 } `

## 安装
npm install --save-dev @babel/plugin-proposal-object-rest-spread

## 使用 With a configuration file (Recommended)
{
  "plugins": ["@babel/plugin-proposal-object-rest-spread"]
}

# @babel/plugin-syntax-dynamic-import

## 配置
{
  "plugins": ["@babel/plugin-syntax-dynamic-import"]
}

## 使用
Working with Webpack and @babel/preset-env

1. 
// webpack config
const config = {
  entry: [
    "core-js/modules/es.promise",
    "core-js/modules/es.array.iterator",
    path.resolve(__dirname, "src/main.js"),
  ],
  // ...
};

2. 
// src/main.js
import "core-js/modules/es.promise";
import "core-js/modules/es.array.iterator";

// ...

# @babel/plugin-transform-runtime
## 作用
每个Babel编译后的脚本文件，都以导入的方式使用Babel的帮助函数，而不是每个文件都复制一份帮助函数的代码。

1 优点

（1）提高代码重用性，缩小编译后的代码体积。

（2）防止污染全局作用域。（启用corejs配置）
A plugin that enables the re-use of Babel's injected helper code to save on codesize.
NOTE: Instance methods such as "foobar".includes("foo") will only work with core-js@3. If you need to polyfill them, you can directly import "core-js" or use @babel/preset-env's useBuiltIns option.

## 使用 With a configuration file (Recommended) .babelrc
{
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
      {
        "absoluteRuntime": false,
        "corejs": false,
        "helpers": true,
        "regenerator": true,
        "useESModules": false,
        "version": "7.0.0-beta.0"
      }
    ]
  ]
}

# 

## 作用 @babel/preset-env
@babel/preset-env is a smart preset that allows you to use the latest JavaScript without needing to micromanage which syntax transforms (and optionally, browser polyfills) are needed by your target environment(s). This both makes your life easier and JavaScript bundles smaller!

## 配置
{
  "presets": [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "entry"
      }
    ]
  ]
}

# @babel/preset-react

# @babel/runtime

# babel-eslint

