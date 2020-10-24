/* eslint-disable react/prop-types */

/** 资源管理/机柜U位管理 **/


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
      .get(`${BSS_ADMIN_URL}/api/product/diskmodel`, {
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
   // 获取容量
   onGetSize () {
    http
      .get(`${BSS_ADMIN_URL}/api/product/diskmodel/disksize`)
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
        dataIndex: "diskName",
        // width: 80,
        key: "diskName",
      },
      {
        title: "品牌",
        dataIndex: "diskBrand",
        key: "diskBrand",
      },
      {
        title: "硬盘大小",
        dataIndex: "diskSize",
        // width: 150,
        key: "diskSize",
      },
      {
        title: "硬盘类型简称",
        dataIndex: "diskShort",
        key: "diskShort",
        render: (text, record) => SYS_DICT_SERVERPART.disk_short[text],
      },
      {
        title: "规格",
        dataIndex: "diskMeasure",
        key: "diskMeasure",
        render: (text, record) => SYS_DICT_SERVERPART.server_disk_spec[text],
      },
      {
        title: "接口类型",
        dataIndex: "interfaceType",
        key: "interfaceType",
        render: (text, record) => SYS_DICT_SERVERPART.disk_interface_type[text],
      },
      // {
      //   title: "硬盘类型",
      //   dataIndex: "diskType",
      //   key: "diskType",
      //   render: (text, record) => this.props.disk_type[text],
      // },
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
    ];
    return columns;
  }

  render () {
    const { lists, showModal, loading, total, page_size, pageNum, lists2, lists4} = this.state;
    let { operateType, disk_type } = this.props;
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
              onFinish={(values) => {
                this.onSearch(values);
              }}
            >
              <Form.Item name="diskName">
                <Input placeholder="请输入硬盘名称" allowClear />
              </Form.Item>
              <Form.Item name="diskShort">
                <Select
                  style={{ width: 150 }}
                  allowClear
                  placeholder="请选择硬盘简称"
                >
                  {_.map(SYS_DICT_SERVERPART.disk_short, (value, key) => (
                    <Option value={key} key={key}>
                      {value}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="diskSize">
              <Select
                style={{ width: 240 }}
                allowClear
                placeholder="请选择硬盘容量"
              >
                {
                  lists4.map((item) => <Option key={item}>{item}</Option>)
                }
              </Select>
              </Form.Item>
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
