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
export default class Com extends React.PureComponent {
  static propTypes = {
    location: P.any,
    history: P.any,
  };
  constructor (props) {
    super(props);
  }
  confirm = () => {
    User.setToken(null);
    window.location.href = `${BSS_ADMIN_URL}/api/user/logout?token=${User.getToken()}`;
  };
  render () {
    return (
      <div className="user-box">
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
            >
              <ExportOutlined className="loginOut" />
            </Button>
          </Popconfirm>
        </div>
      </div>

    );
  }
}
