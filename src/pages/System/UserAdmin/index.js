/* eslint-disable no-dupe-keys */
/* eslint-disable react/prop-types */
/** User 系统管理/用户管理 **/

// ==================
// 所需的各种插件
// ==================

import React from "react";
import P from "prop-types";
import {
  Form,
  Button,
  Input,
  Table,
  message,
  Popconfirm,
  Pagination,
  Tooltip,
  Divider,
  Select,
  Switch,
  Tag,
} from "antd";
import {
  EyeOutlined,
  FormOutlined,
  DeleteOutlined,
  PlusOutlined,
  UserOutlined,
  SettingTwoTone,
  PushpinTwoTone
} from "@ant-design/icons";
import { inject, observer } from "mobx-react";
import tools from "@src/util/tools"; // 工具
import { orgTreeDefault } from "@src/config/commvar"; // 全局变量
// ==================
// 所需的所有组件
// ==================
import {User} from "@src/util/user";
import RoleTree from "@src/pages/System/container/RoleTree";
import Add from "./container/add";
import OrganizationTree from "@src/pages/System/container/OrganizationTree";
import DefDeptTree from "@src/pages/System/container/defDept";
import http from "@src/util/http";
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
const { Option } = Select;
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
  };

  constructor (props) {
    super(props);
    this.searchFormRef = React.createRef();
    this.searchCondition = {};
    this.state = {
      lists: [], // 当前页面全部数据
      roleData: [], // 所有的角色数据
      operateType: "add", // 操作类型 add新增，up修改, see查看
      loading: false, // 表格数据是否正在加载中
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      modalShow: false, // 添加/修改/查看 模态框是否显示
      nowData: {}, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      selectedOrgId: null, // 当前选中机构
      roleTreeShow: false, // 角色树是否显示
      roleTreeDefault: [], // 默认的角色
      orgTreeDefault: orgTreeDefault.key, // 机构树选中项的key
      page: 1, // 当前第几页
      pageSize: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      treeLoading: false, // 控制树的loading状态，因为要先加载当前role的菜单，才能显示树
      treeOnOkLoading: false, // 是否正在分配菜单
      defDeptShow: false,
      treenode: [], //
      defDeptDefault: [], // 默认选择的机构,
      type: "user",
      roleVersion: 0, // 默认初始角色值版本
      head: {},
    };
  }
  componentDidMount () {
    this.onGetListData({ deptId: 1 });
    this.onGetRoleTreeData();
    this.getOrgData();
    this.getHead();
  }

  // 获取所有的角色数据 - 用于分配角色控件的原始数据
  onGetRoleTreeData () {
    this.props.authManage.getRoles({pageSize: 200}).then((res) => {
      if (res.code === 20000) {
        this.setState({
          roleData: res.data.records,
        });
      }
    });
  }

  // 查询当前页面所需列表数据
  onGetListData (param = {}) {
    const params = _.assign({}, this.searchCondition, param);
    this.setState({ loading: true });
    this.props.authManage
      .getUserList(tools.clearEmpty(params))
      .then((res) => {
        if (res.code === 20000) {
          this.setState({
            lists: res.data.records,
            total: res.data.total,
            page: res.data.current,
            pageSize: res.data.size,
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

  /**
   * 搜索
   * @param {obj} values 搜索条件
   */
  onSearch (values) {
    this.searchCondition = values;
    this.onGetListData({ deptId: this.state.orgTreeDefault, page: 1 });
  }

  /**
   * 重置搜索条件
   */
  onReset = () => {
    this.searchFormRef.current.resetFields();
  };

  // 表单页码改变
  onPageChange = (page, pageSize) => {
    this.onGetListData({
      deptId: this.state.orgTreeDefault,
      page: page,
      pageSize: pageSize,
    });
  };

  // 表单页码长度改变
  onPageSizeChange = (page, pageSize) => {
    this.onGetListData({
      deptId: this.state.orgTreeDefault,
      page: page,
      pageSize: pageSize,
    });
  };

  // getRolebyOrg
  getRolebyOrg (key) {
    this.key = [];
    this.key.push(key);
    this.setState({ orgTreeDefault: key, page: 1, searchParam: {} });
    this.onGetListData({ page: 1, deptId: key });
    this.getHead()
  }
  getHead = () =>{
    let deptId = '';
    this.key === undefined ? deptId = '1': deptId = this.key[0];
    http
      .get(`${BSS_ADMIN_URL}/api/user/dept/managerbydept?dept_id=${deptId}`)
      .then((res) => {
        if (res.data.code === 20000) {
          this.setState({
            head: res.data.data,
          });
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
   * 添加/修改/查看 模态框出现
   * @item: 当前选中的那条数据
   * @type: add添加/up修改/see查看
   * **/
  onModalShow (type, data) {
    if (type === "add") {
      this.getOrgData();
      this.setState({
        operateType: type,
        nowData: {
          depts: this.key === undefined ? ["1"] : this.key,
        },
        modalShow: true,
      });
      return;
    }
    this.props.authManage
      .getUser(data.id)
      .then((res) => {
        if (res.code === 20000) {
          let depts = [];
          let roles = [];
          res.data.depts.forEach((item) => {
            depts.push(item.id);
          });
          res.data.roles.forEach((item) => {
            roles.push(item.id);
          });
          this.setState({
            nowData: {
              id: res.data.id,
              depts: depts,
              version: res.data.version,
              roles: roles,
              name: res.data.name,
              mobile: res.data.mobile,
              email: res.data.email,
              workNumber: res.data.workNumber,
              loginName: res.data.loginName,
              status: res.data.status,
              roles: roles,
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
      .delUser(id)
      .then((res) => {
        if (res.code === 20000) {
          this.onGetListData({ deptId: this.state.orgTreeDefault, page: 1 });
          this.setState({
            loading: false,
          });
          message.success("删除成功");
        } else {
          message.error(res.data);
          this.setState({ loading: false });
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  getOrgData () {
    this.setState({
      loading: true,
    });
    http
      .get(`${BSS_ADMIN_URL}/api/user/dept`)
      .then((res) => {
        if (res.data.code === 20000) {
          this.setState({ treenode: tools.formatTree(res.data.data) });
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

  /** 分配角色按钮点击,角色控件出现 **/
  onTreeShowClick (record) {
    this.props.authManage
      .getUser(record.id)
      .then((res) => {
        if (res.code === 20000) {
          let roles = [];
          res.data.roles.forEach((item) => {
            roles.push(item.id);
          });
          this.setState({
            nowData: record,
            roleTreeDefault: roles,
            roleVersion: res.data.version,
            roleTreeShow: true,
          });
        } else {
          message.error(res.data);
        }
      })
      .catch(() => {
        message.error(res.data);
      });
  }
  onDefDeptShow (record) {
    this.props.authManage
      .getUser(record.id)
      .then((res) => {
        if (res.code === 20000) {
          let depts = [];
          res.data.depts.forEach((item) => {
            depts.push(item.id);
          });
          this.setState({
            nowData: record,
            defDeptDefault: depts,
            deptVersion: res.data.version,
            defDeptShow: true,
          });
        } else {
          message.error(res.data);
        }
      })
      .catch(() => {
        message.error(res.data);
      });
  }
  // 构建字段
  makeColumns () {
    const u = User.getPermission() || [];
    const columns = [
      {
        title: "用户名",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "账号",
        dataIndex: "loginName",
        key: "loginName",
      },
      {
        title: "手机号",
        dataIndex: "mobile",
        key: "mobile",
      },
      {
        title: "邮箱",
        dataIndex: "email",
        key: "email",
      },
      {
        title: "工号",
        dataIndex: "workNumber",
        key: "workNumber",
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        render: (text, record) =>
          text === 1 ? (
            <Switch
              defaultChecked
              onChange={() => this.changeStatus(text, record)}
              disabled={!u.includes('user-edit')}
            />
          ) : (
            <Switch
              onChange={() => this.changeStatus(text, record)}
              disabled={!u.includes('user-edit')}
            />
          ),
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 240,
        render: (text, record) => {
          let {head,lists} = this.state;
          //console.log(lists);
          const controls = [];
          u.includes('user-view') &&
          controls.push(
            <span
              key="0"
              className="control-btn green"
              onClick={() => this.onModalShow("see", record)}
            >
              <Tooltip placement="top" title="查看">
                <EyeOutlined style={{ color: "#1890ff" }}></EyeOutlined>
              </Tooltip>
            </span>
          );
          u.includes('user-edit') &&
          controls.push(
            <span
              key="1"
              className="control-btn blue"
              onClick={() => this.onModalShow("up", record)}
            >
              <Tooltip placement="top" title="修改">
                <FormOutlined style={{ color: "#1890ff" }}></FormOutlined>
              </Tooltip>
            </span>
          );
          u.includes('user-edit') &&
          controls.push(
            <span
              key="2"
              className="control-btn blue"
              onClick={() => this.onTreeShowClick(record)}
            >
              <Tooltip placement="top" title="分配角色">
                <UserOutlined style={{ color: "#1890ff" }} />
              </Tooltip>
            </span>
          );
          u.includes('user-edit') &&
          controls.push(
            <Popconfirm
              key="3"
              title={`确定要设置 ${record.name} 为主管吗?`}
              onConfirm={() => this.set(record)}
              okText="确定"
              cancelText="取消"
            >
              <span className="control-btn red">
                <Tooltip placement="top" title="设置主管">
                 <SettingTwoTone></SettingTwoTone>
                </Tooltip>
              </span>
            </Popconfirm>
          );
          u.includes('user-edit') &&
          controls.push(
            <Popconfirm
              key="4"
              title={`确定要取消 ${record.name} 为主管吗?`}
              onConfirm={() => this.Noset(record)}
              okText="确定"
              cancelText="取消"
            >
              <span className="control-btn red">
                <Tooltip placement="top" title="取消主管">
                 <PushpinTwoTone></PushpinTwoTone>
                </Tooltip>
              </span>
            </Popconfirm>
          );
          u.includes('user-delete') &&
          controls.push(
            <Popconfirm
              key="5"
              title="确定删除吗?"
              onConfirm={() => this.onDel(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <span className="control-btn red">
                <Tooltip placement="top" title="删除">
                  <DeleteOutlined style={{ color: "red" }}></DeleteOutlined>
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
  set = (record) => {
    let userId = record.id;
    let deptId = '';
    this.key === undefined ? deptId = '1': deptId = this.key[0];
    let obj = {};
    obj.userId = userId;
    obj.deptId = deptId;
    obj.hasHead = 1;
    http
      .put(`${BSS_ADMIN_URL}/api/user/manage/dept/head`, tools.clearEmpty(obj))
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          // this.onGetListData({ deptId: this.state.orgTreeDefault, page: 1 });
          this.getHead();
          message.success("设置成功");
        } else {
          tools.dealFail(res);
        }
      })
      .catch(() => {
      });
  }
  Noset = (record) => {
    let userId = record.id;
    let deptId = '';
    this.key === undefined ? deptId = '1': deptId = this.key[0];
    let obj = {};
    obj.userId = userId;
    obj.deptId = deptId;
    obj.hasHead = 0;
    http
      .put(`${BSS_ADMIN_URL}/api/user/manage/dept/head`, tools.clearEmpty(obj))
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
         //  this.onGetListData({ deptId: this.state.orgTreeDefault, page: 1 });
          this.getHead();
          message.success("取消成功");
        } else {
          tools.dealFail(res);
        }
      })
      .catch(() => {
      });
  }
  changeStatus = (text, record) => {
    let status = record.status;
    text === 0 ? status = 1 : status = 0;
    this.setState({
      loading: true,
    });
    this.props.authManage.setUseStatus(record.id, {
      status: status,
      version: record.version
    }).then((res) => {
      if (res.code === 20000) {
        this.onClose();
        this.onGetListData({ deptId: this.state.orgTreeDefault, page: 1 });
        message.success("修改状态成功");
        this.setState({
          loading: false
        });
      } else {
        message.error(res.data);
        this.setState({
          modalLoading: false,
          loading: false,
        });
      }
      this.setState({
        modalLoading: false,
        loading: false
      });
    })
      .catch(() => {
        this.setState({
          modalLoading: false,
        });
      });
  };
  // 分配角色树关闭
  onRoleClose = () => {
    this.setState({
      roleTreeShow: false,
    });
  };
  upUserLists = () => {
    this.setState({ loading: true });
    http
      .get(`${BSS_ADMIN_URL}/api/user/manage/down`)
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.onGetListData(this.state.page, this.state.pageSize);
          message.success("更新用户列表成功");
        } else {
          message.error("更新用户列表失败");
        }
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };
  onOk = (values) => {
    this.props.authManage
      .addUser(values)
      .then((res) => {
        if (res.code === 20000) {
          this.onClose();
          this.onGetListData({ deptId: this.state.orgTreeDefault, page: 1 });
          message.success("添加成功");
        } else {
          message.error(res.data);
          this.setState({
            modalLoading: false,
          });
        }
        this.setState({
          modalLoading: false,
        });
      })
      .catch(() => {
        this.setState({
          modalLoading: false,
        });
      });
  };
  onOk2 = (values) => {
    let record = this.state.nowData;
    values.version = record.version;
    this.setState({loading: true});
    this.props.authManage
      .upUser(record.id, values)
      .then((res) => {
        this.onClose();
        if (res.code === 20000) {
          this.onGetListData({ deptId: this.state.orgTreeDefault, page: 1 });
          this.setState({loading: false});
          message.success("修改成功");
        } else {
          this.onClose();
          message.error(res.data);
          this.setState({
            modalLoading: false,
          });
        }
      })
      .catch(() => {
        this.setState({
          modalLoading: false,
        });
      });
  };
  onOk3 = (values) => {
    let record = this.state.nowData;
    this.setState({
      loading: true,
    });
    this.props.authManage
      .setUserRoles(record.id, {
        roles: values,
        version: this.state.roleVersion,
      })
      .then((res) => {
        if (res.code === 20000) {
          this.setState({
            roleTreeShow: false,
            loading: false,
          });
          this.onGetListData({ deptId: this.state.orgTreeDefault, page: 1 });
          message.success("分配角色成功");
        } else {
          this.setState({
            roleTreeShow: false,
            loading: false,
          });
          this.onClose();
          message.error(res.data);
        }
        this.setState({
          roleTreeShow: false,
          loading: false,
        });
      })
      .catch(() => {
        this.setState({
          roleTreeShow: false,
          loading: false,
        });
      });
  };
  onClose = () => {
    this.setState({
      modalShow: false,
    });
  };
  edit = (values) => {
    this.onOk2(values);
  };
  handleCancel3 = () => {
    this.setState({
      defDeptShow: false,
      defDeptDefault: [],
    });
  };
  handleOk3 = (values) => {
    let record = this.state.nowData;
    this.props.authManage
      .upUser(record.id, {
        depts: values,
        loginName: record.loginName,
        name: record.name,
        mobile: record.mobile,
        status: record.status,
      })
      .then((res) => {
        if (res.code === 20000) {
          this.setState({
            defDeptShow: false,
          });
          this.onGetListData({ deptId: this.state.orgTreeDefault, page: 1 });
          message.success("修改成功");
        } else {
          message.error(res.data);
          this.setState({
            defDeptShow: false,
          });
          this.setState({
            modalLoading: false,
          });
        }
        this.setState({
          modalLoading: false,
        });
      })
      .catch(() => {
        this.setState({
          modalLoading: false,
        });
      });
  };
  onCancel = () => {
    this.setState({
      modalShow: false,
    });
  };
  render () {
    const p = this.props.root.powers;
    const {
      lists,
      loading,
      page,
      pageSize,
      total,
      roleData,
      defDeptDefault,
      treenode,
      head,
    } = this.state;
    const u1 = User.getPermission() || [];
    return (
      <main className="mian">
        {/* 机构树 */}
        <div className="left-contain">
          <OrganizationTree
            selectedOrgId={this.state.selectedOrgId}
            type2={this.state.type}
            onQuery={(key, node) => {
              this.getRolebyOrg(key, node);
            }}
          />
        </div>
        {/* 员工列表 */}
        <div className="right-contain">
          {/* 搜索 */}
          <div className="clearfix">
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
                  name="name"
                  rules={[
                    { whiteSpace: true, message: "不能输入空格" },
                    { pattern: regExpConfig.isNormalEncode, message: "不能输入特殊字符" },
                  ]}
                >
                  <Input
                    placeholder="姓名"
                    allowClear

                  />
                </Form.Item>
                <Form.Item
                  name="loginName"
                  rules={[
                    { whiteSpace: true, message: "不能输入空格" },
                    { pattern: regExpConfig.isNormalEncode, message: "不能输入特殊字符" },
                  ]}
                >
                  <Input placeholder="登陆账号" allowClear />
                </Form.Item>
                <Form.Item name="status">
                  <Select
                    style={{ width: "160px" }}
                    placeholder="状态"
                    allowClear
                  >
                    <Option value={1}>启用</Option>
                    <Option value={0}>禁用</Option>
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
            <div className="c-operate" style={{ float: "right" }}>
              {u1.includes('user-add') && <Button
                size="middle"
                onClick={() => {
                  this.onModalShow("add", treenode.id);
                }}
                style={{
                  marginRight: "50px",
                  color: "#1890ff",
                  borderColor: "#1890ff",
                }}
                icon={<PlusOutlined />}
              >
              增加员工
              </Button>}
              {u1.includes('user-down') &&  <Button
                size="middle"
                onClick={this.upUserLists}
                style={{ color: "#1890ff", borderColor: "#1890ff" }}
              >
              与钉钉同步
              </Button>}
            </div>
          
          </div>
          <div className="head">
              <p>部门主管：<Tag color="blue">{head.name}</Tag></p>
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
            <Pagination
              className="g-pagination"
              current={page}
              total={total}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `一共${total}条数据`}
              defaultPageSize={pageSize}
              onChange={(current, pageSize) => {
                this.onPageChange(current, pageSize);
              }}
              onShowSizeChange={(current, pagesize) => {
                this.onPageSizeChange(current, pagesize);
              }}
            />
          </div>

          {/* 新增&修改&查看 模态框 */}
          <Add
            nowData={this.state.nowData}
            visible={this.state.modalShow}
            operateType={this.state.operateType}
            roleData={roleData}
            onOk={this.onOk}
            edit={this.edit}
            treenode={treenode}
            onCancel={this.onCancel}
            loading={loading}
          />
          {/* 角色分配 模态框 */}
          <RoleTree
            title={"分配角色"}
            roleData={roleData}
            visible={this.state.roleTreeShow}
            defaultKeys={this.state.roleTreeDefault}
            onOk={this.onOk3}
            onClose={this.onRoleClose}
            loading={loading}
            nowData={this.state.nowData}
          />
          <DefDeptTree
            title={"修改部门"}
            nowData={this.state.nowData}
            visible={this.state.defDeptShow}
            defaultKeys={defDeptDefault}
            onOk={this.handleOk3}
            onClose={this.handleCancel3}
            treenode={treenode}
            loading={loading}
          />
        </div>
      </main>
    );
  }
}
