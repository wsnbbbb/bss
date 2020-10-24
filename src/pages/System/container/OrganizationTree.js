/* eslint-disable react/prop-types */
import React from "react";
import P from "prop-types";
import { inject, observer } from "mobx-react";
import _ from "lodash";
import http from "@src/util/http";
import tools from "@src/util/tools";
import {
  ExclamationCircleOutlined,
  CaretDownOutlined,
  EllipsisOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import {
  Button,
  message,
  Modal,
  Spin,
  Form,
  Input,
  Menu,
  Dropdown,
} from "antd";
import "./orgtree.less";
import { orgTreeDefault, formItemLayout2 } from "@src/config/commvar"; // 全局变量
import {User} from "@src/util/user";
const FormItem = Form.Item;
const { confirm } = Modal;
const u = User.getPermission() || [];
@inject("root")
@inject("authManage")
@observer
class OrganizationTree extends React.Component {
  static propTypes = {
    onQuery: P.func,
    selectedOrgId: P.string, // 当前选中机构id
  };
  constructor (props) {
    super(props);
    this.formRef = React.createRef();
    this.key = [];
    this.nowDataKey = this.props.nowDataKey || orgTreeDefault.id; // 记录当前的选中项 默认为系统配置值
    this.state = {
      loading: false, // 机构信息加载状态
      nowDataKey: this.props.nowDataKey || orgTreeDefault.id,
      showmodal: false, // 查 增 修 状态模显示
      modalLoading: false, // 状态摸加载状态
      operateType: "see", // 机构操作方式 see|add|up|delet
      treenode: [], // 机构信息
      listnode: [], // 机构信息
      nowData: {},
      listnode2: [],
      version: 0, // 初始版本
      expand: [],
    };
  }
  componentDidMount () {
    this.getOrgData();
  }
  // 获取机构数据
  getOrgData () {
    this.setState({
      loading: true,
    });
    if (this.props.type2 === "role") {
      let params = _.assign({}, { otherDept: 0, });
      this.props.authManage
        .getDeptLists(params)
        .then((res) => {
          if (res.code == 20000) {
            this.setState({
              treenode: tools.formatTree(res.data),
              listnode2: res.data,
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
    } else {
      http
        .get(`${BSS_ADMIN_URL}/api/user/dept`)
        .then((res) => {
          if (res.data.code == 20000) {
            this.setState({
              treenode: tools.formatTree(res.data.data),
              listnode: res.data.data,
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
  }
  reset = () => {
    this.formRef.current.resetFields();
  };
  // 机构的增删修操作 @type:add|delet|up
  opt (key, node, type) {
    this.node = node;
    this.key = key;
    this.setState({
      operateType: type,
      showmodal: true,
      nowData: {
        id: node.id || "",
        name: node.name || "",
      },
      version: node && node.version,
    });
  }

  // 删除某一条数据
  onDelOrg (id, type) {
    if (this.props.type2 === "role" || "user") {
      const _that = this;
      confirm({
        title: "你确定要删除这个部门吗?",
        icon: <ExclamationCircleOutlined />,
        okText: "确定",
        okType: "danger",
        cancelText: "取消",
        onOk () {
          _that.setState({ loading: true });
          http
            .delete(`${BSS_ADMIN_URL}/api/user/dept/${id}/delete`)
            .then((res) => {
              if (res.data.code === 20000) {
                _that.onClose();
                message.success("删除成功");
                _that.getOrgData();
                _that.setState({ loading: false });
              } else {
                message.error(res.data.data);
                _that.setState({ loading: false });
              }
            })
            .catch(() => {
              _that.setState({ loading: false });
              message.error(res.data.data);
            });
        },
        onCancel () {
        },
      });
    }
  }

  // 关闭增 查 修状态模
  onClose = () => {
    this.setState({ showmodal: false });
  };

  // 修改选中状态或者展开状态
  /*
   *@e:事件柄
   *@id:当前项的id
   *@node:当前节点信息
   *@type:current|expanded 操作类型，修改选中节点还是修改展开状态
   **/
  handleTreeState (e, id, node, type) {
    event.preventDefault();
    e.stopPropagation();
    // 当前项数据操作
    if (type === "current") {
      // 如果跟上一次点击的节点相同则不做任何操作
      if (this.nowDataKey == id) {
        return false;
      }
      let iscurrent = node.id === id;
      this.nowDataKey = iscurrent ? id : this.nowDataKey;
      this.setState({
        nowDataKey: this.nowDataKey,
      });
      // 执行相应的查询操作
      this.props.onQuery(id, node);
    } else {
      // 控制折叠
      if (this.props.type2 === "role") {
        const lists2 = _.cloneDeep(this.state.listnode2);

        const reslist2 = _.map(lists2, (item) => {
          if (item.id === id) {
            item["isexpanded"] =
              item.isexpanded == undefined ? false : !item.isexpanded;
            return item;
          }
          return item;
        });
        this.setState({
          listnode2: reslist2,
          treenode: tools.formatTree(reslist2),
        });
      } else {
        const lists = _.cloneDeep(this.state.listnode);
        const reslist = _.map(lists, (item) => {
          if (item.id === id) {
            item["isexpanded"] =
              item.isexpanded == undefined ? true : !item.isexpanded;
            return item;
          }
          return item;
        });
        this.setState({
          listnode: reslist,
          treenode: tools.formatTree(reslist),
        });
      }
    }
  }

  // 生成层级树
  // @node：节点信息
  // @index:层级
  makeTreeNode (node, index = 0) {
    let treeitemClass = "tree-node";
    let notleaf = node.children && node.children.length > 0;
    if ((node.isexpanded === undefined && node.parId == '0') || node.isexpanded) {
      treeitemClass += " is-expanded";
    }
    if (this.state.nowDataKey == node.id) {
      treeitemClass += " is-current";
    }
    const menu = (
      <Menu
        style={{ width: "80px", textAlign: "center" }}
      >
        <Menu.Item key={this.props.type2 === 'role' ? '1' : '2'}  onClick={() => {
          this.opt(node.id, node, "see");
        }}>
          <span
          >
            查看
          </span>
        </Menu.Item>
        {u.includes('dept-add') && <Menu.Item key={this.props.type2 === 'role' ? '3' : '4'} onClick={() => {
          this.opt(node.id, node, "add");
        }}>
          <span
          >
            增加
          </span>
        </Menu.Item>}
        {u.includes('dept-edit') && <Menu.Item key={this.props.type2 === 'role' ? '5' : '6'}  onClick={() => {
          this.opt(node.id, node, "up");
        }}>
          <span
          >
            修改
          </span>
        </Menu.Item>}
        {u.includes('dept-delete') &&  <Menu.Item key={this.props.type2 === 'role' ? '7' : '8'}  onClick={() => {
          this.onDelOrg(node.id, "delet");
        }}>
          <span
            style={{textAlign: 'center'}}
          >
            删除
          </span>
        </Menu.Item>}

      </Menu>
    );
    return (
      <div role="treeitem" className={treeitemClass} key={node.id}>
        {/* 树枝内容 */}
        <div
          className="tree-node_content is-focusable"
          style={{ paddingLeft: 16 * index }}
        >
          <div className="node-data">
            <span
              className="node-label"
              onClick={(e) => {
                this.handleTreeState(e, node.id, node, "expanded");
              }}
            >
              {/* 不是子节点且展开 注：根节点默认展开，显示出二级，其他的默认不展开*/}
              {((notleaf && node.isexpanded === true) || (notleaf && node.isexpanded === undefined && node.parId == '0')) && (
                <CaretDownOutlined className="expaned-icon" />
              )}
              {/* 不是子节点且不展开 <PlusSquareOutlined className="expaned-icon" />  <CaretUpOutlined  />*/}
              {((notleaf && node.isexpanded === false) || (notleaf && node.isexpanded === undefined && node.parId != '0')) && (
                <CaretRightOutlined className="expaned-icon" />
              )}
            </span>
            <span id={node.id}
              onClick={(e) => {
                this.handleTreeState(e, node.id, node, "current");
              }}
              className="node-label"
            >
              {node.name}
            </span>
            <div className="node-lable-opt">
              <Dropdown.Button
                disabled={node.id === '-1'}
                overlay={menu}
                style={{top: '13px'}}
                icon={
                  <EllipsisOutlined
                    style={{ color: "#3e82de", fontSize: "18px" }}
                  />
                }
                type="link"
                placement="bottomCenter"
              ></Dropdown.Button>
            </div>
          </div>
        </div>
        {/* 树枝的分支 */}
        {notleaf && (
          <div role="group" className="tree-node_children" key={node.id}>
            {_.map(node.children, (item) => this.makeTreeNode(item, index + 1))}
          </div>
        )}
      </div>
    );
  }

  onFinish = (value) => {
    const { operateType } = this.state;
    if (operateType === "see") {
      // 是查看
      this.onClose();
      return;
    }
    if (operateType === "add") {
      // 新增
      value.parId = this.key;
      this.setState({loading: true});
      http
        .post(`${BSS_ADMIN_URL}/api/user/dept/add`, value)
        .then((res) => {
          if (res.data.code == 20000) {
            this.onClose();
            this.getOrgData();
            message.success("新建机构成功");
            this.setState({
              loading: false,
            });
          } else {
            message.error(res.data.data);
            this.setState({
              loading: false,
            });
          }
        })
        .catch((res) => {
          message.error(res.data.data);
          this.setState({
            loading: false,
          });
        });
    } else {
      let id = this.node.id;
      value.parId = this.node.parId;
      value.version = this.state.version;
      this.setState({ loading: true });
      http
        .put(`${BSS_ADMIN_URL}/api/user/dept/${id}/update`, value)
        .then((res) => {
          if (res.data.code == 20000) {
            this.getOrgData();
            this.onClose();
            message.success("修改机构成功");
            this.setState({
              loading: false,
            });
          } else {
            message.error(res.data.data);
            this.setState({
              loading: false,
            });
          }
        })
        .catch((res) => {
          message.error(res.data.data);
          this.setState({
            loading: false,
          });
        });
    }
  };
  render () {
    const treenode = this.state.treenode;
    const {
      operateType,
      loading,
      showmodal,
      modalLoading,
      nowData,
    } = this.state;
    return (
      <React.Fragment>
        {loading && <Spin></Spin>}
        <div className="org-tree tree--highlight-current" role="tree">
          {_.map(treenode, (item) => this.makeTreeNode(item))}
        </div>

        {/* 增 修改 查 状态模 */}
        <Modal
          title={{ add: "新增部门", up: "修改部门", see: "查看" }[operateType]}
          maskClosable
          width="50%"
          destroyOnClose
          onCancel={() => {
            this.onClose();
          }}
          visible={showmodal}
          confirmLoading={modalLoading}
          footer={null}
        >
          <Form
            name="form_in_modal"
            ref={this.formRef}
            initialValues={operateType === "add" ? null : nowData}
            onFinish={(value) => {
              this.onFinish(value);
            }}
            className="g-modal-field"
          >
            <FormItem
              label="部门名称"
              name="name"
              rules={[
                { required: true, message: "必填" },
                { max: 16, message: '最多输入16位字符' }
              ]}
              {...formItemLayout2}
            >
              <Input
                placeholder="请输入部门名称"
                disabled={operateType === "see"}
              />
            </FormItem>
            <div className="actions-btn">
              <Button
                htmlType="submit"
                className="action-btn ok"
                style={
                  operateType === "see"
                    ? { display: "none" }
                    : { display: "inline-block" }
                }
              >
                提交
              </Button>
              <Button
                htmlType="reset"
                className="action-btn ok"
                onClick={this.reset}
                style={
                  operateType === "see"
                    ? { display: "none" }
                    : { display: "inline-block" }
                }
              >
                重置
              </Button>
              <Button onClick={this.onClose} className="action-btn ok">
                取消
              </Button>
            </div>
          </Form>
        </Modal>
      </React.Fragment>
    );
  }
}
export default OrganizationTree;
