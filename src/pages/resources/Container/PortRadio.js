/**
 * 用于选择机柜,为其他组件提供
 */
// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import http from '@src/util/http';
import {
  Form,
  Button,
  Input,
  Tag,
  Table,
  Modal,
  Select,
  TreeSelect
} from 'antd';
import { CloseOutlined} from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';
import {observable} from "mobx";
import {SYS_DICT_PORT} from '@src/config/sysDict'; // 系统字典
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式

@withRouter
@inject('root')
class PortRadio extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    root: P.any,
    children: P.any,
    disabled: P.bool, // 父组件 来控制子组件是否可用 比如：前置条件机房已经有了 就让使用子组件
    allowClear: P.bool, // 父组件 来控制子组件是否可用 比如：前置条件机房已经有了 就让使用子组件
    disabledTip: P.string, // 不能使用子组件原因
    title: P.string,
    style: P.any, // 样式
    fetchPath: P.string, // 获取数据的查询条件
    powers: P.array, // 当前登录用户权限
    onSelect: P.func, // 确认选择
  };
  formRefAdd = React.createRef();
  constructor (props) {
    super(props);
    this.selectedRows = []; // 选中行数据
    this.state = {
      lists: [], // 通过机柜名称查询后的数据
      page: 1,
      pageSize: 10,
      loading: false,
      showModal: false,
      portName: '',
    };
  }
  componentDidMount () {
    // this.getDetail();
  }
  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextProps.houseId !== this.props.houseId;
  // }
  componentWillReceiveProps (nextProps) {
    // if (nextProps.houseId && nextProps.houseId !== this.props.houseId) {
    //   this.getDetail();
    // }

  }

  // 获取端口信息
  getDetail (fileds = {}) {
    let hardParam = {};
    // if (this.props.hardParam) {
    //   hardParam = this.props.hardParam;
    // }
    this.setState({
      loading: true,
    });
    http.get(`${this.props.fetchPath}`, {
      params: fileds
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            loading: false,
            lists: res.data
          });
        } else {
          tools.dealFail(res);
          this.setState({
            loading: false,
          });
        }
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
      });
  }

  // 选择选中行
  selectedRow (selectedRowKeys, selectedRows) {
    this.selectedRows = selectedRows;
    this.props.onSelect(selectedRowKeys, selectedRows[0]);
    this.setState({
      showModal: false,
    });
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.formRefAdd.current.resetFields();
  };

  modalShow () {
    if (this.props.disabled) {
      Modal.warning({
        title: this.props.disabledTip
      });
      return;
    }
    this.getDetail();
    this.setState({
      showModal: true
    });
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.setState({showModal: false});
  };

  // 清空
  clear = () => {
    this.selectedRows = [];
    this.props.onSelect(undefined, {});
    this.setState({
      portName: "",
    });
  }

  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: '端口',
        dataIndex: 'port',
        // width: 150,
        key: 'port',
      },
      {
        title: '端口类型',
        dataIndex: 'sult',
        // width: 150,
        key: 'sult',
        render: (text, record) => SYS_DICT_PORT.port_type[text]
      },
      {
        title: '端口状态',
        dataIndex: 'status',
        // width: 150,
        key: 'status',
        render: (text) => tools.renderStatus(SYS_DICT_PORT.port_use, text)
      },
      {
        title: '端口速率（Mbps）',
        dataIndex: 'speed',
        // width: 150,
        key: 'speed',
      },
      {
        title: '浏览图url',
        dataIndex: 'url',
        // width: 150,
        key: 'url',
      },
      {
        title: '连接信息（管理IP）',
        dataIndex: 'manageIp',
        width: 150,
        key: 'manageIp',
      },
      {
        title: '连接信息（网卡名）',
        dataIndex: 'deviceNetworkName',
        width: 150,
        key: 'deviceNetworkName',
      },
      {
        title: '连接信息（服务器名称）',
        dataIndex: 'deviceName',
        width: 150,
        key: 'deviceName',
      },
      {
        title: '备注',
        dataIndex: 'remark',
        // width: 150,
        key: 'remark',
      }
    ];
    return columns;
  }

  render () {
    const {lists, showModal, loading, portName} = this.state;
    return (
      <React.Fragment>
        <Modal
          title={this.props.title || '选择内存卡'}
          maskClosable={false}
          width="90%"
          destroyOnClose
          footer={false}
          onCancel={this.onClose}
          visible={showModal}
        >
          {/* 搜索 */}
          <div className="g-search">
            <Form ref={this.searchFormRef} name="searchbox" layout="inline" onFinish={(values) => {this.getDetail(values);}}>
              <Form.Item name="portName">
                <Input placeholder="端口号" allowClear/>
              </Form.Item>
              <Form.Item shouldUpdate>
                <Button type="primary" htmlType="submit" >搜索</Button>
              </Form.Item>
            </Form>
          </div>
          {/* 数据展示 */}
          <div className="g-table">
            <Table
              columns={this.makeColumns()}
              rowKey={(record) => record.id}
              loading={loading}
              dataSource={lists}
              pagination={false}
              rowSelection={{
                type: 'radio',
                onChange: (selectedRowKeys, selectedRows) => {this.selectedRow(selectedRowKeys, selectedRows);},
                getCheckboxProps: (record) => ({
                  disabled: record.status != 1, // Column configuration not to be checked
                  status: record.status,
                }),
              }}
            />
          </div>
        </Modal>
        <span className="inner-input" onClick={() => {this.modalShow();}} style={this.props.style || {}}>
          {this.props.children}
        </span>
        {this.props.allowClear && <span className="clearBtn" onClick={() => {this.clear();}}><CloseOutlined /></span>}
      </React.Fragment>
    );
  }
}
export default PortRadio;


