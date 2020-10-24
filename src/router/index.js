/** 根路由 **/
import React from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import P from 'prop-types';
import {createBrowserHistory as createHistory} from 'history/'; // URL模式的history
// import { createHashHistory as createHistory } from "history"; // 锚点模式的history
import { User } from '@src/util/user';
import Loadable from 'react-loadable';
import tools from '../util/tools';

/** 本页面所需页面级组件 **/
// import BasicLayout from '../layouts/BasicLayout';
// import BasicLayout from '../layouts1/BasicLayout';
import BasicLayout from '../layouts2/BasicLayout';


/** 普通组件 **/
import enUS from 'antd/es/locale/en_US';
import zhCN from 'antd/es/locale/zh_CN';
import Loading from '../components/loading';
import Hub from '../pages/Login/hub';
// ==================
// 路由
// ==================
const [NotFound, Login] = [
  () => import('../pages/ErrorPages/404'),
  () => import('../pages/Login'),
].map((item) => Loadable({
  loader: item,
  loading: Loading
}));

const history = createHistory();
export default class RootContainer extends React.Component {
  static propTypes = {
    dispatch: P.func,
    children: P.any,
    userinfo: P.any
  };

  constructor (props) {
    super(props);
  }

  componentDidMount () {
  }

  /** 切换路由时触发 **/
  onEnter (Component, props) {

    /**
     *  有用户信息，说明已登录
     *  没有，则跳转至登录页
     * **/
    const hasToken = User.getToken() && User.getUserName();
    if (hasToken) {
      return <Component {...props} />;
    } else {
      User.setToken(null);
      localStorage.clear();
      sessionStorage.clear();
      location.href = LOGINURL;
    }
    return <Component {...props} />;
  }
  render () {
    return (
      <Router history={history}>
        <Route
          render={(props) => (
            <Switch>
              <Route path="/hub" component={Hub} exact/>
              <Route
                path="/"
                render={(props) => this.onEnter(BasicLayout, props)}
              />
            </Switch>
          )}
        />
      </Router>
    );
  }
}
