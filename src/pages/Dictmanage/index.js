/* eslint-disable react/prop-types */
/** User 系统管理/角色管理 **/

// ==================
// 所需的各种插件
// ==================

import React from "react";
import P, { string } from "prop-types";
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
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { inject, observer } from "mobx-react";
import tools from "@src/util/tools"; // 工具
import qs from "qs";
import _ from "lodash";
import http from "@src/util/http";
// ==================
// 所需的所有组件
// ==================

import Add from "./container/add";
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
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
      // memType:,
      operateType: "add", // 操作类型 add新增，up修改, see查看
      loading: false, // 表格数据是否正在加载中
      modalShow: false, // 添加/修改/查看 模态框是否显示
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      nowData: {}, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      pageNum: 1, // 当前第几页
      page_size: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      pages: 0,
      selectedRowKeys: [], //
      version: 0, // 初始版本号
      dictLists: [], // 字典类型
    });
  }
  componentDidMount () {
    this.onGetListData(this.state.pageNum, this.state.page_size);
    this.onGetDictList();
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

  /**
   * 查询当前页面所需列表数据
   * @param {number} pageNum
   * @param {number} pageSize
   */
  onGetListData (param = {}) {
    let params = _.assign(
      {},
      this.searchCondition,
      param
    );
    this.setState({ loading: true });
    http
      .get(`${BSS_ADMIN_URL}/api/user/userdict/list`, {
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
  // 获取字典类型列表
  onGetDictList () {
    http
      .get(`${BSS_ADMIN_URL}/api/user/userdict/keytype/distinct`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            dictLists: res.data
          });
        } else {
          tools.dealFail(res);
        }

      })
      .catch(() => {

      });
  }
  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: "名称",
        dataIndex: "keyNames",
        key: "keyNames",
      },
      {
        title: "描述",
        dataIndex: "keyDesc",
        key: "keyDesc",
      },
      {
        title: "备注",
        dataIndex: "remark",
        key: "remark",
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 100,
        render: (text, record) => {
          const controls = [];
          controls.push(
            <span
              key="0"
              className="control-btn green"
              onClick={() => this.onModalShow("see", record)}
            >
              <Tooltip placement="top" title="查看">
                <EyeOutlined></EyeOutlined>
              </Tooltip>
            </span>
          );
          controls.push(
            <span
              key="1"
              className="control-btn blue"
              onClick={() => this.onModalShow("up", record)}
            >
              <Tooltip placement="top" title="修改">
                <FormOutlined></FormOutlined>
              </Tooltip>
            </span>
          );

          controls.push(
            <Popconfirm
              key="2"
              title="确定删除吗?"
              onConfirm={() => this.onDel(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <span className="control-btn red">
                <Tooltip placement="top" title="删除">
                  <DeleteOutlined></DeleteOutlined>
                </Tooltip>
              </span>
            </Popconfirm>
          );

          const result = [];
          controls.forEach((item, index) => {
            if (index) {
              result.push(<Divider key={`line${index}`} type="vertical" />);
            }
            result.push(item);
          });
          return result;
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

  /**
   * 添加/修改/查看 模态框出现
   * @data: 当前选中的那条数据
   * @type: add添加/up修改/see查看
   * **/
  onModalShow (type, data) {
    this.props.pageUserstore.changeShowmodal("on");
    this.setState({
      modalShow: true,
      nowData: {
        id: data.id || "",
        keyDesc: data.keyDesc || "",
        keyNames: data.keyNames || "",
        remark: data.remark || '',
      },
      operateType: type,
    });
  }

  // 删除某一条数据
  onDel (id) {
    this.setState({ loading: true });
    let arr = [];
    if (typeof id === 'string') {
      arr.push(id);
    } else {
      arr = id;
    }
    http
      .delete(`${BSS_ADMIN_URL}/api/user/userdict/alldel`, {data: arr})
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.onGetListData({ page: 1 });
          tools.auto_close_result('ok', '操作成功');
        } else {
          tools.dealFail(res);
          this.setState({ loading: false });
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  onModalOk = (val) => {
    http
      .post(`${BSS_ADMIN_URL}/api/user/userdict/add`, val)
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.onClose();
          this.onGetListData({ page: 1 });
          tools.auto_close_result('ok', '操作成功');
        } else {
          tools.dealFail(res);
        }
      })
      .catch(() => {
        this.setState({
          modalLoading: false,
        });
      });
  };
  edit = (id, val) => {
    http
      .put(`${BSS_ADMIN_URL}/api/user/userdict/${id}/update`, val)
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.onClose();
          this.onGetListData({ page: 1 });
          tools.auto_close_result('ok', '操作成功');
        } else {
          tools.dealFail(res);
        }
      })
      .catch(() => {
        this.setState({
          modalLoading: false,
        });
      });
  };
  onClose = () => {
    this.props.pageUserstore.changeShowmodal("off");
  };
  onModalClose = () => {
    this.props.pageUserstore.changeShowmodal("off");
  };
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  };
  showTotal = (total) => `一共${total}条数据`;
  showDeleteConfirm = () => {
    let selectedRowKeys = this.state.selectedRowKeys;
    let _that = this;
    let len = selectedRowKeys.length;
    if (len < 1) {
      Modal.warning({
        title: "提示",
        content: "请选择至少一条数据！",
        destroyOnClose: true,
      });
      return false;
    }
    confirm({
      title: "你确定要删除吗？",
      icon: <ExclamationCircleOutlined />,
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk () {
        _that.onDel(selectedRowKeys);
        _that.setState({
          selectedRowKeys: [],
        });
      },
      onCancel () {
      },
    });
  };

  render () {
    const p = this.props.root.powers;
    const {
      loading,
      operateType,
      lists,
      pageNum,
      page_size,
      modalShow,
      nowData,
      total,
      selectedRowKeys,
      pages,
      dictLists,
    } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    return (
      <main className="mian">
        {/* 搜索 */}
        <div className="c-search">
          <Form
            ref={this.searchFormRef}
            name="horizontal_login"
            layout="inline"
            onFinish={(values) => {
              this.onSearch(values);
            }}
          >
            <Form.Item name="keyNames"
            >
              <Input placeholder="请输入名称" allowClear />
            </Form.Item>
            <Form.Item name="keyDesc">
              <Select
                allowClear
                placeholder="请选择字典描述"
                style={{width: '240px'}}
              >
                {dictLists.map((item) => (
                  <Option value={item} key={item}>
                    {item}
                  </Option>
                ))}
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
        {/* 操作 */}
        <div className="c-operate">
          <Button
            size="middle"

            onClick={() => {
              this.onModalShow("add", {});
            }}
            className="actions-btn"
          >
            添加
          </Button>
          <Button size="middle" onClick={this.showDeleteConfirm}  className="actions-btn">
            批量删除
          </Button>
        </div>
        {/* 数据展示 */}
        <div className="g-table" >
          <Table
            columns={this.makeColumns()}
            rowKey={(record) => record.id}
            loading={loading}
            dataSource={lists}
            pagination={false}
            rowSelection={rowSelection}
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
            showTotal={this.showTotal}
            defaultPageSize={page_size}
            onChange={(current, pageSize) => {
              this.onPageChange(current, pageSize);
            }}
            onShowSizeChange={(current, size) => {
              this.onPageSizeChange(current, size);
            }}
          />
        </div>

        {/* 新增&修改&查看 模态框 */}
        <Add
          operateType={operateType}
          nowData={nowData}
          visible={modalShow}
          onOk={this.onModalOk}
          edit={this.edit}
          onClose={this.onModalClose}
          lists={lists}
          dictLists={dictLists}
        />
      </main>
    );
  }
}
