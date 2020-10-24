/* eslint-disable react/prop-types */
/** User 系统管理/角色管理 **/

// ==================
// 所需的各种插件
// ==================

import React from "react";
import P from "prop-types";
import {
  Form,
  Button,
  Pagination,
  Input,
  Table,
  message,
  Popconfirm,
  Modal,
  Tooltip,
  Divider,
  Select,
} from "antd";
import {
  EyeOutlined,
  UsergroupAddOutlined,
  FormOutlined,
  DeleteOutlined,
  LinkOutlined,
  SettingFilled,
  UnlockOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { inject, observer } from "mobx-react";
// import "./index.less";
import tools from "@src/util/tools"; // 工具
import qs from "qs";
import _ from "lodash";
import http from "@src/util/http";
// ==================
// 所需的所有组件
// ==================

// import Add from "./container/add";
import Server from "./container/Server";
import Ram from "./container/Ram";
import Disk from "./container/Disk";
import Cpu from "./container/Cpu";
// ==================
// Definition

// ==================
const { Option } = Select;
const FormItem = Form.Item;
const { confirm } = Modal;
function setParams ({ query = "" }) {
  const searchParams = new URLSearchParams();
  searchParams.set("query", query);
  return searchParams.toString();
}

@inject("root")
@inject("authManage")
@inject("pageUserstore")
@inject("serverPartDict")
@observer
export default class RoleAdminContainer extends React.Component {
  static propTypes = {
    location: P.any, // 当前位置
    history: P.any,
    userinfo: P.any, // 用户信息
    powers: P.array, // 用户权限
    authManage: P.any,
    match: P.any, // 路径
    pageUserstore: P.any,
    root: P.any, // 全局资源
    serverPartDict: P.any, // 服务器字典
  };

  /**
   * 查询条件分三类
   * filter：表格上方的查询条件
   * page:分页及页码
   * sort:排序
   * 附加条件：例如机构号
   */
  constructor (props) {
    super(props);
    this.searchFormRef = React.createRef();
    (this.searchCondition = {}), // 顶部搜索条件
    (this.state = {
      lists: [], // 当前页面列表数据
      loading: false, // 表格数据是否正在加载中
      pageNum: 1, // 当前第几页
      page_size: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
    });
  }
  componentDidMount () {
    this.onGetListData(this.state.pageNum, this.state.page_size);
  }

  // 更新url触发
  updateURL = () => {
    const url = setParams({ query: this.state.inputValue });
    this.props.history.push(`?${url}`);
  };

  // 获取所有的权限

  /**
   *修改当前机构
   * @param {string} key 机构id
   * @param {treenode} node
   */
  componentWillReceiveProps () {}

  /**
   * 查询当前页面所需列表数据
   * @param {number} pageNum
   * @param {number} pageSize
   */
  onGetListData (param = {}) {
    let params = _.assign({}, this.searchCondition, param);
    this.setState({ loading: true });
    http
      .get(`${BSS_ADMIN_URL}/api/old/product/groups/name`, {
        params: tools.clearEmpty(params),
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

  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: "产品组名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "操作",
        key: "control",
        width: 750,
        fixed: "right",
        render: (text, record) => {
          const controls = [];
          const u = this.props.root.userinfo || {};
          const r = this.props.root.roles || {};
          const p = this.props.root.powers;
          controls.push(
            <Server record={record} type="see">
              <Button
                key="0"
                size="small"
                className="actions-btn"
                style={{marginRight: '8px'}}
              >
            查看服务器
              </Button>
            </Server>
          );
          // p.includes('user:up') &&
          controls.push(
            <Server record={record} type="relet">
              <Button
                key="1"
                size="small"
                className="actions-btn"
                style={{marginRight: '8px'}}

              >
             关联服务器
              </Button>
            </Server>
          );
          controls.push(
            <Ram record={record} type="see">
              <Button
                key="2"
                size="small"
                className="actions-btn"
                style={{marginRight: '8px'}}

              >
            查看内存
              </Button>
            </Ram>
          );
          // p.includes('user:up') &&
          controls.push(
            <Ram record={record} type="relet">
              <Button
                key="3"
                size="small"
                className="actions-btn"
                style={{marginRight: '8px'}}

              >
             关联内存
              </Button>
            </Ram>
          );
          controls.push(
            <Disk record={record} type="see">
              <Button
                key="4"
                size="small"
                className="actions-btn"
                style={{marginRight: '8px'}}

              >
            查看硬盘
              </Button>
            </Disk>
          );
          // p.includes('user:up') &&
          controls.push(
            <Disk record={record} type="relet">
              <Button
                key="5"
                size="small"
                className="actions-btn"
                style={{marginRight: '8px'}}

              >
             关联硬盘
              </Button>
            </Disk>
          );
          controls.push(
            <Cpu record={record} type="see">
              <Button
                key="6"
                size="small"
                className="actions-btn"
                style={{marginRight: '8px'}}

              >
            查看CPU
              </Button>
            </Cpu>
          );
          // p.includes('user:up') &&
          controls.push(
            <Cpu record={record} type="relet">
              <Button
                key="7"
                size="small"
                className="actions-btn"
                style={{marginRight: '8px'}}

              >
             关联CPU
              </Button>
            </Cpu>
          );
          return controls;
        },
      },
    ];
    return columns;
  }

  /**
   * 搜索
   * @param {obj} values 搜索条件
   */
  onSearch (values) {
    this.searchCondition = values;
    this.onGetListData(values);
  }

  /**
   * 重置搜索条件
   */
  onReset = () => {
    this.searchFormRef.current.resetFields();
  };

  // 表单页码改变
  onPageChange (page, pageSize) {
    this.onGetListData({ page: page, pageSize: pageSize });
  }
  // 表单页码长度改变
  onPageSizeChange (page, pageSize) {
    this.onGetListData({ page: page, pageSize: pageSize });
  }
  render () {
    const p = this.props.root.powers;
    const {
      loading,
      lists,
      pageNum,
      page_size,
      modalShow,
      total,
    } = this.state;
    return (
      <main className="mian">
        {/* 搜索 */}
        <div className="c-search">
          <Form
            ref={this.searchFormRef}
            name="horizontal_login"
            layout="inline"
            // initialValues={this.searchCondition}
            onFinish={(values) => {
              this.onSearch(values);
            }}
          >
            {/*
            <Form.Item name="cpuName">
              <Input placeholder="请输入CPU型号名称" allowClear />
            </Form.Item>*/}
            <Form.Item name="name">
              <Input placeholder="请输入产品组名称" allowClear />
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
          </Form>
        </div>
        <div className="g-table">
          <Table
            columns={this.makeColumns()}
            rowKey={(record) => record.id}
            loading={loading}
            dataSource={lists}
            pagination={false}
            size="small"
          />
        </div>
        <div className="pagination">
          <Pagination
            className="g-pagination"
            size="middle"
            current={pageNum}
            total={total}
            showSizeChanger
            showQuickJumper
            defaultPageSize={page_size}
            showTotal={(total) => `一共${total}条数据`}
            onChange={(current, pageSize) => {
              this.onPageChange(current, pageSize);
            }}
            onShowSizeChange={(current, size) => {
              this.onPageSizeChange(current, size);
            }}
          />
        </div>

      </main>
    );
  }
}
