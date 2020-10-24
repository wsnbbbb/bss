/* eslint-disable react/prop-types */

/** 服务器节点选择，为其他组件提供，主要用于服务器入库 **/

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
  InputNumber,
  Table,
  message,
  Popconfirm,
  Spin,
  Modal,
  Tooltip,
  Divider,
  Select,
  TreeSelect
} from 'antd';
import { EyeOutlined, FormOutlined, DeleteOutlined} from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';
import {observable} from "mobx";
import {formItemLayout, houseAttribute, UBitStatus} from '@src/config/commvar'; // 全局通用变量
import {SYS_DICT_NODEMASTER, SYS_DICT_SERVER} from '@src/config/sysDict'; // 全局通用变量
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import NodeOptLog from '@src/pages/resources/container/NodeOptLog';
import AviewInput from '@src/pages/resources/container/AviewInput';
import Cabinet from '@src/pages/resources/container/Cabinet';
import OutMachine from '@src/pages/resources/container/OutMachine';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const { TreeNode } = TreeSelect;

@withRouter
@inject('root')
@inject('cabinetDict')
@observer
class Node extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    root: P.any,
    children: P.any,
    title: P.string, // 弹窗title
    us: P.number, // 占用节点数
    powers: P.array, // 当前登录用户权限
    defaultData: P.any,  // 当前选中的信息
    onOk: P.func, // 弹框确认
    onClose: P.func, // 只关闭弹窗
  };
  formRefAdd = React.createRef();
  constructor (props) {
    super(props);
    this.selectedRows = []; // 选中行数据
    this.cabinetInfo = {}; // 机柜信息用于传给父组件使用
    this.masterInfo = {}; // 外机信息用于传给父组件使用
    this.regionInfo = {}; // 区域信息用于传给父组件使用
    this.state = {
      us: this.props.us, // 用来判断节点数是否发生改变
      lists: [], // 处理后的U位数据
      loading: false,
      showModal: false,
      regionId: undefined, // 区域id用于作为获取机柜的参数
      cabinetId: undefined, // 机柜id
      masterId: undefined // 外机id
    };
  }
  componentDidMount () {
    // this.getDetail(this.props.cabinetId);
  }
  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextState.someData !== this.state.someData;
  // }
  componentWillReceiveProps (nextProps) {
    // console.log(nextProps, this.props);
    // if (nextProps.cabinetId !== this.props.cabinetId) {
    //   this.getDetail(nextProps.cabinetId);
    // }
  }

  /**
   * 获取外机节点详情信息
   * @param {*} id 外机id
   */
  getDetail (id, fileds = {}) {
    this.setState({
      loading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/product/nodeserver/detail?nodeMasterId=${this.masterInfo.id}`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            lists: res.data,
            loading: false,
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


  /**
   * 起始位置也要计入
   * 选中U位
   * 当前选的u位 为最小起始位置
   */
  selectedRow (selectedRowKeys, selectedRows) {
    this.selectedRows = selectedRows;
    this.props.onSelect({
      regionId: this.regionId,
      regionInfo: this.regionInfo,
      cabinetInfo: this.cabinetInfo,
      masterInfo: this.masterInfo,
      nodeInfo: selectedRows[0],
    });
    this.setState({
      showModal: false
    });
  }

  // 获取区域信息
  /**
   *
   * @param {string} value :localtionId
   * @param {*} record :地区视图对应的一条数据
   */
  getRegion (value, record) {
    this.regionInfo = record;
    this.selectedRows = []; // 选中行数据
    this.cabinetInfo = {}; // 机柜信息用于传给父组件使用
    this.masterInfo = {}; // 外机信息用于传给父组件使用
    this.setState({
      regionId: record.regionId,
      lists: [], // 处理后的U位数据
      cabinetId: undefined, // 机柜id
      masterId: undefined // 外机id
    });
  }

  // 获取机柜信息
  getCabinet (value, record) {
    this.cabinetInfo = record[0];
    this.selectedRows = []; // 选中行数据
    this.masterInfo = {}; // 外机信息用于传给父组件使用
    this.setState({
      lists: [], // 处理后的U位数据
      cabinetId: value,
      masterId: undefined // 外机id
    });
  }
  // 获取外机信息
  getOutMachine (value, record) {
    this.masterInfo = record[0];
    this.setState({
      masterId: value,
      lists: [], // 处理后的U位数据
    });
    this.getDetail(value);
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.formRefAdd.current.resetFields();
  };
  modalShow () {
    if (!this.props.us) {
      Modal.error({
        title: '请输入节点数'
      });
      return false;
    }
    if (this.props.us != this.state.us) {
      this.selectedRows = []; // 选中行数据
      this.cabinetInfo = {}; // 机柜信息用于传给父组件使用
      this.masterInfo = {}; // 外机信息用于传给父组件使用
      this.regionInfo = {}; // 区域信息用于传给父组件使用
      this.setState({
        nowData: {}, // 获取的机柜数据
        lists: [], // 处理后的U位数据
        loading: false,
        showModal: true,
        regionId: undefined, // 区域id用于作为获取机柜的参数
        cabinetId: undefined, // 机柜id
        masterId: undefined // 外机id
      });
    } else {
      this.setState({
        showModal: true,
      });

    }

  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.setState({showModal: false});
  };

  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: '节点编号',
        dataIndex: 'node',
        // width: 150,
        key: 'node',
      },
      {
        title: '管理IP',
        dataIndex: 'serverIp',
        // width: 150,
        key: 'serverIp',
      },
      {
        title: '设备名称',
        dataIndex: 'serverName',
        // width: 150,
        key: 'serverName',
      },
      {
        title: '是否占用',
        dataIndex: 'isOccupy',
        // width: 150,
        key: 'isOccupy',
        render: (text) => tools.renderStatus(SYS_DICT_NODEMASTER.machine_node_state, text)
      },
      {
        title: '销售状态',
        dataIndex: 'status',
        // width: 150,
        key: 'status',
        render: (text) => tools.renderStatus(SYS_DICT_SERVER.market, text)
      },
      {
        title: '备注',
        dataIndex: 'remark',
        // width: 150,
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


  render () {
    const {lists, showModal, loading} = this.state;
    return (
      <React.Fragment>
        <Modal
          title={this.props.title || '选择节点'}
          maskClosable={false}
          width="95%"
          destroyOnClose
          footer={null}
          onCancel={this.onClose}
          visible={showModal}
        >
          {/* 搜索 */}
          <div className="g-search">
            <AviewInput defaultKey={this.regionInfo.fullLocationId} onSearch={(value, record) => {this.getRegion(value, record);}}></AviewInput>
            <div style={{display: "inline-block", width: 200, marginLeft: 10}}>
              <Cabinet
                title="选择机柜"
                allowClear
                disabledTip="请先选择地区！"
                disabled={!this.state.regionId}
                fetchPath={`${BSS_ADMIN_URL}/api/product/cabinet/choose?regionId=${this.state.regionId}&us=${this.props.us}&type=offServer`}
                onSelect={(value, record) => {this.getCabinet(value, record);}}>
                <Input placeholder="选择机柜" value={this.cabinetInfo.name}></Input>
              </Cabinet>
            </div>
            <div style={{display: "inline-block", width: 200, marginLeft: 10}}>
              <OutMachine
                title="选择外机"
                disabledTip="请先选择机柜！"
                disabled={!this.cabinetInfo.id}
                fetchPath={`${BSS_ADMIN_URL}/api/product/nodeserver/master/choose?locationId=${this.regionInfo.fullLocationId}&cabinetId=${this.cabinetInfo.id}`}
                onSelect={(value, record) => {this.getOutMachine(value, record);}}>
                <Input placeholder="选择外机" value={this.masterInfo.nodeServerName} style={{width: 300}}></Input>
              </OutMachine>
            </div>
          </div>
          {/* 数据展示 */}
          <div className="g-table">
            <Table
              columns={this.makeColumns()}
              rowKey={(record) => record.id}
              loading={loading}
              dataSource={lists}
              pagination={false}
              size="small"
              rowSelection={{
                type: 'radio',
                onChange: (selectedRowKeys, selectedRows) => {this.selectedRow(selectedRowKeys, selectedRows);},
                getCheckboxProps: (record) => ({
                  disabled: record.isOccupy == 1, // 占用不可选
                  isOccupy: record.isOccupy,
                }),
              }}
            />
          </div>
        </Modal>
        <span onClick={() => {this.modalShow();}}>
          {this.props.children}
        </span>
      </React.Fragment>
    );
  }
}
export default Node;


