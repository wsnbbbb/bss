/** APP入口 **/
import "core-js/stable";
import "regenerator-runtime/runtime";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "mobx-react";
import { configure } from "mobx";
import AppStore from "./stores";
import Router from "./router";
import moment from 'moment';
import 'moment/locale/zh-cn';

/** 公共样式 **/
import "@src/styles/index.less";
// 开启严格模式
configure({ enforceActions: "always" });
ReactDOM.render(
  // 通过 Provider 渗透
  <Provider {...AppStore}>
    <Router />
  </Provider>,
  document.getElementById("app-root")
);

// 热更新
if (module && module.hot) {
  module.hot.accept();
}
