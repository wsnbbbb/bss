/* eslint-disable react/prop-types */
/**
 * 选择地区
 * 共其他组件使用
 */
import React from 'react';
import P from 'prop-types';
import { inject, observer} from 'mobx-react';
import _ from 'lodash';
import http from '@src/util/http';
import tools from '@src/util/tools';
import { orgTreeDefault, formItemLayout} from '@src/config/commvar'; // 全局变量
import { DownOutlined} from '@ant-design/icons';
import {
  Button,
  Table,
  message,
  Tree,
  Modal,
  Divider,
  Spin,
  Form,
  Input,
  Select,
  TreeSelect
} from 'antd';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;
const { TreeNode } = TreeSelect;
@inject('root')
@inject('areaResouse')
@observer
class OrganizationTree extends React.Component {
  static propTypes = {
    areaResouse: P.any,
    disabled: P.bool,
    defaultValue: P.string,
    placeholder: P.string,
    onSelect: P.func,
  }
  constructor (props) {
    super(props);
    this.state = {
      value: this.props.defaultValue, // 选中地区
      treedata: this.props.areaResouse.areaTreeList
    };
  }
  componentDidMount () {
  }
  // searchName = (val) => {
  //   if (!val) {
  //     return;
  //   }
  //   let reg = new RegExp(val);
  //   let lists = _.filter(this.props.areaResouse.areaList, (item) => reg.test(item.name));
  //   this.setState({
  //     treedata: tools.makeSourceData(lists)
  //   });
  // }

  /**
   *
   * @param {区域节点id} key:string
   * @param e:{selected: bool, selectedNodes, node, event}
   */
  onSelect = (value) => {
    this.props.onSelect(value);
    this.setState({
      value: value,
    });
  }

  // 构造树
  makeDomTree (node) {
    let notleaf = node.children && node.children.length > 0;
    if (notleaf) {
      return <TreeNode  title={node.name} key={node.id} value={node.id} disabled={node.id === '0' && this.props.type === 'house'}>
        {_.map(node.children, (item) => this.makeDomTree(item))}
      </TreeNode >;
    } else {
      return <TreeNode  title={node.name} key={node.id} value={node.id}> </TreeNode >;
    }
  }

  render () {
    const data = this.state.treedata;
    return (
      <React.Fragment>
        <TreeSelect
          disabled={this.props.disabled}
          defaultValue={this.props.districtId}
          placeholder={this.props.placeholder}
          style={{ width: '100%' }}
          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
          treedefaultexpandallshow="false"
          allowClear
          // showSearch
          // onSearch={this.searchName}
          onChange={this.onSelect}
          // value={this.state.value}
        >
          {_.map(data, (node) => this.makeDomTree(node))}
        </TreeSelect>
      </React.Fragment>
    );
  }
}
export default OrganizationTree;
