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
import { EyeOutlined, FormOutlined, DeleteOutlined} from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';
import {observable} from "mobx";
import {formItemLayout, houseAttribute, UBitStatus} from '@src/config/commvar'; // 全局通用变量
import { SYS_DICT_SERVERPART } from '@src/config/sysDict';
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
// ==================
// Definition
// ==================
const { Option } = Select;
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
    disabled: P.bool, // 父组件 来控制子组件是否可用 比如：前置条件机房已经有了 就让使用子组件
    disabledTip: P.string, // 不能使用子组件原因
    title: P.string,
    style: P.any, // 样式
    fetchPath: P.string, // 获取数据的查询条件
    onSelect: P.func, // 确认选择
  };
  searchFormRef = React.createRef();
  constructor (props) {
    super(props);
    this.selectAreaNode = {}; // 选中的地区节点信息
    this.selectedRows = []; // 选中行数据
    this.searchParam = {}; // 搜索条件
    this.state = {
      lists: [], //
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
   * 查询条件
   * }  fileds
   */
  getDetail (fileds = {}) {
    this.setState({
      loading: true,
    });
    http.get(this.props.fetchPath, {
      params: {...fileds, ...this.searchParam}
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
    if (this.props.disabled) {
      Modal.warning({
        titile: this.props.disabledTip
      });
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

  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: "硬盘编号",
        dataIndex: "diskCode",
        key: "diskCode",
      },
      {
        title: "位置码",
        dataIndex: "houseLocationCode",
        key: "houseLocationCode",
      },
      {
        title: "硬盘型号名称",
        dataIndex: "diskName",
        key: "diskName",
        render: (text, record) =>
          (record.diskmodelList[0] && record.diskmodelList[0].diskName) || "",
      },
      {
        title: "硬盘容量(G)",
        dataIndex: "diskSize",
        key: "diskSize",
        render: (text, record) =>
          (record.diskmodelList[0] && record.diskmodelList[0].diskSize) || "",
      },
      {
        title: '规格',
        dataIndex: 'diskMeasure',
        key: 'diskMeasure',
        render: (text, record) => SYS_DICT_SERVERPART.server_disk_spec[record.diskmodelList[0] && record.diskmodelList[0].diskMeasure] || ''
      },
      {
        title: '接口类型',
        dataIndex: 'interfaceType',
        key: 'interfaceType',
        render: (text, record) => SYS_DICT_SERVERPART.disk_interface_type[record.diskmodelList[0] && record.diskmodelList[0].interfaceType] || ''
      },
      {
        title: "存放机房",
        dataIndex: "houseName",
        key: "houseName",
      },
      {
        title: "归属方",
        dataIndex: "customerName",
        key: "customerName",
      },
      {
        title: "使用服务器",
        dataIndex: "serverManagerIp",
        key: "serverManagerIp",
      },
      {
        title: "备注",
        dataIndex: "remark",
        key: "remark",
      }
    ];
    return columns;
  }

  render () {
    const {lists, showModal, loading} = this.state;
    return (
      <React.Fragment>
        <Modal
          title={this.props.title || '选择硬盘'}
          maskClosable={false}
          width="98%"
          destroyOnClose
          footer={false}
          onCancel={this.onClose}
          visible={showModal}
        >
          {/* 搜索 */}
          <div className="g-search">
            <Form ref={this.searchFormRef} name="searchbox" layout="inline" onFinish={(values) => {this.onSearch(values);}}>
              <Form.Item name="diskName">
                <Input allowClear placeholder="请输入硬盘名称" />
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
        <span onClick={() => {this.modalShow();}}>
          {this.props.children}
        </span>
      </React.Fragment>
    );
  }
}
export default RamRadio;


