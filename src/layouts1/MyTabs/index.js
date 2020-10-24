/** 头部 **/
import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import classNames from 'classNames';
import { CloseOutlined, DesktopOutlined } from '@ant-design/icons';
import { Link, withRouter } from "react-router-dom";
import PATHCONFIG from "@src/config/router";
import './index.less';
@withRouter
export default class MyTabs extends React.PureComponent {
  static propTypes = {
    location: P.any,
    history: P.any,
    menus: P.array
  };
  constructor (props) {
    super(props);
    this.MAXLENGTH = 5; // 最多显示MAXLENGTH个选项卡
    this.tabsLegth = 0; // 不算控制台（首页）
    let tabsList = [];
    // 如果初始值是首页 不做处理
    if (this.props.location.pathname != '/' && this.props.location.pathname != '/home') {
      tabsList = [{
        pathname: this.props.location.pathname,
        name: this.props.location.state && this.props.location.state.name || PATHCONFIG.getPathInfo('path', this.props.location.pathname).name || '404',
        search: this.props.location.search || undefined
      }];
      this.tabsLegth = 1;
    }
    this.state = {
      currentPath: this.props.location.pathname,
      tabsList: tabsList
    };
  };
  componentDidMount () {
  }
  componentWillReceiveProps (nextprops) {
    // 当前页面刷新，不做操作
    if (this.state.currentPath == nextprops.location.pathname) {
      return false;
    }
    if (nextprops.location.pathname == '/' || nextprops.location.pathname == '/home') {
      this.setState({
        currentPath: '/'
      });
      return;
    }
    let  tabsList = [...this.state.tabsList];
    // 当前数据index  从0开始
    let index = _.findIndex(tabsList, (item) => item.pathname == nextprops.location.pathname);
    // 不存在 且达到MAXLENGTH的最大长度限制
    if (index == -1 && this.tabsLegth == this.MAXLENGTH) {
      tabsList.splice(0, 1);
      tabsList.push({
        pathname: nextprops.location.pathname,
        name: PATHCONFIG.getPathInfo('path', nextprops.location.pathname).name,
        search: nextprops.location.search,
      });
    }
    // 不存在且不满10个
    if (index == -1 && this.tabsLegth < this.MAXLENGTH) {
      this.tabsLegth = this.tabsLegth + 1;
      tabsList.push({
        pathname: nextprops.location.pathname,
        name: PATHCONFIG.getPathInfo('path', nextprops.location.pathname).name,
        search: nextprops.location.search,
      });
    }
    // 已经存在
    if (index >= 0) {
      tabsList.splice(index, 1, {
        pathname: nextprops.location.pathname,
        name: PATHCONFIG.getPathInfo('path', nextprops.location.pathname).name,
        search: nextprops.location.search,
      });
    }
    this.setState({
      tabsList: tabsList,
      currentPath: nextprops.location.pathname
    });
  }
  // 删除
  del = (e, index, item) => {
    e.stopPropagation();
    let tabsList = [...this.state.tabsList];
    tabsList.splice(index, 1);
    let len = this.tabsLegth - 1;
    this.tabsLegth = len;
    let path = '/';
    // 如果删除当前正在看的页面，则打开最后一个页面
    if (item.pathname == this.state.currentPath) {
      if (len > 0) {
        path = tabsList[len - 1].pathname;
      }
      this.setState({
        currentPath: path,
        tabsList: tabsList,
      }, function () {
        this.props.history.push(path);
      });

    } else {
      this.setState({
        tabsList: tabsList,
      });
    }
  }

  change (item) {
    if (item.pathname == this.state.currentPath) {
      return false;
    }
    this.setState({
      currentPath: item.pathname
    });
    this.props.history.push(item.pathname);
  }

  render () {
    const { tabsList, currentPath} = this.state;
    return (
      <div className="page-tabs-wap">
        {/* <div className={classNames({"tabs": true, active: '/' == currentPath || '/home' == currentPath})}>
          <Link to={{
            pathname: '/home',
          }}>
            <span className="tab-name" style={{textAlign: 'center'}}><DesktopOutlined />工作台<br/>000000</span>
          </Link>
        </div> */}
        {
          _.map(tabsList, (item, index) => <div key={item.pathname} className={classNames({"tabs": true, active: item.pathname == currentPath})}>
            <Link
              to={{
                pathname: item.pathname,
                search: item.search,
                state: {
                  name: item.name
                }
              }}>
              <span className="tab-name" onClick={() => {this.change(index, item);}}>{item.name}<br/><span>{PATHCONFIG.getPathInfo('path', item.pathname).code}</span></span>
            </Link>
            <CloseOutlined className="icon" onClick={(e) => {this.del(e, index, item);}} />
          </div>)
        }
      </div>
    );
  }
}
