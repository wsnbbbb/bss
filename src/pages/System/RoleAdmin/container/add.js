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
  Modal,
  TreeSelect,
} from "antd";
import { inject, observer } from "mobx-react";
const FormItem = Form.Item;
const { TreeNode } = TreeSelect;
const { SHOW_PARENT } = TreeSelect;
@inject("root")
@inject("authManage")
@inject("pageUserstore")
@observer
class RoleAdminContainer extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    userinfo: P.any,
    powers: P.array,
    updateLists: P.func,
    // form: P.any
  };
  constructor (props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      fetching: true,
      loading: false,
      treenode: []
    };
  }

  componentDidMount () {
  }

  componentWillReceiveProps (nextprops) {
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.props.onClose();
  };
  onFinish = (value) => {
    if (this.props.operateType === "add") {
      this.props.onOk(value); // 新增
    }
    if (this.props.operateType === "up") {
      let id = this.props.nowData.id;
      value.version = this.props.nowData.version;
      this.props.edit(id, value);
    }
  };
  reset = () => {
    this.formRef.current.resetFields();
  };
  onChange = (value) => {
    this.setState({ value });
  };
  getNodes = (treenode) => treenode.reduce((pre, item) => {
    pre.push(
      <TreeNode value={item.id} title={item.name} key={item.id}>
        {item.children ? this.getNodes(item.children) : null}
      </TreeNode>
    );
    return pre;
  }, []);
  render () {
    const { operateType, nowData, treenode } = this.props;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 },
      },
    };
    return (
      <div>
        <Modal
          title={{ add: "新增", up: "修改", see: "查看" }[operateType]}
          maskClosable={false}
          width="60%"
          destroyOnClose
          visible={this.props.visible}
          onCancel={this.onClose}
          confirmLoading={this.state.modalLoading}
          footer={null}
        >
          <Form
            name="form_in_modal"
            ref={this.formRef}
            initialValues={nowData}
            onFinish={(value) => {
              this.onFinish(value);
            }}
            className="g-modal-field"
          >
            <FormItem
              label="角色名称"
              name="rolename"
              rules={[
                { required: true, whitespace: true, message: "必填" },
                { max: 12, message: "最多输入12位字符" },
              ]}
              {...formItemLayout}
            >
              <Input
                placeholder="请输入角色名"
                disabled={operateType === "see"}
              />
            </FormItem>

            <FormItem
              label="部门"
              name="deptId"
              rules={[
                { required: true, message: "必填" },
              ]}
              {...formItemLayout}
            >
              <TreeSelect
                showSearch
                style={{ width: "100%" }}
                placeholder="请选择部门"
                allowClear
                treeDefaultExpandedKeys={['1']}
              >
                {this.getNodes(treenode)}
              </TreeSelect>
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
              <Button
                onClick={this.onClose}
                className="action-btn ok"
                style={{ margin: "0 auto" }}
              >
                取消
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    );
  }
}
export default RoleAdminContainer;
