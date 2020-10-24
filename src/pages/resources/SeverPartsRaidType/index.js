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
  FormOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { inject, observer } from "mobx-react";
import "./index.less";
import tools from "@src/util/tools"; // 工具
import qs from "qs";
import _ from "lodash";
import http from "@src/util/http";
// ==================
// 所需的所有组件
// ==================
import {SYS_DICT_SERVERPART} from '@src/config/sysDict'; // 系统字典
import Add from "./container/add";
import {User} from "@src/util/user";

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
    location: P.any,
    history: P.any,
    userinfo: P.any,
    powers: P.array,
    // form: P.any
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
      operateType: "add", // 操作类型 add新增，up修改, see查看
      loading: false, // 表格数据是否正在加载中
      modalShow: false, // 添加/修改/查看 模态框是否显示
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      nowData: {}, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      pageNum: 1, // 当前第几页
      page_size: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      selectedRowKeys: [], //
      version: 0, // 初始版本号
    });
  }
  componentDidMount () {
    this.onGetListData(this.state.pageNum, this.state.page_size);
    this.props.serverPartDict.fetchRaidType();
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
    let params = _.assign({}, this.searchCondition, {}, param);
    this.setState({ loading: true });
    http
      .get(`${BSS_ADMIN_URL}/api/product/raidmodel`, {
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
            selectedRowKeys: [],
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
        title: "名称",
        dataIndex: "raidName",
        key: "raidName",
      },
      {
        title: "品牌",
        dataIndex: "raidBrand",
        key: "raidBrand",
      },
      {
        title: "型号",
        dataIndex: "raidModel",
        key: "raidModel",
      },

      {
        title: "缓存(MB)",
        dataIndex: "raidCache",
        key: "raidCache",
      },
      {
        title: "类型",
        dataIndex: "raidType",
        key: "raidType",
        render: (text, record) => SYS_DICT_SERVERPART.raid_type[text]
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
          const u = User.getPermission() || [];
          u.includes('raidModel-view') &&
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
          u.includes('raidModel-edit') &&
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
          u.includes('raidModel-del') &&
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
        raidName: data.raidName,
        raidBrand: data.raidBrand,
        raidModel: data.raidModel,
        raidCache: data.raidCache,
        raidType: data.raidType,
        productMapId: data.productMapId,
        remark: data.remark,
      },
      operateType: type,
      version: data && data.version
    });
  }

  // 删除某一条数据
  onDel (id) {
    if (typeof id == "string") {
      let ids = [];
      ids.push(id);
      var param = {
        id: ids,
      };
    } else {
      var param = {
        id: id,
      };
    }
    let params = JSON.stringify(param);
    http
      .delete(`${BSS_ADMIN_URL}/api/product/raidmodel/delete`, {
        data: params,
      })
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.onGetListData({ page: 1 });
          message.success("删除成功");
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
      .post(`${BSS_ADMIN_URL}/api/product/raidmodel/add`, tools.clearEmpty(val))
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.onClose();
          this.onGetListData({ page: 1 });
          message.success("添加成功");
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
    val.version = this.state.version;
    http
      .put(`${BSS_ADMIN_URL}/api/product/raidmodel/${id}/update`, tools.clearNull(val))
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.onClose();
          this.onGetListData({ page: 1 });
          message.success("修改成功");
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
      title: "你确定要批量删除吗？",
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
    } = this.state;
    let {raid_type} = SYS_DICT_SERVERPART;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const u1 = User.getPermission() || [];
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
            <Form.Item name="raidModel">
              <Input
                allowClear
                placeholder="请输入Raid卡型号"
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
          </Form>
        </div>
        {/* 操作 */}
        <div className="c-operate">
          {u1.includes('raidModel-add') && <Button
            size="middle"
            onClick={() => {
              this.onModalShow("add", {});
            }}
            className="actions-btn"
          >
            添加
          </Button>}
          {u1.includes('raidModel-del') && <Button size="middle" onClick={this.showDeleteConfirm}  className="actions-btn">
            批量删除
          </Button>}
        </div>
        {/* 数据展示 */}
        <div className="g-table">
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

        {/* 新增&修改&查看 模态框 */}
        <Add
          operateType={operateType}
          nowData={nowData}
          visible={modalShow}
          updateLists={this.onGetListData}
          onOk={this.onModalOk}
          edit={this.edit}
          onClose={this.onModalClose}
          raid_type={raid_type}
        />
      </main>
    );
  }
}
