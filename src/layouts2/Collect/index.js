/** 头部 **/
import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import classNames from 'classNames';
import { CloseOutlined, DesktopOutlined } from '@ant-design/icons';
import { Link, withRouter } from "react-router-dom";
import PATHCONFIG from "@src/config/router";
import './index.less';
import logo from '@src/assets/imgs/ik_logo.png';
@withRouter
export default class Collect extends React.PureComponent {
  static propTypes = {
    location: P.any,
    history: P.any,
    menus: P.array
  };
  constructor (props) {
    super(props);
    this.tabsLegth = 0; // 不算控制台（首页）
    this.state = {
      tabsList: [
      // 用户管理模块
        {name: '用户列表', code: '000102',  path: '/user/list'},
        {name: '机房管理', code: '010102', path: '/resources/manage/house'},
        {name: '机柜管理', code: '010103', path: '/resources/manage/cabinet'},
        {name: '网络设备管理', code: '010201',  path: '/resources/networkdevices/manage'},
        {name: '服务器管理', path: '/resources/server/manage'}, // 用户动态生成面包屑使用
        {name: '服务器外机管理', code: '010301',  path: '/resources/server/outsidemachine'}]
    };
  };
  componentDidMount () {
  }
  componentWillReceiveProps (nextprops) {
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
    const { tabsList} = this.state;
    return (
      <div className="collects-wap">
        <div className="tabs">
          <Link to={{
            pathname: '/home',
          }}>
            <span className="tab-name"><img src={logo} /></span>
          </Link>
        </div>
        {
          _.map(tabsList, (item, index) => <div key={item.path} className="tabs">
            <Link
              to={{
                pathname: item.path,
              }}>
              <span className="tab-name">{item.name}</span>
            </Link>
          </div>)
        }
      </div>
    );
  }
}
