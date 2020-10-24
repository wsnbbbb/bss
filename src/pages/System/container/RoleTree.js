/* eslint-disable react/prop-types */
/* Tree选择 - 角色选择 - 多选 */
import React from "react";
import { Modal, Collapse, Select, TreeSelect, Tooltip } from "antd";
import P from "prop-types";
import _ from "lodash";
import "./RoleTree.less";
const { SHOW_PARENT } = TreeSelect;
export default class RoleTreeComponent extends React.PureComponent {
  static propTypes = {
    data: P.array, // 原始数据
    title: P.string, // 标题
    visible: P.bool, // 是否显示
    defaultKeys: P.array, // 当前默认选中的key们
    loading: P.bool, // 确定按钮是否在等待中状态
    onOk: P.func, // 确定
    onClose: P.func, // 关闭
  };

  constructor (props) {
    super(props);
    this.val = [];
    this.state = {
      sourceData: [], // 原始数据，有层级关系
      nowKeys: [], // 当前选中的keys
    };
  }
  componentDidMount () {}

  /** 点击确定时触发 **/
  onOk = () => {
    this.props.onOk(this.val);
  };

  /** 点击关闭时触发 **/
  onClose = () => {
    this.props.onClose();
  };
  onChange = (values) => {
    this.val = values;
  };
  render () {
    const { roleData, nowData } = this.props;
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
      onChange: this.onChange,
      treeCheckable: true,
      showCheckedStrategy: SHOW_PARENT,
      placeholder: "请选择角色",
    };
    return (
      <Modal
        title={this.props.title || "请选择"}
        visible={this.props.visible}
        onOk={this.onOk}
        onCancel={this.onClose}
        destroyOnClose
        width="50%"
        okText="确认"
        cancelText="取消"
      >
        <Tooltip title="用户名称">
          <span style={{ fontSize: "16px" }}>
            {(nowData && nowData.name) || ""}
          </span>
        </Tooltip>
        <br />
        <br />
        <TreeSelect
          {...tProps}
          style={{ width: "100%" }}
          defaultValue={this.props.defaultKeys}
        />
      </Modal>
    );
  }
}
