/* eslint-disable react/prop-types */
/** 基础页面结构 - 有头部，有底部，有侧边导航 **/

// ==================
// 必需的各种插件
// ==================
import React from 'react';
import P from 'prop-types';
import { Route, Switch, Redirect } from 'react-router-dom';
import Loadable from 'react-loadable';
import _ from 'lodash';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import tools from '@src/util/tools';
// ==================
// 所需的所有普通组件
// ==================
import { Layout, message } from 'antd';
import Users from './User';
import Search from './Search';
import Bread from './Bread';
import Menu from './Menu';
import Footer from './Footer';
import MyTabs from './MyTabs';
import Collect from './Collect';
import Loading from '@src/components/loading';
import './BasicLayout.less';
import routerConfig from '@src/config/router';
import {watermark} from "@src/util/water";// 水印
import {User} from "@src/util/user";
import moment, { now } from "moment";

// ==================
// 辅助页面路由
// ==================
const [NotFound, NoPower] = [
  () => import(`../pages/ErrorPages/404`),
  () => import(`../pages/ErrorPages/403`)
].map((item) => Loadable({
  loader: item,
  loading: Loading
}));


// ==================
// Class
// ==================
const { Content } = Layout;

export default class AppContainer extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    powers: P.array,
    userinfo: P.any,
    menus: P.array
  };

  constructor (props) {
    super(props);
    this.state = {
      collapsed: false, // 侧边栏是否收起
      popLoading: false, // 用户消息是否正在加载
      clearLoading: false // 用户消息是否正在清楚
    };
  }
  componentDidMount () {

    watermark({watermark_txt: `${User.getInfo().name} ${moment().format('L')}`});
  }

  /** 点击切换菜单状态 **/
  onToggle = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };

  // 设置路由
  makeRouterDom (data) {
    return _.map(data, (item) => {
      let component = tools.permission(item.Authority) ? item.component : NoPower;
      return <Route key={item.path} path={item.path} component={component} exact />;
    });
  }
  render () {
    const u = this.props.userinfo;
    return (
      <div className="page-basic">
        <div className="fixed-top">
          <div style={{height: 52}}>
            <Menu
              collapsed={this.state.collapsed}
              location={this.props.location}
            />
            <Collect></Collect>
            <MyTabs routerConfig={routerConfig}></MyTabs>
            <div style={{position: "absolute", top: 10, right: 0, width: 540, }}>
              <Search></Search>
              <Users></Users>
            </div>
          </div>
          <Bread></Bread>
        </div>
        <DndProvider backend={HTML5Backend}>
          <div className="basic-main">
            <Switch>
              <Redirect exact from="/" to="/home" />
              {this.makeRouterDom(routerConfig.routerConfig)}
              <Route exact path="/nopower" component={NoPower} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </DndProvider>
        <Footer />
      </div>
    );
  }
}
