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
  Tag
} from "antd";
import {
  EyeOutlined,
  UsergroupAddOutlined,
  FormOutlined,
  DeleteOutlined,
  UnlockOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { inject, observer } from "mobx-react";
import tools from "@src/util/tools"; // 工具
import {User} from "@src/util/user";
import qs from "qs";
import _ from "lodash";
import http from "@src/util/http";
// ==================
// 所需的所有组件
// ==================

import Add from "./container/add";
import OrganizationTree from "@src/pages/System/container/OrganizationTree";
import PowerTree from "@src/pages/System/container/PowerTree";
import DefPowerTree from "@src/pages/System/container/defPower";
// import Transfer from  './container/transform'
import { orgTreeDefault } from "@src/config/commvar";
import './index.less';
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
const { Option } = Select;
const FormItem = Form.Item;
function setParams ({ query = "" }) {
  const searchParams = new URLSearchParams();
  searchParams.set("query", query);
  return searchParams.toString();
}
@inject("root")
@inject("authManage")
@inject("pageUserstore")
@observer
export default class RoleAdminContainer extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    userinfo: P.any,
    powers: P.array,
    // form: P.any
  };
  constructor (props) {
    super(props);
    this.searchFormRef = React.createRef();
    (this.searchCondition = {}), // 顶部搜索条件
    (this.state = {
      lists: [], // 当前页面列表数据
      roleData: [], // 所有的角色数据
      // record:{},
      operateType: "add", // 操作类型 add新增，up修改, see查看
      loading: false, // 表格数据是否正在加载中
      modalShow: false, // 添加/修改/查看 模态框是否显示
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      nowData: {}, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      selectedOrgId: null, // 当前选中机构树id
      powerTreeDefault: [],
      orgTreeDefault: orgTreeDefault.key, // 机构树选中项的key
      roleTreeShow: false, // 角色树是否显示
      roleTreeDefault: [], // 用于菜单树，默认需要选中的项
      pageNum: 1, // 当前第几页
      pageSize: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      treeLoading: false, // 控制树的loading状态，因为要先加载当前role的菜单，才能显示树
      treeOnOkLoading: false, // 是否正在分配菜单
      powerList: [],
      userLists: [],
      treenode: [],
      defPowerTreeShow: false,
      type2: "role",
      userListsDefault: [], // 角色关联用户的初始值
      users: [],
      permissionsName: [],
      userIds: [],
      detailShow: false, // 详情
      rolename: '',
      powerVersion: 0, // 初始修改权限版本
      userVersion: 0, // 初始关联用户的版本
      depts: '',
    });
  }
  componentDidMount () {
    this.onGetListData(this.state.pageNum, this.state.pageSize);
    this.getOrgData();
  }

  // 更新url触发
  updateURL = () => {
    const url = setParams({ query: this.state.inputValue });
    this.props.history.push(`?${url}`);
  };
  getOrgData (param = {}) {
    let params = _.assign({}, { otherDept: 0 });
    this.props.authManage
      .getDeptLists(params)
      .then((res) => {
        if (res.code == 20000) {
          this.setState({ treenode: tools.formatTree(res.data) });
        }
        this.setState({
          loading: false,
        });
      })
      .catch((res) => {
        this.setState({
          loading: false,
        });
      });
  }

  /**
   *修改当前机构
   * @param {string} key 机构id
   * @param {treenode} node
   */
  getRolebyOrg (key) {
    this.key = key;
    this.setState({ orgTreeDefault: key, page: 1, searchParam: {} });
    this.onGetListData({ page: 1, deptId: key });
  }

  /**
   * 查询当前页面所需列表数据
   * @param {number} pageNum
   * @param {number} pageSize
   */
  onGetListData (param = {}) {
    let params = _.assign({}, this.searchCondition, param);
    this.setState({ loading: true });
    this.props.authManage
      .getRoles(tools.clearEmpty(params))
      .then((res) => {
        if (res.code === 20000) {
          this.setState({
            lists: res.data.records,
            total: res.data.total,
            pageNum: res.data.current,
          });
        } else {
          message.error(res.message);
        }
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }
  // 获取用户列表
  onGetUerLists (param = {}) {
    const params = _.assign({}, param);
    this.props.authManage
      .getUserList(tools.clearNull(params))
      .then((res) => {
        if (res.code === 20000) {
          this.setState({
            userLists: res.data.records,
          });
        } else {
          message.error(res.message);
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
        title: "序号",
        dataIndex: "id",
        key: "id",
        render: (text, record, index) => index + 1,
      },
      {
        title: "角色名称",
        dataIndex: "rolename",
        key: "rolename",
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 240,
        render: (text, record) => {
          const controls = [];
          const u = User.getPermission() || [];
          u.includes('role-view') &&
          controls.push(
            <span
              key="0"
              className="control-btn green"
              onClick={() => this.onDetailShow(record)}
            >
              <Tooltip placement="top" title="查看">
                <EyeOutlined style={{ color: "#1890ff" }}></EyeOutlined>
              </Tooltip>
            </span>
          );
          u.includes('role-edit') &&
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
          u.includes('role-edit') &&
          controls.push(
            <DefPowerTree record={record}>
              <span
                key="2"
                className="control-btn blue"
              >
                <Tooltip placement="top" title="分配权限">
                  <UnlockOutlined />
                </Tooltip>
              </span>
            </DefPowerTree>
          );
          u.includes('role-edit') &&
          controls.push(
            <PowerTree record={record}>
              <span
                key="3"
                className="control-btn blue"
              >
                <Tooltip placement="top" title="关联员工">
                  <UsergroupAddOutlined  />
                </Tooltip>
              </span>
            </PowerTree>
          );
          u.includes('role-delete') &&
          controls.push(
            <Popconfirm
              key="4"
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
    this.searchCondition = {};
  };

  // 表单页码改变
  onPageChange (page, pageSize) {
    this.onGetListData({
      deptId: this.state.orgTreeDefault,
      page: page,
      pageSize: pageSize,
    });
  }

  // 表单页码长度改变
  onPageSizeChange (page, pageSize) {
    this.onGetListData({
      deptId: this.state.orgTreeDefault,
      page: page,
      pageSize: pageSize,
    });
  }

  /**
   * 添加/修改/查看 模态框出现
   * @data: 当前选中的那条数据
   * @type: add添加/up修改/see查看
   * **/
  onModalShow (type, data) {
    if (type === "add") {
      this.getOrgData();
      this.setState({
        operateType: type,
        nowData: {
          deptId: this.key === undefined ? "1" : this.key,
        },
        modalShow: true,
      });
      return;
    }
    this.props.authManage
      .getRoles2(data.id)
      .then((res) => {
        if (res.code === 20000) {
          let deptId = [];
          deptId.push(res.data.deptId);
          this.setState({
            nowData: {
              id: res.data.id,
              rolename: res.data.rolename,
              deptId: res.data.dept.id,
              version: res.data.version
            },
            modalShow: true,
            operateType: type,
          });
        } else {
          message.error(res.data);
        }
      })
      .catch(() => {
        message.error(res.data);
      });

  }

  // 删除某一条数据
  onDel (id) {
    this.setState({ loading: true });
    this.props.authManage
      .delRole(id)
      .then((res) => {
        if (res.code === 20000) {
          this.onGetListData({ deptId: this.state.orgTreeDefault, page: 1 });
          message.success("删除成功");
          this.setState({ loading: false });
        } else {
          message.error(res.data);
          this.setState({ loading: false });
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }
  onTreeShowClick2 (record) {
    this.records = record;
    this.props.authManage
      .getRoles2(record.id)
      .then((res) => {
        if (res.code === 20000) {
          let powerTreeDefault = [];
          res.data.permissions.forEach((item) => {
            powerTreeDefault.push(item.id);
          });
          this.setState({
            powerTreeDefault: powerTreeDefault,
            powerVersion: res.data.version,
            defPowerTreeShow: true,
          });
        } else {
          message.error(res.data);
        }
      })
      .catch(() => {
      });
  }

  // 分配角色树关闭
  onRoleClose () {
    this.setState({
      roleTreeShow: false,
    });
  }
  handleOk2 = (val) => {
    this.setState({
      loading: true,
    });
    let { id, rolename, deptId } = this.records;
    this.props.authManage
      .upRole(id, {
        rolename: rolename,
        deptId: deptId,
        permissionIds: val,
        version: this.state.powerVersion,
      })
      .then((res) => {
        this.setState({
          loading: true,
        });
        if (res.code === 20000) {
          this.onGetListData({ deptId: this.state.orgTreeDefault, page: 1 });
          this.handleCancel2();
          message.success("分配权限成功");
        } else {
          message.error(res.data);
          this.setState({
            defPowerTreeShow: false,
            loading: false,
          });
        }
      })
      .catch(() => {
        this.setState({
          defPowerTreeShow: false,
          loading: false,
        });
      });
  };
  handleCancel2 = () => {
    this.setState({
      defPowerTreeShow: false,
      powerTreeDefault: [],
    });
  };
  onModalOk = (val) => {
    this.setState({
      loading: true,
    });
    http
      .post(`${BSS_ADMIN_URL}/api/user/role/add`, val)
      .then((res) => {
        this.setState({
          loading: false,
        });
        res = res.data;
        if (res.code === 20000) {
          this.onClose();
          this.onGetListData({ deptId: this.state.orgTreeDefault, page: 1 });
          message.success("添加成功");
        } else {
          message.error(res.data);
        }
      })
      .catch(() => {
        this.setState({
          modalLoading: false,
        });
      });
  };
  edit = (id, val) => {
    this.setState({
      loading: true,
    });
    this.props.authManage
      .upRole(id, val)
      .then((res) => {
        this.setState({
          loading: false,
        });
        if (res.code === 20000) {
          this.onClose();
          this.onGetListData({ deptId: this.state.orgTreeDefault, page: 1 });
          message.success("修改成功");
        } else {
          message.error(res.data);
        }
      })
      .catch(() => {
        this.setState({
          modalLoading: false,
        });
      });
  };
  onClose = () => {
    this.setState({
      modalShow: false
    });
  };
  onModalClose = () => {
    this.setState({
      modalShow: false
    });
  };
  onDetailShow=(record) => {
    this.setState({
      detailShow: true
    });
    let permissionsName = [];
    let userIds = [];
    this.props.authManage
      .getRoles2(record.id)
      .then((res) => {
        if (res.code === 20000) {
          res.data.permissions.forEach((item) => {
            permissionsName.push(item.permissionsName);
          });
          res.data.users.forEach((item) => {
            userIds.push(item.name);
          });
          this.setState({
            permissionsName: permissionsName,
            userIds: userIds,
            rolename: record && record.rolename,
            depts: res.data.dept.name
          });
        } else {
          message.error(res.data);
        }
      })
      .catch(() => {
        this.setState({
          detailShow: false
        });
        message.error(res.data);
      });
  }
  detailHandleOk=() => {
    this.setState({
      detailShow: false
    });
  }
  detailHandleCancel=() => {
    this.setState({
      detailShow: false
    });
  }
  render () {
    const p = this.props.root.powers;
    const {
      loading,
      operateType,
      lists,
      pageNum,
      pageSize,
      modalShow,
      nowData,
      selectedOrgId,
      roleData,
      roleTreeShow,
      roleTreeDefault,
      roleTreeLoading,
      powerTreeShow,
      powerData,
      powerTreeDefault,
      treeLoading,
      powerList,
      userLists,
      total,
      treenode,
      defPowerTreeShow,
      users,
      permissionsName,
      userIds,
      rolename,
      powerVersion,
      depts,
    } = this.state;
    const records = this.records;

    return (
      <main className="mian">
        {/* 机构树 */}
        <div className="left-contain">
          <OrganizationTree
            nowDataKey={selectedOrgId}
            type2={this.state.type2}
            onQuery={(key, node) => {
              this.getRolebyOrg(key, node);
            }}
          />
        </div>
        {/* 员工列表 */}
        <div className="right-contain">
          <div className="clearfix">
            {/* 搜索 */}
            <div className="c-search" style={{ float: "left" }}>
              <Form
                ref={this.searchFormRef}
                name="horizontal_login"
                layout="inline"
                onFinish={(values) => {
                  this.onSearch(values);
                }}
              >
                <Form.Item
                  name="roleName"
                  rules={[
                    { whiteSpace: true, message: "不能输入空格" },
                    { pattern: regExpConfig.isNormalEncode, message: "不能输入特殊字符" },
                  ]}
                >
                  <Input
                    placeholder="角色名称"
                    allowClear
                  />
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
            <div className="c-operate" style={{ float: "right" }}>
              {User.hasPermission('role-add') && <Button
                size="middle"
                onClick={() => {
                  this.onModalShow("add", {});
                }}
                style={{ color: "#1890ff", borderColor: "#1890ff" }}
                icon={<PlusOutlined />}
              >
              增加角色
              </Button>}
            </div>
          </div>
          {/* 数据展示*/}
          <div className="g-table" >
            <Table
              columns={this.makeColumns()}
              rowKey={(record) => record.id}
              loading={loading}
              dataSource={lists}
              pagination={false}
              scroll={{y: 800}}
            />
            <div className="pagination">
              <Pagination
                className="g-pagination"
                current={pageNum}
                showSizeChanger
                showQuickJumper
                total={total}
                defaultPageSize={this.state.pageSize}
                onChange={(current, pageSize) => {
                  this.onPageChange(current, pageSize);
                }}
                onShowSizeChange={(current, size) => {
                  this.onPageSizeChange(current, size);
                }}
                showTotal={(total) => `一共${total}条数据`}
              />
            </div>
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
            treenode={treenode}
            total={total}
          />
          <Modal
            title="角色信息"
            visible={this.state.detailShow}
            onCancel={this.detailHandleCancel}
            width="60%"
            destroyOnClose
            footer={null}
          >
            <p className="p" ><strong>角色名称:</strong><Tag color="#f50" >{rolename}</Tag></p>
            <p className="p" ><strong>所属机构:</strong><Tag color="#2db7f5" >{depts}</Tag></p>
            <p className="p" ><strong>角色权限:</strong>{permissionsName && permissionsName.map((item) =>
              <Tag color="#87d068" key={item}>{item}</Tag>
            )}</p>
            <p className="p" ><strong>关联员工:</strong>{
              userIds && userIds.map((item) => <Tag color="#108ee9" key={item}>{item}</Tag>)
            }</p>
          </Modal>
        </div>
      </main>
    );
  }
}
