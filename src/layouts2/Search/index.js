/** 综合搜索 **/
import React from "react";
import P from "prop-types";
import {
  Input,
  Modal,
} from "antd";
import "./index.less";
import PATHCONFIG from "@src/config/router";
import { withRouter } from "react-router-dom";
@withRouter
export default class Com extends React.PureComponent {
  static propTypes = {
    location: P.any,
    history: P.any,
  };
  constructor (props) {
    super(props);
    this.state = {
      value: '',
      modalShow: false, // 信息展示
      mesEditShow: false, // 修改资料展示
      headChangeShow: false, // 修改头像展示
    };
  }
  // 根据模块代码获取数据
  getValue2 (value) {
    if (!value || value == ' ') {
      return false;
    }
    this.value2 = value;
    let path = PATHCONFIG.getPathInfo('code', value).path;
    if (path) {
      this.setState({value: ''});
      this.props.history.push(path);
    } else {
      Modal.error({
        title: '你输入的代码，系统中不存在'
      });
    }
  }

  // 设置输入参数
  setValue (val) {
    this.setState({
      value: val
    });
  }
  render () {
    return (
      <Input.Search
        value={this.state.value}
        placeholder="请输入模块代码/订单号/工单号"
        onSearch={(value) => this.getValue2(value)}
        onChange={(e) => this.setValue(e.target.value)}
        allowClear
        style={{ width: "260px"}}
      />
    );
  }
}
