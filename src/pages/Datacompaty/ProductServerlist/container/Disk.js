/* eslint-disable no-duplicate-imports */
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
import { serverTypes } from '@src/config/commvar'; // 全局变量
import {SYS_DICT_SERVERPART} from '@src/config/sysDict'; // 系统字典

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
@inject("serverPartDict")
@inject("areaResouse")
@observer
class Ram extends React.Component {
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
      areaResouse: P.any, // 区域字典
      serverPartDict: P.any, // 服务器字典
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
        selectedRowKeys: [], // 选中的key
        lists2: []
      };
    }
    componentDidMount () {
    }
    // 硬盘列表
    onGetMListData (param = {}) {
      let params = _.assign({}, this.searchCondition, { productId: this.props.record.id }, param);
      this.setState({ loading: true });
      http.get(`${BSS_ADMIN_URL}/api/old/product/disk`, { params: tools.clearEmpty(params) })
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
    onGetBrand () {
      http
        .get(`${BSS_ADMIN_URL}/api/product/diskmodel/diskbrand`)
        .then((res) => {
          res = res.data;
          // console.log(res);
          if (res.code === 20000) {
            this.setState({
              lists2: res.data,
            });
          } else {
            message.error(res.data);
          }
        })
        .catch(() => {
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
      this.onGetBrand();
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
        title: "你确定要批量关联到产品组吗？",
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
      let objId = [];
      value.forEach((item) => {
        objId.push({ "objId": item });
      });
      this.setState({ loading: true });
      http
        .post(`${BSS_ADMIN_URL}/api/old/product/disk/${this.props.record.id}/add`, objId)
        .then((res) => {
          res = res.data;
          if (res.code === 20000) {
            this.onGetMListData({ page: 1, inServer: true });
            this.setState({
              selectedRowKeys: []
            });
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
    // 构建字段
    makeColumns () {
      const {disk_interface_type, disk_type, disk_short, server_disk_spec} = SYS_DICT_SERVERPART;
      const columns = [
        {
          title: "硬盘型号名称",
          dataIndex: "diskName",
          key: "diskName",
        },
        {
          title: "品牌",
          dataIndex: "diskBrand",
          key: "diskBrand",
        },
        {
          title: "型号",
          dataIndex: "diskModel",
          key: "diskModel",
        },
        // {
        //   title: "硬盘类型",
        //   dataIndex: "diskType",
        //   key: "diskType",
        //   render: (text, record) => disk_type[text],
        // },
        {
          title: "硬盘类型简称",
          dataIndex: "diskShort",
          key: "diskShort",
          render: (text, record) => disk_short[text],
        },
        {
          title: "规格",
          dataIndex: "diskMeasure",
          key: "diskMeasure",
          render: (text, record) => server_disk_spec[text],
        },
        {
          title: "接口类型",
          dataIndex: "interfaceType",
          key: "interfaceType",
          render: (text, record) => disk_interface_type[text],
        },
        {
          title: "缓存(MB)",
          dataIndex: "diskCache",
          key: "diskCache",
        },
        {
          title: "转速",
          dataIndex: "diskRpm",
          key: "diskRpm",
        },
        {
          title: "硬盘容量",
          dataIndex: "diskSize",
          key: "diskSize",
        },
        {
          title: "备注",
          dataIndex: "remark",
          key: "remark",
        },
      ];
      return columns;
    }
    render () {
      const { lists, showModal, loading, total, page_size, pageNum, lists2 } = this.state;
      let { type, } = this.props;
      const {disk_type} = SYS_DICT_SERVERPART;
      const pagination = {
        current: pageNum,
        total: total,
        size: page_size,
        defaultPageSize: page_size,
        onChange: (current, size) => type === 'see' ? this.onGetMListData({ page: current, pageSize: size })
          : this.onGetMListData({ page: current, pageSize: size, inServer: true }),
        onShowSizeChange: (current, size) => type === 'see' ? this.onGetMListData({ page: current, pageSize: size })
          : this.onGetMListData({ page: current, pageSize: size, inServer: true }),
        showTotal: (total) => `一共${total}条数据`
      };
      return (
        <main style={{float: 'left'}}>
          <Modal
            title={type === 'see' ? '查看硬盘' : '关联硬盘'}
            maskClosable={false}
            width="80%"
            destroyOnClose
            footer={null}
            onCancel={this.onClose}
            visible={showModal}
          >
            {/* 搜索 */}
            <div className="g-search" >
              <Form ref={this.searchFormRef} name="horizontal_login" layout="inline"
                onFinish={(values) => {this.onSearch(values);}}
              >
                <Form.Item name="diskName">
                  <Input placeholder="请输入硬盘名称" allowClear />
                </Form.Item>
                <Form.Item name="diskSize">
                  <Input placeholder="请输入硬盘容量" allowClear />
                </Form.Item>
                {/* <Form.Item name="diskType">
                  <Select
                    style={{ width: 240 }}
                    allowClear
                    placeholder="请选择硬盘类型"
                  >
                    {_.map(disk_type, (value, key) => (
                      <Option value={parseInt(key)} key={key}>
                        {value}
                      </Option>
                    ))}
                  </Select>
                </Form.Item> */}
                <Form.Item name="diskBrand">
                  <Select
                    style={{ width: 240 }}
                    allowClear
                    placeholder="请选择硬盘品牌"
                  >
                    {
                      lists2.map((item) => <Option key={item}>{item}</Option>)
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
export default Ram;


