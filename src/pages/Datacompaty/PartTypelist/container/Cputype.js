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
class Cputype extends React.Component {
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
        lists2: [],
        lists3: [],
      };
    }
    componentDidMount () {
    }
    // cpu列表
    onGetMListData (param = {}) {
      let params = _.assign({}, this.searchCondition, { productId: this.props.record.id }, param);

      this.setState({ loading: true });
      http.get(`${BSS_ADMIN_URL}/api/old/parts/cpu/list`, { params: tools.clearEmpty(params) })
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
    // 获取品牌
    onGetBrand () {
      http
        .get(`${BSS_ADMIN_URL}/api/product/cpumodel/cpubrand`)
        .then((res) => {
          res = res.data;
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
    // 获取型号
    onGetModel () {
      http
        .get(`${BSS_ADMIN_URL}/api/product/cpumodel/modelname`)
        .then((res) => {
          res = res.data;
          // console.log(res);
          if (res.code === 20000) {
            this.setState({
              lists3: res.data,
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
      this.props.type === 'see' ? this.onGetMListData()
        : this.onGetMListData({ inServer: true });
      this.onGetBrand();
      this.onGetModel();
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
        title: "你确定要批量关联到此配件类型吗？",
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
        .post(`${BSS_ADMIN_URL}/api/old/parts/cpu/${this.props.record.id}/add`, value)
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
      const columns = [
        {
          title: "CPU型号名称",
          dataIndex: "cpuName",
          key: "cpuName",
        },
        {
          title: "产品组",
          dataIndex: "productMapId",
          key: "productMapId",
        },
        {
          title: "CPU个数",
          dataIndex: "cpuNumber",
          key: "cpuNumber",
        },
        {
          title: "品牌",
          dataIndex: "cpuBrand",
          key: "cpuBrand",
        },
        {
          title: "型号",
          dataIndex: "cpuModel",
          key: "cpuModel",
        },
        {
          title: "主频(GHZ)",
          dataIndex: "cpuHz",
          key: "cpuHz",
        },
        {
          title: "核心数",
          dataIndex: "cpuCore",
          key: "cpuCore",
        },
        {
          title: "线程数",
          dataIndex: "cpuThread",
          key: "cpuThread",
        },
        {
          title: "接口类型",
          dataIndex: "interfaceType",
          key: "interfaceType",
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
      const { lists, showModal, loading, total, page_size, pageNum, lists2, lists3 } = this.state;
      let { type, } = this.props;
      const pagination = {
        current: pageNum,
        total: total,
        size: page_size,
        defaultPageSize: page_size,
        // showSizeChanger: true,
        onChange: (current, size) => type === 'see' ? this.onGetMListData({ page: current, pageSize: size })
          : this.onGetMListData({ page: current, pageSize: size, inServer: true }),
        onShowSizeChange: (current, size) => type === 'see' ? this.onGetMListData({ page: current, pageSize: size })
          : this.onGetMListData({ page: current, pageSize: size, inServer: true }),
        showTotal: (total) => `一共${total}条数据`
      };
      return (
        <main style={{float: 'left'}}>
          <Modal
            title={type === 'see' ? '查看CPU' : '关联CPU'}
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
                <Form.Item name="cpuName">
                  <Input placeholder="请输入CPU型号名称" allowClear />
                </Form.Item>
                <Form.Item name="cpuModel">
                  <Select
                    style={{ width: 240 }}
                    allowClear
                    placeholder="请选择cpu型号"
                  >
                    {
                      lists3.map((item) => <Option key={item}>{item}</Option>)
                    }
                  </Select>
                </Form.Item>
                <Form.Item name="cpuBrand">
                  <Select
                    style={{ width: 240 }}
                    allowClear
                    placeholder="请选择cpu品牌"
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
export default Cputype;


