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
  InputNumber,
  Modal,
  Row,
  Select
} from 'antd';
import { withRouter } from 'react-router';
import {SYS_DICT_SERVERPART, SYS_DICT_SERVER} from '@src/config/sysDict'; // 系统字典
import tools from '@src/util/tools'; // 工具
import debounce from 'lodash/debounce';
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import HardDiskRadio from '@src/pages/resources/container/HardDiskRadio';
import HardDiskModelRadio from '@src/pages/resources/container/HardDiskModelRadio';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { Option } = Select;

@withRouter
class SetHardDisk extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    defaultValues: P.any,  // 当前选中的信息
    houseId: P.any,  // 服务器所在机房
    setSolts: P.func, // 确认选择
  };
  formRefSetHardDisk = React.createRef();
  constructor (props) {
    super(props);
    // 硬盘数修改规则：末尾增删，末尾移除的时候，如果有数据，不允许删除(算法：末尾取值遇到卡槽有卡的，则卡槽值为最小卡槽数)
    let minSolts = 0;
    let defaultValuesLen = this.props.defaultValues && this.props.defaultValues.length;
    if (defaultValuesLen) {
      for (let i = defaultValuesLen - 1; i > 0; i--) {
        let item = this.props.defaultValues;
        if (item[i].diskModelId) {
          minSolts = i + 1;
          break;
        }
      }
    }
    this.minSolts = minSolts;
    this.state = {
      lists: this.props.defaultValues, // 数据
    };
    this.resetNum = debounce(this.resetNum, 600);
  }
  componentDidMount () {

  }
  componentWillReceiveProps (nextProps) {
  }

  // 修改卡槽数
  resetNum = (e) => {
    if (e < this.minSolts) {
      // 如果被删除的卡槽中有数据
      Modal.error({
        title: '你删除的卡槽中有数据，不允许删除卡槽！'
      });
      return false;
    }
    let oldlen = this.state.lists.length;
    let list = _.cloneDeep(this.state.lists);
    if (e == oldlen) {
      return;
    }
    if (oldlen > e) {
      list.splice(e, oldlen - e);
    } else {
      for (let i = oldlen + 1; i <= e; i++) {
        list.push({
          index: i, // 卡槽号
          id: undefined, // 硬盘卡id
          info: {}// 硬盘卡信息
        });
      }
    }
    this.setState({
      lists: list
    });
    console.log(list);
  }

  // 选择ram
  /**
   * 数据 index
   * item: 当前数据
   * row:选的内存信息
   */
  selectDisk (index, item, row) {
    let lists = _.cloneDeep(this.state.lists);
    lists.splice(index, 1, {
      diskSlot: item.diskSlot,
      id: item.id,
      diskModelId: row.id, // 硬盘id
      // diskName: row.diskmodelList && row.diskmodelList[0] && row.diskmodelList[0].diskName,
      diskName: row.diskName,
      serverId: item.serverId,
      version: item.version
    });
    this.setState({
      lists: lists
    });
    this.props.setSolts(lists);
  }

  // 移除
  del = (index, item) => {
    let lists = _.cloneDeep(this.state.lists);
    lists.splice(index, 1, {
      diskSlot: item.diskSlot,
      id: item.id,
      diskModelId: null,
      diskName: null,
      serverId: item.serverId,
      version: item.version
    });
    this.setState({
      lists: lists
    });
    this.props.setSolts(lists);
  }
  // 取消
  cancel = (index, item) => {
    let lists = _.cloneDeep(this.state.lists);
    lists.splice(index, 1, {
      diskSlot: this.props.defaultValues[index].diskSlot,
      id: this.props.defaultValues[index].id,
      diskModelId: this.props.defaultValues[index].diskModelId,
      diskName: this.props.defaultValues[index].diskName,
      serverId: this.props.defaultValues[index].serverId,
      version: this.props.defaultValues[index].version
    });
    this.setState({
      lists: lists
    });
    this.props.setSolts(lists);
  }

  render () {
    const {lists} = this.state;
    return (
      <React.Fragment>
        <Row>
          <FormItem name="serverDiskSlot" label="硬盘插槽数"
            rules={[{ required: true,
              pattern: regExpConfig.num,
              message: '请输入数字' }]}>
            <InputNumber onChange={this.resetNum} maxLength={2}/>
          </FormItem>
          <FormItem name="serverDiskHot" label="是否支持热插拔"
            rules={[{ required: true}]}>
            <Select style={{width: 150}} allowClear>
              <Option value={1} key={1} > 是 </Option>
              <Option value={0} key={0} > 否 </Option>
            </Select>
          </FormItem>
          <FormItem name="diskInterfaceType" label="接口类型"
            rules={[{ required: true,
              message: '请选择' }]}>
            <Select
              style={{width: 150}} allowClear>
              {
                _.map(SYS_DICT_SERVERPART.disk_interface_type, (value, key) => <Option value={parseInt(key)} key={key}> {value} </Option>)
              }
            </Select>
          </FormItem>
          <FormItem name="serverDiskSpec" label="支持规格"
            rules={[{ required: true, message: '请选择' }]}>
            <Select
              style={{width: 150}} allowClear>
              {
                _.map(SYS_DICT_SERVERPART.server_disk_spec, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
              }
            </Select>
          </FormItem>
        </Row>
        {_.map(lists, (item, index) => <li className="my-column" key={index}>
          <span className="column-label required">插槽{item.diskSlot}:</span>
          <Input value={item.diskName} style={{width: 400}} disabled/>
          {/* <HardDiskRadio
            disabled={!this.props.houseId} // 父组件 来控制子组件是否可用 比如：前置条件机房已经有了 就让使用子组件
            disabledTip="机房信息缺失" // 不能使用子组件原因
            fetchPath={`${BSS_ADMIN_URL}/api/product/diskdetail?saleStatus=0&houseId=${this.props.houseId}`} // 服务器所在机房下可用的CPU
            title={'选择硬盘'}
            onSelect={(key, row) => {this.selectDisk(index, item, row);}}>
            {item.diskModelId && <Button>替换</Button>}
            {!item.diskModelId && <Button>添加</Button>}
          </HardDiskRadio> */}
          <HardDiskModelRadio
            fetchPath={`${BSS_ADMIN_URL}/api/product/diskmodel`}
            title={'选择硬盘型号'}
            onSelect={(key, row) => {this.selectDisk(index, item, row);}}>
            {item.diskModelId && <Button>替换</Button>}
            {!item.diskModelId && <Button>添加</Button>}
          </HardDiskModelRadio>
          <Button onClick={() => {this.cancel(index, item);}} style={{marginLeft: 10}}>取消</Button>
          {item.id && <Button onClick={() => {this.del(index, item);}} style={{marginLeft: 10}}>移除</Button>}
        </li>)}
      </React.Fragment>
    );
  }
}
export default SetHardDisk;


