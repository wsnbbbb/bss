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
import {User} from "../../../util/user";
import qs from "qs";
import _ from "lodash";
import http from "@src/util/http";
import Servermoban from './container/Servermoban';
import {SYS_DICT_SERVERPART, SYS_DICT_SERVER, SYS_DICT_COMMON} from '@src/config/sysDict'; // 系统字典
// ==================
// 所需的所有组件
// ==================
const { Option } = Select;
const FormItem = Form.Item;
const { confirm } = Modal;
const u = User.getPermission() || [];
function setParams ({ query = "" }) {
  const searchParams = new URLSearchParams();
  searchParams.set("query", query);
  return searchParams.toString();
}
@inject("root")
@inject("authManage")
@inject("pageUserstore")
@inject("serverPartDict")
@inject('serverDict')
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
    serverDict: P.any
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
    // this.props.deviceDict.fetchDeviceType();
    // this.props.serverDict.fetchRs();
    // this.props.serverPartDict.fetchShowmode();
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
      .get(`${BSS_ADMIN_URL}/api/old/moban/relation/child/list`, {
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
        title: "父模板名称",
        dataIndex: "parMobanName",
        key: "parMobanName",
      },
      {
        title: "子模板名称",
        dataIndex: "mobanName",
        key: "mobanName",
      },
      {
        title: "设备类型",
        dataIndex: "deviceType",
        key: "deviceType",
        render: (text, record) => SYS_DICT_SERVER.se_unittype[text] || '未知类型'
      },
      {
        title: "服务器网卡数量",
        dataIndex: "netNum",
        key: "netNum",
      },
      {
        title: "发布状态",
        dataIndex: "releaseStatus",
        key: "releaseStatus",
        render: (text, record) => SYS_DICT_SERVER.releaseStatus[text] || 'unknow'
      },
      {
        title: "显示类型",
        dataIndex: "showType",
        key: "showType",
        render: (text, record) => SYS_DICT_SERVER.show_type[text] || 'unknow'
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        render: (text, record) => {
          const controls = [];
          controls.push(
            <Servermoban record={record} type="see">
              <Button
                key="0"
                size="small"
                className="actions-btn"
                // type="primary"
                style={{marginRight: '8px'}}
              >

            查看服务器

              </Button>
            </Servermoban>
          );
          // p.includes('user:up') &&
          controls.push(
            <Servermoban record={record} type="relet">
              <Button
                key="1"
                size="small"
                className="actions-btn"
                // type="primary"
              >

             关联服务器

              </Button>
            </Servermoban>
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
            <Form.Item name="parMobanName">
              <Input placeholder="请输入父模板名称" allowClear />
            </Form.Item>
            <Form.Item name="mobanName">
              <Input placeholder="请输入子模板名称" allowClear />
            </Form.Item>
            <Form.Item name="deviceType">
              <Select placeholder="请选择设备类型" allowClear style={{ width: 240 }}>
                {
                  _.map(SYS_DICT_SERVER.se_unittype, (value, key) =>
                    <Option key={key} value={parseInt(key)}>{value}</Option>
                  )
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
