
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
import Header from '@src/layouts/Header';
import Menu from '@src/layouts/Menu';
import Footer from '@src/layouts/Footer';
import MyTabs from '@src/layouts/MyTabs';
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
    return (
      <div className="page-basic">
        <div className="fixed-top">
          <Header
            collapsed={this.state.collapsed}
            userinfo={this.props.userinfo}
            onToggle={this.onToggle}
            onLogout={this.onLogout}
            getNews={this.getNews}
            clearNews={this.clearNews}
            newsData={this.state.newsData}
            newsTotal={this.state.newsTotal}
            popLoading={this.state.popLoading}
            clearLoading={this.state.clearLoading}
          />
          <Menu
            collapsed={this.state.collapsed}
            location={this.props.location}
          />
        </div>
        <MyTabs routerConfig={routerConfig}></MyTabs>
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
