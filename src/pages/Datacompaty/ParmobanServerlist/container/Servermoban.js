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
import { EyeOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router';
import { observable } from "mobx";
import { formItemLayout, houseAttribute, UBitStatus } from '@src/config/commvar'; // 全局通用变量
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
// eslint-disable-next-line no-duplicate-imports
import { serverTypes } from '@src/config/commvar'; // 全局变量
import {SYS_DICT_SERVERPART, SYS_DICT_SERVER, SYS_DICT_COMMON} from '@src/config/sysDict'; // 系统字典
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const { TreeNode } = TreeSelect;
const { confirm } = Modal;
@withRouter
@inject('root')
@inject('cabinetDict')
@inject('serverDict')
@inject('deviceDict')
@observer
class Server extends React.Component {
    static propTypes = {
      location: P.any,
      history: P.any,
      match: P.any,
      root: P.any,
      cabinetDict: P.any,
      powers: P.array, // 当前登录用户权限
      defaultData: P.any,  // 当前选中的信息
      onOk: P.func, // 弹框确认
      onClose: P.func, // 只关闭弹窗
      children: P.any,
      deviceDict: P.any,
      record: P.any, // 服务器数据
      serverDict: P.any,
      type: P.any, // 操作类型
    };
    // formRefAdd = React.createRef();

    constructor (props) {
      super(props);
      this.selectedRowKeys = [];// 选中的key
      this.searchFormRef = React.createRef();
      this.searchCondition = {};
      this.state = {
        lists: [],
        loading: false,
        showModal: false,
        pageNum: 1, // 当前第几页
        page_size: 20, // 每页多少条
        total: 0, // 数据库总共多少条数据
        pages: 0,
        selectedRowKeys: []
      };
    }
    componentDidMount () {
    }
    // 服务器列表
    onGetMListData (param = {}) {
      let params = _.assign({}, this.searchCondition, {childId: this.props.record.id}, param);
      this.setState({ loading: true });
      http.get(`${BSS_ADMIN_URL}/api/old/moban/relation`, { params: tools.clearEmpty(params) })
        .then((res) => {
          res = res.data;
          if (tools.hasStatusOk(res)) {
            let lists = res.data.records;
            this.setState({
              lists: lists,
              total: res.data.total,
              pages: res.data.pages,
              pageNum: res.data.current,
              selectedRowKeys: [],

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

    /**
     * 重置搜索条件
     */
    onReset = () => {
      this.searchFormRef.current.resetFields();
    };
    modalShow () {
      this.searchCondition = {};
      this.props.type === 'see' ? this.onGetMListData()
        : this.onGetMListData({ inServer: true });
      // 通用服务器型号
      if (Object.keys(this.props.serverDict.server_model).length <= 0) {
        this.props.serverDict.fetchServerModel();
      }
      // 通用服务器品牌
      if (Object.keys(this.props.serverDict.server_brand).length <= 0) {
        this.props.serverDict.fetchServerBrand();
      }
      this.setState({
        showModal: true
      });
    }
    // 验证通过
    onSearch (values) {
      this.searchCondition = values;
      let obj = { ...values, inServer: true };
      this.props.type === 'see' ? this.onGetMListData(values) : this.onGetMListData(obj);
    }

    /** 点击关闭时触发 **/
    onClose = () => {
      this.setState({ showModal: false });
    };
    selectedRow = (selectedRowKeys, selectedRows) => {
      this.setState({
        selectedRowKeys
      });
    }
    showAddConfirm = () => {
      let selectedRowKeys = this.state.selectedRowKeys;
      let _that = this;
      let len = selectedRowKeys.length;
      if (len < 1) {
        Modal.warning({
          title: "提示",
          content: "请选择至少一条数据！",
          destroyOnClose: true,
        });
        return false;
      }
      confirm({
        title: "你确定要批量关联到子模板吗？",
        icon: <ExclamationCircleOutlined />,
        okText: "确定",
        okType: "danger",
        cancelText: "取消",
        onOk () {
          _that.onModelOk(selectedRowKeys);
          _that.setState({
            selectedRowKeys: [],
          });
        },
        onCancel () {
        },
      });
    };
    onModelOk = (value) => {
      this.setState({ loading: true });
      http
        .post(`${BSS_ADMIN_URL}/api/old/moban/relation/${this.props.record.id}/add`, value)
        .then((res) => {
          res = res.data;
          if (res.code === 20000) {
            this.onGetMListData({ page: 1, inServer: true });
            tools.auto_close_result('ok', '操作成功');
          } else {
            tools.dealFail(res);
            this.setState({ loading: false });
          }
        })
        .catch(() => {
          this.setState({ loading: false });
        });
    }
    // 构建字段 机房
    makeColumns () {
      const server_brand = this.props.serverDict.server_brand;
      const server_model = this.props.serverDict.server_model;
      const columns = [
        {
          title: '服务器类型',
          dataIndex: 'serverType',
          key: 'serverType',
          width: 120,
          render: (text, record) => SYS_DICT_SERVER.se_unittype[text] || '未知类型'
        },
        {
          title: '服务器名称',
          dataIndex: 'serverName',
          key: 'serverName',
          render: (text, record) => {
            // 规则：品牌_型号_规格
            let modal = server_model[record.serverModel] || undefined;
            let brand = server_brand[record.serverBrand] || undefined;
            return `${brand}_${modal}_${record.serverSpec}`;
          }
        },
        {
          title: '管理IP',
          dataIndex: 'serverIp',
          key: 'serverIp'
        },
        {
          title: '品牌',
          dataIndex: 'serverBrand',
          key: 'serverBrand',
          render: (text, record) => {
            if (text) {
              text = parseInt(text);
              return server_brand[text];
            }
            return '';
          }
        },
        {
          title: '型号',
          dataIndex: 'serverModel',
          key: 'serverModel',
          render: (text, record) => {
            if (text) {
              text = parseInt(text);
              return server_model[text];
            }
            return '';
          }
        },
        {
          title: '规格',
          dataIndex: 'serverSpec',
          key: 'serverSpec',
        },
        {
          title: 'CPU',
          dataIndex: 'serverCpu',
          key: 'serverCpu',
          render: (text, record) => record.serverCpu && record.serverCpu.cpuName
        },
        {
          title: '内存',
          dataIndex: 'serverCurrentMemory',
          key: 'serverCurrentMemory'
        },
        {
          title: '硬盘',
          dataIndex: 'serverCurrentDisk',
          key: 'serverCurrentDisk'
        },
        {
          title: '网卡',
          dataIndex: 'networkNumber',
          key: 'networkNumber'
        },
        {
          title: '销售状态',
          dataIndex: 'status',
          key: 'status',
          render: (text) => tools.renderStatus(SYS_DICT_SERVER.market, text)
        },
        {
          title: '发布状态',
          dataIndex: 'releaseStatus',
          key: 'releaseStatus',
          render: (text, record) => SYS_DICT_SERVER.releaseStatus[text] || 'unknow'
        },
        {
          title: '资源备注',
          dataIndex: 'remark',
          key: 'remark'
        },
      ];
      return columns;
    }
    render () {
      const { lists, showModal, loading, total, page_size, pageNum } = this.state;
      let { type, record } = this.props;
      const pagination = {
        current: pageNum,
        total: total,
        size: page_size,
        defaultPageSize: page_size,
        onChange: (current, size) => type === 'see' ? this.onGetMListData({  page: current, pageSize: size })
          : this.onGetMListData({  page: current, pageSize: size, inServer: true }),
        onShowSizeChange: (current, size) => type === 'see' ? this.onGetMListData({  page: current, pageSize: size })
          : this.onGetMListData({  page: current, pageSize: size, inServer: true }),
        showTotal: (total) => `一共${total}条数据`
      };
      return (
        <main style={{float: 'left'}}>
          <Modal
            title={type === 'see' ? '查看服务器' : '关联服务器'}
            maskClosable={false}
            width="80%"
            destroyOnClose
            footer={null}
            onCancel={this.onClose}
            visible={showModal}
          >
            {/* 搜索 */}
            <div className="g-search">
              <Form ref={this.searchFormRef} name="horizontal_login" layout="inline"
                onFinish={(values) => {this.onSearch(values);}}
              >
                <Form.Item name="serverType">
                  <Select
                    style={{width: 150}}
                    placeholder="设备类型" allowClear>
                    {
                      _.map(SYS_DICT_SERVER.se_unittype, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                    }
                  </Select>
                </Form.Item>
                <Form.Item name="serverIp">
                  <Input placeholder="管理IP" allowClear/>
                </Form.Item>
                <Form.Item name="status">
                  <Select
                    style={{width: 150}}
                    placeholder="销售状态" allowClear>
                    {
                      _.map(SYS_DICT_SERVER.market, (item, key) => <Option value={parseInt(key)} key={key} > {item.text} </Option>)
                    }
                  </Select>
                </Form.Item>
                <Form.Item shouldUpdate>
                  <Button type="primary" htmlType="submit" >搜索</Button>
                </Form.Item>
                <Form.Item shouldUpdate>
                  <Button type="primary" htmlType="reset" onClick={this.onReset}>重置</Button>
                </Form.Item>
              </Form>

            </div>
            <div className="c-operate" >
              <Button size="middle" onClick={this.showAddConfirm} className="actions-btn" style={type === 'see' ? { display: 'none' } : { display: 'inline-block' }}>
                            批量关联
              </Button>
              <Button size="middle" onClick={type === 'see'
                ? () => this.onGetMListData()
                : () => this.onGetMListData({ inServer: true })}
              className="actions-btn">
                            刷新
              </Button>
            </div>
            {/* 数据展示 */}
            <div className="g-table">
              {/* <DndProvider backend={HTML5Backend1}> </DndProvider> */}
              <Table
                columns={this.makeColumns()}
                rowKey={(record) => record.id}
                loading={loading}
                dataSource={lists}
                pagination={pagination}
                size="small"
                rowSelection={type === 'see' ? null : {
                  selectedRowKeys: this.state.selectedRowKeys,
                  onChange: (selectedRowKeys, selectedRows) => {this.selectedRow(selectedRowKeys, selectedRows);},
                }}
              />
            </div>
          </Modal>
          <span onClick={() => {this.modalShow();}}>
            {this.props.children}
          </span>
        </main>
      );
    }
}
export default Server;


