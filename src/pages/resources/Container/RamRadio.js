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
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import {SYS_DICT_SERVERPART, SYS_DICT_SERVER} from '@src/config/sysDict'; // 全局变量
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
    disabled: P.bool, // 父组件 来控制子组件是否可用 比如：前置条件机房已经有了 就让使用子组件
    disabledTip: P.string, // 不能使用子组件原因
    title: P.string,
    style: P.any, // 样式
    fetchPath: P.string, // 获取数据的查询条件
    onSelect: P.func, // 确认选择
  };
  formRefAdd = React.createRef();
  constructor (props) {
    super(props);
    this.selectAreaNode = {}; // 选中的地区节点信息
    this.selectedRows = []; // 选中行数据
    this.regionId = '';
    this.uw = 0;
    this.state = {
      nwoData: {}, // 获取的机柜数据
      lists: [], // 通过机柜名称查询后的数据
      page: 1,
      pageSize: 10,
      loading: false,
      showModal: false,
    };
  }
  componentDidMount () {
    // this.getDetail();
  }
  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextProps.regionId !== this.props.regionId;
  // }
  componentWillReceiveProps (nextProps) {
  }

  /**
   * 获取内存条信息
   * @param {
   * 查询条件
   * }  fileds
   */
  getDetail (fileds = {}) {
    const params = _.assign({}, {
      page: this.state.page,
      pageSize: this.state.pageSize,
      // size: this.state.pageSize,
    }, this.searchParam, {
      ...fileds
    });
    this.setState({
      loading: true,
    });
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
    this.searchParam = values;
    this.setState({
      page: 1,
    });
    this.getDetail(values);
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.formRefAdd.current.resetFields();
  };

  // 表单页码改变
  onPageChange (page, pageSize) {
    this.setState({
      page: page,
    });
    this.getDetail({
      page: page,
      pageSize: pageSize,
      ...this.searchParam
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
        title: "内存编号",
        dataIndex: "memCode",
        key: "memCode",
      },
      {
        title: "内存位置码",
        dataIndex: "houseLocationCode",
        key: "houseLocationCode",
      },
      {
        title: "内存型号名称",
        dataIndex: "memName",
        key: "memName",
        render: (text, record) =>
          (record.memorymodelList[0] && record.memorymodelList[0].memName) || "",
      },
      {
        title: "内存类型",
        dataIndex: "memType",
        key: "memType",
        render: (text, record) => {
          let memType = (record.memorymodelList[0] && record.memorymodelList[0].memType) || "";
          return SYS_DICT_SERVERPART.memory_type[memType];
        },
      },
      {
        title: "支持规格",
        dataIndex: "memSpec",
        key: "memSpec",
        render: (text, record) => {
          let memSpec = (record.memorymodelList[0] && record.memorymodelList[0].memSpec) || "";
          return SYS_DICT_SERVERPART.mem_spec[memSpec];
        },
      },
      {
        title: "内存容量(GB)",
        dataIndex: "memSize",
        key: "memSize",
        render: (text, record) =>
          (record.memorymodelList[0] && record.memorymodelList[0].memSize) || "",
      },
      {
        title: "存放机房",
        dataIndex: "houseName",
        key: "houseName",
      },
      {
        title: "采购时间",
        dataIndex: "purchasingTime",
        key: "purchasingTime",
        render: (text, record) => tools.getTime(text),
      },
      {
        title: "入库时间",
        dataIndex: "storageTime",
        key: "storageTime",
        render: (text, record) => tools.getTime(text),
      },
      {
        title: "资源归属",
        dataIndex: "resourceAttribution",
        key: "resourceAttribution",
        render: (text, record) => SYS_DICT_SERVERPART.resource_attribution[text],
      },
      {
        title: "归属方",
        dataIndex: "customerName",
        key: "customerName",
      },
      {
        title: "显示类型",
        dataIndex: "showType",
        key: "showType",
        render: (text, record) => SYS_DICT_SERVERPART.show_type[text],
      },
      {
        title: "发布状态",
        dataIndex: "releaseStatus",
        key: "releaseStatus",
        render: (text, record) => SYS_DICT_SERVERPART.releaseStatus[text],
      },
      {
        title: "资源状态",
        dataIndex: "saleStatus",
        key: "saleStatus",
        render: (text, record) => tools.renderStatus(SYS_DICT_SERVERPART.parts_res_status, text),
      },
    ];
    return columns;
  }

  render () {
    const {lists, showModal, loading} = this.state;
    return (
      <React.Fragment>
        <Modal
          title={this.props.title || '选择内存卡'}
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
              <Form.Item name="memCode" >
                <Input allowClear placeholder="请输入内存编号" />
              </Form.Item>
              <Form.Item name="memName" >
                <Input allowClear placeholder="请输入内存名称" />
              </Form.Item>
              <Form.Item name="memSize">
                <Input allowClear placeholder="请输入内存容量" />
              </Form.Item>
              <Form.Item name="resourceAttribution">
                <Select
                  style={{ width: 140 }}
                  allowClear
                  placeholder="请选择资源归属"
                >
                  {_.map(SYS_DICT_SERVERPART.resource_attribution, (value, key) => (
                    <Option key={key} value={parseInt(key)}>
                      {value}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="customerName">
                <Input allowClear placeholder="请输入资源归属方名称"></Input>
              </Form.Item>
              <Form.Item name="showType">
                <Select
                  style={{ width: 140 }}
                  allowClear
                  placeholder="请选择显示类型"
                >
                  {_.map(SYS_DICT_SERVERPART.show_type, (value, key) => (
                    <Option key={key} value={parseInt(key)}>
                      {value}
                    </Option>
                  ))}
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


