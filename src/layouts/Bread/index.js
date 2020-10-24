/** 通用动态面包屑 **/
import React from 'react';
import P from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import './index.less';
import { inject } from 'mobx-react';
@withRouter
export default class Com extends React.PureComponent {
  static propTypes = {
    location: P.any,
    title: P.array,
  };

  /** 根据当前location动态生成对应的面包屑 **/
  // makeBread (location, menus) {
  //   const paths = location.pathname.split('/').filter((item) => !!item);
  //   const breads = [];
  //   paths.forEach((item, index) => {
  //     const temp = menus.find((v) => v.url.replace(/^\//, '') === item);
  //     if (temp) {
  //       breads.push(
  //         <Breadcrumb.Item key={index}>{temp.title}</Breadcrumb.Item>
  //       );
  //     }
  //   });
  //   return breads;
  // }
  makeBread () {
    let breads = [];
    this.props.title.forEach((item, index) => {
      breads.push(
        <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>
      );
    });
    return breads;
  }

  constructor (props) {
    super(props);
    this.state = {};
  }

  render () {
    return (
      <div className="bread">
        <Breadcrumb>
          {this.makeBread()}
        </Breadcrumb>
      </div>
    );
  }
}
