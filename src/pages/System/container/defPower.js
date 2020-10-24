/* eslint-disable react/prop-types */
/* Tree选择 - 权限选择 - 多选 */
import React from 'react';
import {  Modal, Tooltip, Row, Col,  Transfer, message } from 'antd';
import P from 'prop-types';
import _ from 'lodash';
import './RoleTree.less';
import { inject, observer} from 'mobx-react';
@inject('authManage')
@observer
export default class defRoleTreeComponent extends React.PureComponent {
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
    // this.seData = [];
    this.state = {
      nowKeys: [], // 当前选中的keys
      loading: false,
      mockData: [],
      targetKeys: [],
      powerVersion: 0,
    };
  }
  componentDidMount () {
  }

  /** 点击确定时触发 **/
  onOk = () => {
    this.handleOk(this.state.targetKeys);
  };
  handleOk = (val) => {
    this.setState({
      loading: true,
    });
    let { id, rolename, deptId } = this.props.record;
    // eslint-disable-next-line react/prop-types
    this.props.authManage
      // eslint-disable-next-line react/prop-types
      .upRole(id, {
        rolename: rolename,
        deptId: deptId,
        permissionIds: val,
        version: this.state.powerVersion,
      })
      .then((res) => {
        this.setState({
          loading: true,
        });
        if (res.code === 20000) {
          this.setState({ showModal: false });
          message.success("分配权限成功");
        } else {
          message.error(res.data);
          this.setState({ showModal: false });
        }
      })
      .catch(() => {
        this.setState({ showModal: false });
      });
  };

  /** 点击关闭时触发 **/
  onClose = () => {
    this.setState({
      targetKeys: [],
      mockData: [],
    });
    this.setState({ showModal: false });
  };
  filterOption = (inputValue, option) => option.permissionsName.indexOf(inputValue) > -1
  handleChange2 = (targetKeys) => {
    this.setState({ targetKeys });
  };
  handleSearch = (dir, value) => {
  };
  onGetPowerTreeData () {
    // eslint-disable-next-line react/prop-types
    this.props.authManage
      // eslint-disable-next-line react/prop-types
      .getAllPower()
      .then((res) => {
        if (res.code === 20000) {
          this.setState({
            mockData: res.data,
            loading: false,
          });
        } else {
          message.error(res.message);
        }
      })
      .catch((res) => {
        this.setState({
          loading: false,
        });
      });
  }
  modalShow () {
    this.onGetPowerTreeData();
    // eslint-disable-next-line react/prop-types
    this.props.authManage
      // eslint-disable-next-line react/prop-types
      .getRoles2(this.props.record.id)
      .then((res) => {
        if (res.code === 20000) {
          let powerTreeDefault = [];
          res.data.permissions.forEach((item) => {
            powerTreeDefault.push(item.id);
          });
          this.setState({
            targetKeys: powerTreeDefault,
            powerVersion: res.data.version,
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
    // eslint-disable-next-line react/prop-types
    const {record} = this.props;
    const {mockData, targetKeys} = this.state;
    return (
      <main style={{display: "inline-block"}}>
        <Modal
          title="分配权限"
          visible={this.state.showModal}
          destroyOnClose
          onOk={this.onOk}
          onCancel={this.onClose}
          okText="确认"
          cancelText="取消"
          width="60%"
        >
          <Tooltip title="角色名称" >
            <span style={{ marginLeft: "100px", fontSize: "20px" }}>{record && record.rolename || ''}</span>
          </Tooltip>
          <br/>
          <br/>
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Transfer
                dataSource={mockData}
                showSearch
                listStyle={{
                  width: 300,
                  height: 360,
                }}
                locale={{itemUnit: '项', itemsUnit: '项', searchPlaceholder: '请输入搜索内容'}}
                rowKey={(record) => record.id}
                filterOption={this.filterOption}
                targetKeys={targetKeys}
                onChange={this.handleChange2}
                onSearch={this.handleSearch}
                render={(item) => item.permissionsName}
                titles={['请选择权限', '拥有的权限']}
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
