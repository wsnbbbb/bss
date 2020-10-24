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
import { SYS_DICT_SERVERPART } from '@src/config/sysDict';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const { TreeNode } = TreeSelect;

@withRouter
class HardDiskModelRadio extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    children: P.any,
    onSelect: P.func, // 确认选择
    fetchPath: P.string, // 获取数据url
  };
  searchFormRef = React.createRef();
  constructor (props) {
    super(props);
    this.selectedRows = []; // 选中行数据
    this.searchParam = {};
    this.state = {
      lists: [],
      page: 1,
      pageSize: 10,
      loading: false,
      showModal: false,
    };
  }
  componentDidMount () {
  }
  componentWillReceiveProps (nextProps) {
  }

  /**
   * 获取内存条信息
   * @param {
   * us:number, u位数
   * regionId:string, 区域id
   * }  fileds
   */
  getDetail (fileds = {}) {
    this.setState({
      loading: true,
    });
    let params = {
      ...fileds,
      ...this.searchParam
    };
    http.get(this.props.fetchPath, {
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

  /**
   * 搜索
   * @param {obj} values 搜索条件
   */
  onSearch (values) {
    this.searchParam = tools.clearEmpty(values);
    this.setState({
      page: 1,
    });
    this.getDetail({page: 1});
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
      pageSize: pageSize
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
      pageSize: pageSize
    });
  }

  modalShow () {
    this.getDetail();
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
        title: '硬盘型号名称',
        dataIndex: 'diskName',
        key: 'diskName'
      },
      // {
      //   title: '产品组',
      //   dataIndex: 'productMapId',
      //   key: 'productMapId',

      // },
      {
        title: '品牌',
        dataIndex: 'diskBrand',
        key: 'diskBrand',

      },
      {
        title: '型号',
        dataIndex: 'diskModel',
        key: 'diskModel',

      },
      // {
      //   title: '硬盘类型',
      //   dataIndex: 'diskType',
      //   key: 'diskType',
      //   render: (text, record) => SYS_DICT_SERVERPART.disk_type[text] || ''
      // },
      {
        title: '硬盘类型简称',
        dataIndex: 'diskShort',
        key: 'diskShort',
        render: (text, record) => SYS_DICT_SERVERPART.disk_short[text] || ''
      },
      {
        title: '规格',
        dataIndex: 'diskMeasure',
        key: 'diskMeasure',
        render: (text, record) => SYS_DICT_SERVERPART.server_disk_spec[text] || ''
      },
      {
        title: '接口类型',
        dataIndex: 'interfaceType',
        key: 'interfaceType',
        render: (text, record) => SYS_DICT_SERVERPART.disk_interface_type[text] || ''
      },
      {
        title: '缓存(MB)',
        dataIndex: 'diskCache',
        key: 'diskCache',

      },
      {
        title: '转速',
        dataIndex: 'diskRpm',
        key: 'diskRpm',

      },
      {
        title: '硬盘容量',
        dataIndex: 'diskSize',
        key: 'diskSize',

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
    const {lists, showModal, loading} = this.state;
    return (
      <React.Fragment>
        <Modal
          title="选择硬盘型号"
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
              <Form.Item name="diskName">
                <Input placeholder="硬盘型号名称" allowClear/>
              </Form.Item>
              <Form.Item name="interfaceType">
                <Select
                  style={{width: 150}}
                  placeholder="硬盘接口类型" allowClear>
                  {
                    _.map(SYS_DICT_SERVERPART.disk_interface_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </Form.Item>
              <Form.Item name="diskMeasure">
                <Select
                  style={{width: 150}}
                  placeholder="硬盘规格" allowClear>
                  {
                    _.map(SYS_DICT_SERVERPART.server_disk_spec, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">搜索</Button>
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
export default HardDiskModelRadio;


