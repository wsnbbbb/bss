/* eslint-disable react/prop-types */

/** 资源管理/机柜U位管理 **/

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
  Table,
  Modal,
  Select,
  Tag
} from 'antd';
import { EyeOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';
import {SYS_DICT_NODEMASTER, SYS_DICT_SERVER} from '@src/config/sysDict'; // 系统字典
import tools from '@src/util/tools'; // 工具
import NodeOptLog from '@src/pages/resources/container/NodeOptLog';
// ==================
// Definition
// ==================
const { Option } = Select;

@withRouter
@inject('portDict')
@observer
class SeeNode extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    portDict: P.any,
    nodeMasterId: P.string, // nodeMasterId 外机设备id。
    powers: P.array, // 当前登录用户权限
    canOpt: P.bool,  // 是否可操作（批量操作）
    lists: P.any,  // 初始端口列表数据
  };
  formRefSearch = React.createRef();
  constructor (props) {
    super(props);
    this.selectedRows = [];
    this.nodeMasterId = undefined;
    this.state = {
      lists: this.props.lists,
      loading: false,
      selectedRowKeys: []
    };
  }
  componentDidMount () {
  }
  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextState.someData !== this.state.someData;
  // }
  componentWillReceiveProps (nextProps) {
    if (this.nodeMasterId == undefined && this.nodeMasterId != nextProps.nodeMasterId) {
      this.getNodeList();
    }
  }
  // 获取节点信息
  getNodeList  = (search) => {
    this.setState({
      loading: true,
    });
    this.nodeMasterId = this.props.nodeMasterId;
    const params = _.assign({}, search, {
      nodeMasterId: this.nodeMasterId
    });
    http.get(`${BSS_ADMIN_URL}/api/product/nodeserver/detail`, {
      params: params
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.selectedRows = [];
          this.setState({
            lists: res.data,
            selectedRowKeys: []
          });
        } else {
          tools.dealFail(res);
        }
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: '节点编号',
        dataIndex: 'node',
        key: 'node',
      },
      {
        title: '管理IP',
        dataIndex: 'serverIp',
        key: 'serverIp',
      },
      {
        title: '设备名称',
        dataIndex: 'serverName',
        key: 'serverName',
      },
      {
        title: '是否占用',
        dataIndex: 'isOccupy',
        key: 'isOccupy',
        render: (text) => tools.renderStatus(SYS_DICT_NODEMASTER.machine_node_state, text)
      },
      {
        title: '销售状态',
        dataIndex: 'status',
        key: 'status',
        render: (text) => tools.renderStatus(SYS_DICT_SERVER.market, text)
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
      },
      {
        title: '出库信息',
        dataIndex: 'id',
        key: 'id',
        render: (text, record) => <NodeOptLog nodeMasterId={record.id}></NodeOptLog>
      }
    ];
    return columns;
  }

  // 批量删除
  onBatchDel () {
    let len = this.selectedRows.length;
    if (len <= 0) {
      Modal.warning({
        title: '请至少选择一条数据',
        content: '',
      });
      return false;
    }
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      content: `确认要删除这条数据吗？`,
      onOk: () => {
        let ids = [];
        _.map(this.selectedRows, (item) => {
          ids.push(item.id);
        });
        this.setState({ loading: true });
        http.delete(`${BSS_ADMIN_URL}/api/product/nodeserver/detail/alldel`, {
          data: ids
        })
          .then((res) => {
            res = res.data;
            if (tools.hasStatusOk(res)) {
              tools.auto_close_result('ok', '操作成功');
              this.getNodeList();
            } else {
              tools.dealFail(res);
              this.setState({ loading: false });
            }
          })
          .catch(() => {
            this.setState({ loading: false });
          });
      },
      onCancel () {
        console.log('Cancel');
      },
    });
  }

  // 选择选中行
  selectedRow (selectedRowKeys, selectedRows) {
    this.selectedRows = selectedRows;
    this.setState({
      selectedRowKeys: selectedRowKeys
    });
  }
  componentWillUnmount () {
    this.selectedRows = [];
    this.nodeMasterId = null;
    // 卸载异步操作设置状态
    this.setState = (state, callback) => false;
  }

  render () {
    const {lists, selectedRowKeys} = this.state;
    return (
      <React.Fragment>
        <div className="g-search">
          <Form ref={this.formRefSearch} name="searchbox" layout="inline" onFinish={this.getNodeList}>
            <Form.Item name="isOccupy" label="是否占用">
              <Select style={{width: 100}} placeholder="请选择" allowClear>
                {
                  _.map(SYS_DICT_NODEMASTER.machine_node_state, (value, key) => <Option value={key}>{value.text}</Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item name="serverIp" label="管理Ip">
              <Input placeholder="管理Ip" allowClear/>
            </Form.Item>
            <Form.Item name="serverName" label="设备名称">
              <Input placeholder="设备名称" allowClear/>
            </Form.Item>
            <Form.Item shouldUpdate>
              <Button type="primary" htmlType="submit" >查询</Button>
            </Form.Item>
          </Form>
        </div>
        {/* 操作 */}
        {tools.permission(['server-del']) && this.props.canOpt && <div className="g-operate">
          <Button className="actions-btn" size="middle" onClick={() => {this.onBatchDel();}}>批量出库</Button>
        </div>}
        {/* 数据展示 */}
        <div className="g-table">
          <Table
            loading={this.state.loading}
            columns={this.makeColumns()}
            rowKey={(record) => record.node}
            dataSource={lists}
            pagination={false}
            size="small"
            selectedRowKeys
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: this.state.selectedRowKeys,
              onChange: (selectedRowKeys, selectedRows) => {this.selectedRow(selectedRowKeys, selectedRows);}
            }}
          />
        </div>
      </React.Fragment>
    );
  }
}
export default SeeNode;


