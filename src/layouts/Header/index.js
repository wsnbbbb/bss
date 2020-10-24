/** 头部 **/
import React from "react";
import P from "prop-types";
import {
  Layout,
  Row,
  Col,
  Input,
  Select,
  Avatar,
  Badge,
  Modal,
  Menu,
  Dropdown,
  Button,
  Popconfirm,
  message,
} from "antd";
import {
  UserOutlined,
  SettingTwoTone,
  DownCircleOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import "./index.less";
import logo from "@src/assets/imgs/logo-login.png";
import PATHCONFIG from "@src/config/router";
import { withRouter } from "react-router-dom";
import { inject } from "mobx-react";
import {User} from "../../util/user";
const { Header } = Layout;
const { Search } = Input;
@withRouter
@inject('authManage')
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
  getValue (value) {
    console.log(value);
    this.value = value;
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
  showMod = () => {
    this.setState({
      modalShow: true,
    });
  };
  handleOk = () => {
    this.setState({
      modalShow: false,
      mesEditShow: false,
      headChangeShow: false,
    });
  };

  handleCancel = () => {
    this.setState({
      modalShow: false,
      mesEditShow: false,
      headChangeShow: false,
    });
  };
  onChange = (value) => {
    console.log(value);
  };
  mesEdit = () => {
    this.setState({
      mesEditShow: true,
    });
  };
  headChange = () => {
    this.setState({
      headChangeShow: true,
    });
  };
  confirm = () => {
    User.setToken(null);
    window.location.href = `${BSS_ADMIN_URL}/api/user/logout?token=${User.getToken()}`;
  };
  cancel = () => {};
  handleLoginOut = () => {};
  render () {
    return (
      <Header className="header">
        <div className="logo">
          <img className="logo-img" src={logo} alt="" /><span className="line">|</span>BSS业务支撑系统
        </div>

        <div className="search-box">
          <div className="head-input-group">
            <Input.Group compact>
              <Select
                defaultValue="订单号"
                className="select-before"
                size="large"
                style={{width: 120}}
                onChange={this.onChange}
              >
                <Select.Option value="订单号">订单号</Select.Option>
                <Select.Option value="退单号">退单号</Select.Option>
              </Select>
              <Input.Search
                style={{ width: "calc(100% - 120px)" }}
                onSearch={(value) => this.getValue(value)}
                size="large"
                allowClear
              />
            </Input.Group>
          </div>
          <div className="input-group-moudle">
            <Input.Search
              placeholder="请输入模块代码"
              onSearch={(value) => this.getValue2(value)}
              size="large"
              allowClear
              style={{ width: "80%", marginTop: "15px" }}
            />
          </div>
        </div>
        <div className="user-box">
          <div className="login-box">
            <a href={BSS_SSO_URL}>认证中心</a>
            <Popconfirm
              title="你确定要退出登录吗?"
              onConfirm={this.confirm}
              onCancel={this.cancel}
              okText="确定"
              cancelText="取消"
              placement="left"
            >
              <Button
                className="out"
                type="link"
                // onClick={this.handleLoginOut}
              >
                <ExportOutlined className="loginOut" />
              </Button>
            </Popconfirm>
          </div>
          <div className="user">
            <span className="avatar-item">
              <Badge count={66}>
                <Avatar
                  style={{ backgroundColor: "#87d068" }}
                  icon={<UserOutlined />}
                  onClick={this.showMod}
                />
                <Button
                  style={{ margin: "-5px" }}
                  onClick={this.showMod}
                  type="link"
                >
                  {User.getUserName() || ''}
                </Button>
              </Badge>
            </span>
          </div>
        </div>

        <Modal
          title="信息"
          visible={this.state.modalShow}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          destroyOnClose
          width="50%"
          cancelText="取消"
          okText="确定"
        >
          <p>信息组件</p>
        </Modal>
        <Modal
          title="修改资料"
          visible={this.state.mesEditShow}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          destroyOnClose
          width="50%"
          cancelText="取消"
          okText="确定"
        >
          <p>修改资料组件</p>
        </Modal>
        <Modal
          title="修改头像"
          visible={this.state.headChangeShow}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          destroyOnClose
          width="50%"
          cancelText="取消"
          okText="确定"
        >
          <p>修改头像组件</p>
        </Modal>
      </Header>
    );
  }
}
