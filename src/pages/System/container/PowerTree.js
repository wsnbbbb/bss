/* eslint-disable react/prop-types */
/* Tree选择 - 权限选择 - 多选 */
import React from "react";
import {
  Modal,
  Tooltip,
  Transfer,
  Row,
  Col,
  message
} from "antd";
import P from "prop-types";
import _ from "lodash";
import "./RoleTree.less";
import { inject, observer } from "mobx-react";
import tools from "@src/util/tools"; // 工具
@inject("authManage")
@observer
export default class RoleTreeComponent extends React.PureComponent {
  static propTypes = {
    data: P.array, // 原始数据
    title: P.string, // 标题
    visible: P.bool, // 是否显示
    defaultKeys: P.array, // 当前默认选中的key们
    loading: P.bool, // 确定按钮是否在等待中状态
    onOk: P.func, // 确定
    onClose: P.func, // 关闭
    record: P.object,
  };

  constructor (props) {
    super(props);
    this.selectedKeys = [];
    this.state = {
      nowKeys: [], // 当前选中的keys
      loading: false,
      mockData: [],
      targetKeys: [],
      userVersion: 0,
    };
  }
  componentDidMount () {
  }

  /** 点击确定时触发 **/
  onOk = () => {
    this.handleOk(this.state.targetKeys);
  };
  handleOk = (val) => {
    this.setState({ loading: true });
    let { id, rolename, deptId} = this.props.record;
    if (val === null) {
      return;
    }
    this.props.authManage
      .upRole(id, {
        rolename: rolename,
        deptId: deptId,
        userIds: val,
        version: this.state.userVersion
      })
      .then((res) => {
        this.setState({ loading: false });
        if (res.code === 20000) {
          this.setState({
            showModal: false,
          });
          message.success("分配角色成功");
        } else {
          this.setState({
            showModal: false,
          });
          message.error(res.data);
        }
      })
      .catch(() => {
        this.setState({
          showModal: false,
        });
      });
  };
  // 获取用户列表
  onGetUerLists (param = {}) {
    const params = _.assign({}, param);
    this.props.authManage
      .getUserList(tools.clearNull(params))
      .then((res) => {
        if (res.code === 20000) {
          this.setState({
            mockData: res.data.records,
          });
        } else {
          message.error(res.message);
        }
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.setState({
      targetKeys: [],
      mockData: [],
    });
    this.setState({ showModal: false });
  };
  filterOption = (inputValue, option) => option.name.indexOf(inputValue) > -1
  handleChange2 = (targetKeys, direction, moveKeys) => {
    this.setState({ targetKeys });
  };
  handleSearch = (dir, value) => {
  };
  modalShow () {
    this.onGetUerLists({ page: 1, deptId: 1, pageSize: 400 });
    this.props.authManage
      .getRoles2(this.props.record.id)
      .then((res) => {
        if (res.code === 20000) {
          let userListsDefault = [];
          res.data.users.forEach((item) => {
            userListsDefault.push(item.id);
          });
          this.setState({
            targetKeys: userListsDefault,
            userVersion: res.data.version,
          });
        } else {
          message.error(res.data);
        }
      })
      .catch(() => {
      });
    this.setState({
      showModal: true
    });
  }
  render () {
    const {
      record,
    } = this.props;
    return (
      <main style={{display: "inline-block"}}>
        <Modal
          title="关联员工"
          visible={this.state.showModal}
          destroyOnClose
          width="60%"
          onOk={this.onOk}
          onCancel={this.onClose}
          okText="确认"
          cancelText="取消"
        >
          <Tooltip title="角色名称">
            <span style={{ marginLeft: "100px", fontSize: "20px" }}>
              {(record && record.rolename) || ""}
            </span>
          </Tooltip>
          <br />
          <br />
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Transfer
                dataSource={this.state.mockData}
                showSearch
                listStyle={{
                  width: 280,
                  height: 360,
                }}
                locale={{itemUnit: '项', itemsUnit: '项', searchPlaceholder: '请输入搜索内容'}}
                rowKey={(record) => record.id}
                filterOption={this.filterOption}
                targetKeys={this.state.targetKeys}
                onChange={this.handleChange2}
                onSearch={this.handleSearch}
                render={(item) => item.name}
                titles={['请选择用户', '拥有此角色的用户']}
                pagination
              />
            </Col>
          </Row>
        </Modal>
        <span onClick={() => {this.modalShow();}}>
          {this.props.children}
        </span>
      </main>
    );
  }
}
