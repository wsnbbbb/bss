/* eslint-disable react/prop-types */
/* Tree选择 - 权限选择 - 多选 */
import React from "react";
import {
  Modal,
  Tooltip,
  TreeSelect,
} from "antd";
import P from "prop-types";
import _ from "lodash";
import "./RoleTree.less";
import { inject, observer } from "mobx-react";
const { TreeNode } = TreeSelect;
@inject("authManage")
@observer
export default class defDeptComponent extends React.PureComponent {
  static propTypes = {
    data: P.array, // 原始数据
    title: P.string, // 标题
    visible: P.bool, // 是否显示
    defaultKeys: P.array, // 当前默认选中的key们
    loading: P.bool, // 确定按钮是否在等待中状态
    onOk: P.func, // 确定
    onClose: P.func, // 关闭
    record: P.object,
  };

  constructor (props) {
    super(props);

    this.selectedKeys = [];
    this.state = {
      nowKeys: [], // 当前选中的keys
      loading: false,
      defaultKeys: this.props.defaultKeys, // 默认值
    };
  }

  componentDidMount () {
  }

  /** 点击确定时触发 **/
  onOk = () => {
    this.props.onOk(this.selectedKeys);
  };

  /** 点击关闭时触发 **/
  onClose = () => {
    this.props.onClose();
  };
  handleChange = (checkedValues) => {
    this.selectedKeys = checkedValues;
  };
  searchUser = (value) => {
  };

  getNodes = (tree) => tree.reduce((pre, item) => {
    pre.push(
      <TreeNode value={item.id} title={item.name} key={item.id}>
        {item.children ? this.getNodes(item.children) : null}
      </TreeNode>
    );
    return pre;
  }, []);

  render () {
    const { defaultKeys, visible, title, treenode, nowData } = this.props;
    return (
      <Modal
        title={title}
        visible={visible}
        destroyOnClose
        onOk={this.onOk}
        onCancel={this.onClose}
        okText="确认"
        cancelText="取消"
        width="50%"
      >
        <Tooltip title="角色名称">
          <span>{(nowData && nowData.name) || ""}</span>
        </Tooltip>
        <br />
        <br />
        <TreeSelect
          showSearch
          style={{ width: "100%" }}
          placeholder="请选择部门"
          allowClear
          multiple
          treeDefaultExpandAll
          onChange={this.handleChange}
          defaultValue={defaultKeys}
        >
          {this.getNodes(treenode)}
        </TreeSelect>
      </Modal>
    );
  }
}
