/**
 * 用于选择机柜,为其他组件提供
 */
// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import http from '@src/util/http';
import {
  Form,
  Button,
  Input,
  Checkbox,
  Tag,
  InputNumber,
  Table,
  message,
  Popconfirm,
  Spin,
  Modal,
  Row,
  Col,
  Tooltip,
  Divider,
  Select,
  TreeSelect
} from 'antd';
import { EyeOutlined, FormOutlined, DeleteOutlined} from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';
import {observable} from "mobx";
import {formItemLayout} from '@src/config/commvar'; // 全局通用变量
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import RaidModelRadio from '@src/pages/resources/container/RaidModelRadio';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const { TreeNode } = TreeSelect;

@withRouter
@inject('root')
class SetRaid extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    root: P.any,
    powers: P.array, // 当前登录用户权限
    defaultData: P.any,  // 当前选中的信息
    setSolts: P.func, // 确认选择
  };
  formRefSetRaid = React.createRef();
  constructor (props) {
    super(props);
    this.state = {
      isRaid: false, // 是否
      isUseRaid: false,
      radiInfo: {}
    };
  }
  componentDidMount () {
  }
  componentWillReceiveProps (nextProps) {
  }

  // 选择ram
  /**
   * index:卡槽号
   * e:插槽对应硬盘信息
   */
  selectRadio (key, row) {
    this.setState({
      radiInfo: row
    });
    this.props.setSolts(row);
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.formRefSetRaid.current.resetFields();
  };

  changeRaid (filedname, value) {
    if (filedname == 'isRaid') {
      this.setState({
        isRaid: value
      });
      return;
    }
    if (filedname == 'isUseRaid') {
      this.setState({
        isUseRaid: value
      });
    }
  }


  render () {
    return (
      <React.Fragment>
        <FormItem name="isRaid" label="是否支持raid卡"
          // rules={[{ required: true,
          //   pattern: regExpConfig.num,
          //   message: '请输入数字' }]}
        >
          <Select disabled style={{width: 100}} allowClear onChange={(val) => {this.changeRaid('isRaid', val);}}>
            <Option value={1} key={1} > 是 </Option>
            <Option value={0} key={0} > 否 </Option>
          </Select>
        </FormItem>
        <FormItem name="isUseRaid" label="是否有raid卡"
          // rules={[{ required: !!this.state.isRaid,
          //   pattern: regExpConfig.num,
          //   message: '请输入数字' }]}
        >
          <Select style={{width: 100}} allowClear
            disabled={!this.state.isRaid}
            onChange={(val) => {this.changeRaid('isUseRaid', val);}}>
            <Option value={1} key={1} > 是 </Option>
            <Option value={0} key={0} > 否 </Option>
          </Select>
        </FormItem>
        <FormItem label="raid卡型号" name="raidName"
          // rules={[{ required: true}]}
        >
          <Input disabled />
          {/* <RaidModelRadio disabled={!this.state.isUseRaid}
            disabledTip="支持raid卡并且有raid卡，才能选择型号"
            onSelect={(key, row) => {this.selectRadio(key, row);}}></RaidModelRadio> */}
        </FormItem>
      </React.Fragment>
    );
  }
}
export default SetRaid;


