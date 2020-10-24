/**
 * 用于选择网络设备,为其他组件提供
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
  Table,
  Pagination,
  Modal,
  Select,
  TreeSelect
} from 'antd';
import { CloseOutlined} from '@ant-design/icons';
import { inject} from 'mobx-react';
import { withRouter } from 'react-router';
import {SYS_DICT_NET_DEVICE} from '@src/config/sysDict'; // 全局通用变量
import tools from '@src/util/tools'; // 工具
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { Option } = Select;

@withRouter
class DeviceRadio extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    allowClear: P.bool, // 允许清空
    disabled: P.bool, // 父组件 来控制子组件是否可用 比如：前置条件机房已经有了 就让使用子组件
    disabledTip: P.string, // 不能使用子组件原因
    powers: P.array, // 当前登录用户权限
    onSelect: P.func, // 确认选择
    fetchPath: P.string, // 查条件
    title: P.string,
    style: P.any, // 样式
    type: P.string, // type:'button'|'input'
    text: P.string,
    children: P.any,
  };
  searchFormRef = React.createRef();
  constructor (props) {
    super(props);
    this.selectedRows = []; // 选中行数据
    this.searchParam = {}, // 查询条件
    this.state = {
      nwoData: {}, // 获取的机柜数据
      lists: [], // 通过机柜名称查询后的数据
      page: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      showModal: false,
      deviceName: '',
    };
  }
  componentDidMount () {
  }
  componentWillReceiveProps (nextProps) {
  }

  /**
   * 获取网络设备查询条件
   * @param {obj}  fileds
   */
  getDetail (fileds = {}) {
    this.setState({
      loading: true,
    });
    http.get(this.props.fetchPath, {
      params: tools.clearEmpty(fileds)
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

  // 查询
  onSearch (obj) {
    this.searchParam = obj;
    this.setState({
      page: 1,
    });
    this.getDetail(obj);
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
      ...this.searchParam,
      page: page,
      pageSize: pageSize,
    });
  }

  // 表单页码长度改变
  onPageSizeChange (page, pageSize) {
    this.setState({
      page: page,
      pageSize: pageSize
    });
    this.getDetail({
      ...this.searchParam,
      page: page,
      pageSize: pageSize
    });
  }

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
  }

  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        key: 'deviceName'
      },
      {
        title: '区域',
        dataIndex: 'fullLocationName',
        key: 'fullLocationName'
      },
      {
        title: '机柜',
        dataIndex: 'cabinetName',
        key: 'cabinetName'
      },
      {
        title: '物理位置码',
        dataIndex: 'locationCode',
        key: 'PhyLocationCode'
      },
      {
        title: '管理IP',
        dataIndex: 'ip',
        key: 'ip'
      },
      {
        title: '起始U位',
        dataIndex: 'startubat',
        key: 'startubat'
      },
      {
        title: '占用U位',
        dataIndex: 'uw',
        key: 'uw'
      },
      {
        title: '端口数量',
        dataIndex: 'num',
        key: 'num'
      },
      {
        title: '设备类型',
        dataIndex: 'deviceType',
        key: 'deviceType',
        render: (text, record) => SYS_DICT_NET_DEVICE.re_facility[text]
      },
      // {
      //   title: '入库时间',
      //   dataIndex: 'storagetime',
      //   key: 'storagetime'
      // },
      // {
      //   title: '备注',
      //   dataIndex: 'remarks',
      //   key: 'remarks'
      // },
    ];
    return columns;
  }

  render () {
    const {lists, showModal, loading} = this.state;
    return (
      <React.Fragment>
        <Modal
          title={this.props.title || '选择设备'}
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
                <Input placeholder="设备名称" allowClear/>
              </Form.Item>
              <Form.Item name="cabinetName">
                <Input placeholder="机柜名称" allowClear/>
              </Form.Item>
              <Form.Item name="deviceType">
                <Select
                  style={{width: 150}}
                  placeholder="设备类型" allowClear>
                  {
                    _.map(SYS_DICT_NET_DEVICE.re_facility, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </Form.Item>
              <Form.Item shouldUpdate>
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
              }}
            />
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
        <span className="inner-input" onClick={() => {this.modalShow();}} style={this.props.style}>
          {this.props.children}
        </span>
        {this.props.allowClear && <span className="clearBtn" onClick={() => {this.clear();}}><CloseOutlined /></span>}
      </React.Fragment>
    );
  }
}
export default DeviceRadio;


