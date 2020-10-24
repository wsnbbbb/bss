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
  InputNumber,
  Table,
  message,
  Popconfirm,
  Spin,
  Modal,
  Pagination,
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
class RamRadio extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    root: P.any,
    children: P.any,
    powers: P.array, // 当前登录用户权限
    onSelect: P.func, // 确认选择
  };
  searchFormRef = React.createRef();
  constructor (props) {
    super(props);
    this.selectedRows = []; // 选中行数据
    this.searchParam = {};
    this.state = {
      lists: [], // 通过机柜名称查询后的数据
      page: 1,
      pageSize: 10,
      loading: false,
      showModal: false,
    };
  }
  componentDidMount () {
    this.getDetail();
  }
  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextProps.regionId !== this.props.regionId;
  // }
  componentWillReceiveProps (nextProps) {
    // if (nextProps.regionId && nextProps.regionId !== this.props.regionId) {
    //   this.getDetail();
    // }

  }

  /**
   * 搜索
   * @param {obj} values 搜索条件
   */
  onSearch (values) {
    this.searchParam = values;
    this.setState({
      page: 1,
    });
    this.getDetail(values);
  }

  /**
   * 获取内存条信息
   * @param {
   * }  fileds
   */
  getDetail (fileds = {}) {
    this.setState({
      loading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/product/cpumodel`, {
      params: fileds
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            loading: false,
            lists: res.data.records,
            orgionLists: res.data.records,
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
      cpuName: selectedRows[0].cpuName,
    });
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.searchFormRef.current.resetFields();
  };

  // 表单页码改变
  onPageChange (page, pageSize) {
    this.setState({
      page: page,
    });
    this.getDetail({
      page: page,
      pageSize: pageSize,
      ...this.searchParam,
    });
  }

  // 表单页码长度改变
  onPageSizeChange (page, pageSize) {
    this.setState({
      page: page,
      pageSize: pageSize
    });
    this.getDetail({
      page: page,
      pageSize: pageSize,
      ...this.searchParam,
    });
  }

  modalShow () {
    this.setState({
      showModal: true
    });
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.setState({showModal: false});
  };

  // 构建字段
  makeColumns () {
    const columns = [
      // {
      //   title: '序号',
      //   dataIndex: 'id',
      //   key: 'id',
      //   render: (text, record, index) => index + 1
      // },
      {
        title: 'CPU型号名称',
        dataIndex: 'cpuName',
        key: 'cpuName'
      },
      {
        title: '产品组',
        dataIndex: 'productMapId',
        key: 'productMapId',

      },
      {
        title: 'CPU个数',
        dataIndex: 'cpuNumber',
        key: 'cpuNumber',

      },
      {
        title: '品牌',
        dataIndex: 'cpuBrand',
        key: 'cpuBrand',

      },
      {
        title: '型号',
        dataIndex: 'cpuModel',
        key: 'cpuModel',

      },
      {
        title: '主频(GHZ)',
        dataIndex: 'cpuHz',
        key: 'cpuHz',

      },
      {
        title: '核心数',
        dataIndex: 'cpuCore',
        key: 'cpuCore',

      },
      {
        title: '线程数',
        dataIndex: 'cpuThread',
        key: 'cpuThread',

      },
      {
        title: '接口类型',
        dataIndex: 'interfaceType',
        key: 'interfaceType',
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',

      }
    ];
    return columns;
  }

  render () {
    const {lists, showModal, loading, cpuName} = this.state;
    return (
      <React.Fragment>
        <Modal
          title="选择cpu型号"
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
              <Form.Item name="cpuName">
                <Input placeholder="cpu型号名称" allowClear/>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" >搜索</Button>
                <Button type="primary" onClick={this.onResetSearch}>重置</Button>
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
              }}/>
          </div>
          <div className="g-pagination">
            <Pagination current={this.state.page} total={this.state.total} pageSize={this.state.pageSize}
              showSizeChanger
              showTotal={(total) => `共 ${total} 条`}
              onChange={(current, size) => {this.onPageChange(current, size);}}
              onShowSizeChange={(current, size) => {this.onPageSizeChange(current, size);}}
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
export default RamRadio;


