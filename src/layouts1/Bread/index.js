/** 通用动态面包屑 **/
import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import PATHCONFIG from "@src/config/router";
import './index.less';
import { inject } from 'mobx-react';
@withRouter
export default class Com extends React.PureComponent {
  static propTypes = {
    location: P.any,
    title: P.array,
  };
  constructor (props) {
    super(props);
    this.state = {
      currentPath: this.props.location && this.props.location.pathname,
      breadList: this.makeBread(this.props.location && this.props.location.pathname),
    };
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
    this.setState({
      currentPath: nextprops.location.pathname,
      breadList: this.makeBread(nextprops.location.pathname),
    });
  }


  /** 根据当前location动态生成对应的面包屑 **/
  makeBread (location) {
    const breads = [];
    function slicePath (str_path) {
      if (str_path.length > 0) {
        const temp = PATHCONFIG.getPathInfo('path', str_path);
        if (temp) {
          breads.unshift(temp.name);
        }
        let end = str_path.lastIndexOf('/');
        let current_str = str_path.slice(0, end);
        slicePath(current_str);
      }
      return false;
    };
    slicePath(location);
    return breads;
  }

  render () {
    return (
      <div className="bread">
        <Breadcrumb>
          {_.map(this.state.breadList, (bread, index) => <Breadcrumb.Item key={index}>{bread}</Breadcrumb.Item>)}
        </Breadcrumb>
      </div>
    );
  }
}
