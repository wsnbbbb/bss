/**
 * 用于服务器 业务类型选择
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
  InputNumber,
  Table,
  Pagination,
  message,
  Popconfirm,
  Spin,
  Modal,
  Tooltip,
  Divider,
  Select,
  TreeSelect
} from 'antd';
import { CloseOutlined} from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';
import {observable} from "mobx";
import {formItemLayout, houseAttribute, UBitStatus} from '@src/config/commvar'; // 全局通用变量
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import UBitOptLog from '@src/pages/resources/container/UBitOptLog';
import RegionInput from '@src/pages/resources/container/RegionInput';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const { TreeNode } = TreeSelect;

@withRouter
@inject('root')
@inject('portDict')
class BussineType extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    root: P.any,
    children: P.any,
    portDict: P.any,
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
    this.searchParam = {}; // 查询条件
    this.state = {
      lists: [], // 通过机柜名称查询后的数据
      page: 1,
      pageSize: 10,
      loading: false,
      showModal: false,
    };
  }
  componentDidMount () {
    // this.onGetListData();
  }
  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextProps.houseId !== this.props.houseId;
  // }
  componentWillReceiveProps (nextProps) {
    // if (nextProps.houseId && nextProps.houseId !== this.props.houseId) {
    //   this.onGetListData();
    // }

  }

  // 获取端口信息
  onGetListData (fileds = {}) {
    // if (this.props.hardParam) {
    //   hardParam = this.props.hardParam;
    // }
    let params = {
      ...this.searchParam,
      ...fileds
    };
    this.setState({
      loading: true,
    });
    http.get(`${this.props.fetchPath}`, {
      params: params
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            loading: false,
            lists: res.data.records,
            total: res.data.total
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

  // 搜索
  onSearch (values) {
    this.searchParam = values; // 保存搜索条件 分页时使用
    this.setState({
      page: 1, // 页码重置为1
    });
    this.onGetListData(values);
  }

  modalShow () {
    if (this.props.disabled) {
      Modal.warning({
        title: this.props.disabledTip
      });
      return;
    }
    this.onGetListData();
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
  }

  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: '业务类型名称',
        dataIndex: 'name',
        // width: 150,
        key: 'name',
      }
    ];
    return columns;
  }

  // 表单页码改变
  onPageChange (page, pageSize) {
    this.setState({
      page: page,
    });
    this.onGetListData({
      page: page,
      pageSize: pageSize
    });
  }

  // 表单页码长度改变
  onPageSizeChange (page, pageSize) {
    this.setState({
      page: page,
      pageSize: pageSize
    });
    this.onGetListData({
      page: page,
      pageSize: pageSize
    });
  }

  render () {
    const {lists, showModal, loading, portName, page, pageSize, total} = this.state;
    return (
      <React.Fragment>
        <Modal
          title={this.props.title || '选择业务类型'}
          maskClosable={false}
          width="90%"
          destroyOnClose
          footer={false}
          onCancel={this.onClose}
          visible={showModal}
        >
          {/* 搜索 */}
          <div className="g-search">
            <Form ref={this.searchFormRef} name="searchbox" layout="inline" onFinish={(values) => {this.onSearch(values);}}>
              <Form.Item name="name">
                <Input placeholder="业务类型名称" allowClear/>
              </Form.Item>
              <Form.Item>
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
                onChange: (selectedRowKeys, selectedRows) => {this.selectedRow(selectedRowKeys, selectedRows);}
              }}
            />
          </div>
          <div className="g-pagination">
            <Pagination current={page} total={total} pageSize={pageSize}
              showSizeChanger
              showTotal={(total) => `共 ${total} 条`}
              onChange={(current, size) => {this.onPageChange(current, size);}}
              onShowSizeChange={(current, size) => {this.onPageSizeChange(current, size);}}
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
export default BussineType;


