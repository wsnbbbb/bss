/** 头部 **/
import React from "react";
import P from "prop-types";
import {
  Layout,
  Input,
  Modal,
} from "antd";
import "./index.less";
import logo from "@src/assets/imgs/logo-login.png";
import PATHCONFIG from "@src/config/router";
import { withRouter } from "react-router-dom";
import { inject } from "mobx-react";
import {User} from "../../util/user";
@withRouter
export default class Com extends React.PureComponent {
  static propTypes = {
    location: P.any,
    history: P.any,
  };
  constructor (props) {
    super(props);
    (this.value = ""),
    (this.value2 = ""),
    (this.state = {
      modalShow: false, // 信息展示
      mesEditShow: false, // 修改资料展示
      headChangeShow: false, // 修改头像展示
    });
  }
  // 根据模块代码获取数据
  getValue2 (value) {
    if (!value || value == ' ') {
      return false;
    }
    this.value2 = value;
    let path = PATHCONFIG.getPathInfo('code', value).path;
    if (path) {
      this.props.history.push(path);
    } else {
      Modal.error({
        title: '你输入的代码，系统中不存在'
      });
    }
  }
  render () {
    return (
      <Input.Search
        placeholder="请输入模块代码/订单号/工单号"
        onSearch={(value) => this.getValue2(value)}
        allowClear
        style={{ width: "260px"}}
      />
    );
  }
}
