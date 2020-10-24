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
import { EyeOutlined, FormOutlined, DeleteOutlined } from "@ant-design/icons";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router";
import { observable } from "mobx";
import {
  formItemLayout,
  houseAttribute,
  UBitStatus,
} from "@src/config/commvar"; // 全局通用变量
import tools from "@src/util/tools"; // 工具
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const { TreeNode } = TreeSelect;

@withRouter
@inject("root")
@inject("cabinetDict")
@observer
class Customer extends React.Component {
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
  // formRefAdd = React.createRef();

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
    };
  }
  componentDidMount () {
    this.onGetMListData(this.state.pageNum, this.state.page_size);
  }

  // 获取归属方
  onGetMListData (param = {}) {
    let params = _.assign({}, this.searchCondition, param);
    this.setState({ loading: true });
    http
      .get(`${BSS_ADMIN_URL}/api/customer/manage/options`, {
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

  /**
   * 重置搜索条件
   */
  onReset = () => {
    this.searchFormRef.current.resetFields();
    // this.onGetMListData()
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
        title: "名称",
        dataIndex: "name",
        // width: 80,
        key: "name",
      },
      {
        title: "简称",
        dataIndex: "account",
        // width: 150,
        key: "account",
      },
    ];
    return columns;
  }

  render () {
    const { lists, showModal, loading, total, page_size, pageNum } = this.state;
    const pagination = {
      current: pageNum,
      total: total,
      defaultPageSize: page_size,
      onChange: (current) => this.onGetMListData({ page: current }),
    };
    let { operateType } = this.props;
    return (
      <main className="mian">
        <Modal
          title={this.props.title || "选择"}
          maskClosable={false}
          width="55%"
          destroyOnClose
          footer={null}
          onCancel={this.onClose}
          visible={this.props.type === 'uw' ? this.props.visible : showModal}
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
              <Form.Item name="keyword">
                <Input
                  style={{ width: 150 }}
                  allowClear
                  placeholder="请输入名称"
                ></Input>
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
export default Customer;
