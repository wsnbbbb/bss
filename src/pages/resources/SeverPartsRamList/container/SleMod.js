/* eslint-disable react/prop-types */

/** 资源管理/机柜U位管理 **/

// ==================
// 所需的各种插件
// ==================

import React from "react";
import P from "prop-types";
import _ from "lodash";
import http from "@src/util/http";
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
  TreeSelect,
} from "antd";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router";
import tools from "@src/util/tools"; // 工具
import {SYS_DICT_SERVERPART} from '@src/config/sysDict'; // 系统字典
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { Option } = Select;

@withRouter
@inject("root")
@inject("cabinetDict")
@observer
class SleMod extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    root: P.any,
    cabinetDict: P.any,
    powers: P.array, // 当前登录用户权限
    defaultData: P.any, // 当前选中的信息
    onOk: P.func, // 弹框确认
    onClose: P.func, // 只关闭弹窗
  };

  constructor (props) {
    super(props);
    this.selectedRows = []; // 选中行数据
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
      lists2: [],
      lists4: [],
    };
  }
  componentDidMount () {
    this.onGetMListData(this.state.pageNum, this.state.page_size);
    this.onGetBrand();
    this.onGetSize();
  }

  // 内存型号列表
  onGetMListData (param = {}) {
    let params = _.assign({}, this.searchCondition, param);
    this.setState({ loading: true });
    http
      .get(`${BSS_ADMIN_URL}/api/product/memorymodel`, {
        params: tools.clearNull(params),
      })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let lists = res.data.records;
          this.setState({
            lists: lists,
            total: res.data.total,
            pages: res.data.pages,
            pageNum: res.data.current,
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
      .get(`${BSS_ADMIN_URL}/api/product/memorymodel/memorybrand`)
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
  // 获取容量
  onGetSize () {
    http
      .get(`${BSS_ADMIN_URL}/api/product/memorymodel/memorysize`)
      .then((res) => {
        res = res.data;
        // console.log(res);
        if (res.code === 20000) {
          this.setState({
            lists4: res.data,
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
    this.setState({
      showModal: true,
    });
  }
  // 验证通过
  onSearch (values) {
    this.searchCondition = values;
    this.onGetMListData(values);
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.setState({ showModal: false });
  };
  selectedRow = (selectedRowKeys, selectedRows) => {
    this.props.onSelect(selectedRows);
    this.setState({
      showModal: false,
    });
  };
  // 构建字段 机房
  makeColumns () {
    const columns = [
      {
        title: "型号名称",
        dataIndex: "memName",
        key: "memName",
      },
      {
        title: "内存大小",
        dataIndex: "memSize",
        key: "memSize",
      },
      {
        title: "内存主频(MHZ)",
        dataIndex: "memHz",
        key: "memHz",
      },
      {
        title: "内存品牌",
        dataIndex: "memBrand",
        key: "memBrand",
      },
      {
        title: "内存型号",
        dataIndex: "memModel",
        key: "memModel",
      },
      {
        title: "内存规格",
        dataIndex: "memSpec",
        key: "memSpec",
        render: (text, record) => SYS_DICT_SERVERPART.mem_spec[text],
      },
      {
        title: "内存类型",
        dataIndex: "memType",
        key: "memType",
        render: (text, record) => SYS_DICT_SERVERPART.memory_type[text],
      },
    ];
    return columns;
  }

  render () {
    const { lists, showModal, loading, total, page_size, pageNum, lists2, lists4} = this.state;
    let { memory_type, operateType, mem_spec } = SYS_DICT_SERVERPART;
    const pagination = {
      current: pageNum,
      total: total,
      defaultPageSize: page_size,
      onChange: (current) => this.onGetMListData({ page: current }),
    };
    return (
      <main className="mian">
        <Modal
          title={this.props.title || "选择"}
          maskClosable={false}
          width="70%"
          destroyOnClose
          footer={null}
          onCancel={this.onClose}
          visible={showModal}
        >
          {/* 搜索 */}
          <div className="g-search">
            <Form
              ref={this.searchFormRef}
              name="horizontal_login"
              layout="inline"
              // initialValues={this.searchCondition}
              onFinish={(values) => {
                this.onSearch(values);
              }}
            >
              <Form.Item name="memName">
                <Input
                  allowClear
                  placeholder="请输入内存名称"
                >
                </Input>
              </Form.Item>
              <Form.Item name="memType">
                <Select
                  style={{ width: 150 }}
                  allowClear
                  placeholder="请选择内存类型"
                >
                  {_.map(memory_type, (value, key) => (
                    <Option value={key} key={key}>
                      {value}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="memSize">
              <Select
                style={{ width: 240 }}
                allowClear
                placeholder="请选择内存容量"
              >
                {
                  lists4.map((item) => <Option key={item}>{item}</Option>)
                }
              </Select>
              </Form.Item>
              <Form.Item name="memBrand">
                <Select
                  style={{ width: 240 }}
                  allowClear
                  placeholder="请选择内存品牌"
                >
                  {
                    lists2.map((item) => <Option key={item}>{item}</Option>)
                  }
                </Select>
              </Form.Item>
              <Form.Item shouldUpdate>
                <Button type="primary" htmlType="submit">
                  搜索
                </Button>
              </Form.Item>
              <Form.Item shouldUpdate>
                <Button type="primary" htmlType="reset" onClick={this.onReset}>
                  重置
                </Button>
              </Form.Item>
              <Form.Item shouldUpdate>
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={() => this.onGetMListData}
                >
                  刷新
                </Button>
              </Form.Item>
            </Form>
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
              rowSelection={{
                type: "radio",
                onChange: (selectedRowKeys, selectedRows) => {
                  this.selectedRow(selectedRowKeys, selectedRows);
                },
              }}
            />
          </div>
        </Modal>
        <span
          onClick={() => {
            this.modalShow();
          }}
          style={
            operateType === "see" ? { display: "none" } : { display: "flex" }
          }
        >
          {this.props.children}
        </span>
      </main>
    );
  }
}
export default SleMod;
