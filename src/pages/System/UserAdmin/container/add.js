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
  Spin,
  Modal,
  Select,
  TreeSelect,
} from "antd";
import { inject, observer } from "mobx-react";
import { formItemLayout2 } from "@src/config/commvar"; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
const FormItem = Form.Item;
const { Option } = Select;
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
  };
  constructor (props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
    };
  }

  componentDidMount () {}

  // 验证通过
  onFinish (values) {
    const { operateType } = this.props;
    if (operateType === "see") {
      // 是查看
      this.onClose();
      return;
    }
    if (operateType === "add") {
      // 新增
      this.props.onOk(values);
    } else {
      // 修改
      this.props.edit(values);
    }
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.props.onCancel();
  };
  getNodes = (tree) => tree.reduce((pre, item) => {
    pre.push(
      <TreeNode value={item.id} title={item.name} key={item.id} disabled={item.id === '-1'}>
        {item.children ? this.getNodes(item.children) : null}
      </TreeNode>
    );
    return pre;
  }, []);
  reset = () => {
    this.formRef.current.resetFields();
  };
  render () {
    const { operateType, nowData, roleData, treenode } = this.props;
    const { modalLoading } = this.state;
    const treeData = [];
    roleData.forEach((item) => {
      treeData.push({
        title: item.rolename,
        value: item.id,
        key: item.id,
      });
    });
    const tProps = {
      treeData,
      treeCheckable: true,
      showCheckedStrategy: SHOW_PARENT,
      placeholder: "请选择角色",
    };
    return (
      <div>
        <Modal
          title={{ add: "新增", up: "修改", see: "查看" }[operateType]}
          maskClosable={false}
          width="60%"
          destroyOnClose
          footer={null}
          onCancel={this.onClose}
          visible={this.props.visible}
          confirmLoading={modalLoading}
        >
          <Spin tip="Loading..." spinning={modalLoading}>
            <Form
              name="form_in_modal"
              ref={this.formRef}
              className="g-modal-field"
              onFinish={(values) => {
                this.onFinish(values);
              }}
              initialValues={nowData}
            >
              <FormItem
                label="姓名"
                name="name"
                rules={[
                  { required: true, whitespace: true, message: "必填" },
                  { max: 8, message: "最多输入8位字符" },
                  { min: 2, message: "最少输入2位字符"}
                ]}
                {...formItemLayout2}
              >
                <Input
                  placeholder="请输入姓名"
                  disabled={operateType === "see"}
                  allowClear
                />
              </FormItem>
              {operateType != "up" && <FormItem
                label="登陆名"
                name="loginName"
                rules={[
                  { required: true, whitespace: true, message: "必填" },
                  { max: 16, message: "最多输入16位字符" },
                  { min: 6, message: "最少输入6位字符"}
                ]}
                {...formItemLayout2}
              >
                <Input
                  placeholder="请输入登陆账号"
                  disabled={operateType === "see"}
                  allowClear
                />
              </FormItem>}
              {/* 登陆名不可编辑 不传值 */}
              {operateType == "up" && <FormItem
                label={<span className="required">登陆名</span>}
                {...formItemLayout2}
              >
                <Input
                  placeholder="请输入登陆名"
                  disabled
                  value={nowData.loginName}
                  allowClear
                />
              </FormItem>}
              <FormItem
                label="部门"
                name="depts"
                rules={[
                  { required: true, message: "必填" },
                ]}
                {...formItemLayout2}
              >
                <TreeSelect
                  showSearch
                  style={{ width: "100%" }}
                  placeholder="请选择部门"
                  allowClear
                  multiple
                  treeDefaultExpandedKeys={['1']}
                  onChange={this.handleChange}
                  disabled={operateType === "see"}
                >
                  {this.getNodes(treenode)}
                </TreeSelect>
              </FormItem>
              <FormItem
                label="密码"
                name="password"
                rules={
                  operateType === "add"
                    ? [
                      { required: true, whitespace: true, message: "必填" },
                      { min: 6, message: "最少输入6位字符" },
                      { max: 16, message: "最多输入16位字符" },
                    ]
                    : null
                }
                {...formItemLayout2}
              >
                <Input
                  type="password"
                  placeholder={
                    operateType === "add" ? "请输入密码" : "密码不为空,则可选填"
                  }
                  disabled={operateType === "see"}
                  allowClear
                />
              </FormItem>
              <FormItem
                label="手机号"
                name="mobile"
                {...formItemLayout2}
                rules={[
                  { required: true, pattern: regExpConfig.mobile, message: "请输入正确手机号" },
                ]}
              >
                <Input
                  placeholder="请输入手机号"
                  disabled={operateType === "see"}
                  allowClear
                />
              </FormItem>
              <FormItem label="邮箱" name="email" {...formItemLayout2}  rules={[{ pattern: regExpConfig.isEmail, message: "请输入正确邮箱"}]}>
                <Input
                  placeholder="请输入邮箱地址"
                  disabled={operateType === "see"}
                  allowClear
                />
              </FormItem>
              <FormItem
                label="工号"
                name="workNumber"
                rules={[{ max: 10, message: "最多输入10个字符" }]}
                {...formItemLayout2}
              >
                <Input
                  rows={4}
                  disabled={operateType === "see"}
                  placeholder="请输入描述"
                  allowClear
                />
              </FormItem>
              <FormItem label="角色" name="roles" {...formItemLayout2}>
                <TreeSelect {...tProps} disabled={operateType === "see"} />
              </FormItem>
              <FormItem
                label="状态"
                name="status"
                {...formItemLayout2}
                rules={[{ required: true, message: "请选择状态" }]}
                style={operateType === 'up' ? {display: "none"} : {display: "flex"}}
              >
                <Select disabled={operateType === "see"} >
                  <Option key={1} value={1}>
                    启用
                  </Option>
                  <Option key={0} value={0}>
                    禁用
                  </Option>
                </Select>
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
                  style={
                    operateType === "see"
                      ? { display: "none" }
                      : { display: "inline-block" }
                  }
                  onClick={this.reset}
                >
                  重置
                </Button>
                <Button onClick={this.onClose} className="action-btn ok">
                  取消
                </Button>
              </div>
            </Form>
          </Spin>
        </Modal>
      </div>
    );
  }
}
export default RoleAdminContainer;
