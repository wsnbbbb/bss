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
  Row,
  Modal,
  Select,
} from 'antd';
import { inject} from 'mobx-react';
import { withRouter } from 'react-router';
import {SYS_DICT_SERVERPART} from '@src/config/sysDict'; // 系统字典
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import RamRadio from '@src/pages/resources/container/RamRadio';
import RamModelRadio from '@src/pages/resources/container/RamModelRadio';
import debounce from 'lodash/debounce';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { Option } = Select;

@withRouter
@inject('serverPartDict')
class SetRam extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    serverPartDict: P.any,
    defaultValues: P.any,  // 当前选中的信息
    houseId: P.string,  // 当前服务器所在机房（位置不允许修改）
    setSolts: P.func, // 确认选择
  };
  formRefSetRam = React.createRef();
  constructor (props) {
    super(props);
    // 固件数量修改规则：末尾增删，末尾移除的时候，如果有数据，不允许删除(算法：末尾取值遇到卡槽有卡的，则卡槽值为最小卡槽数)
    let minSolts = 0;
    let defaultValuesLen = this.props.defaultValues && this.props.defaultValues.length;
    if (defaultValuesLen) {
      for (let i = defaultValuesLen - 1; i > 0; i--) {
        let item = this.props.defaultValues;
        if (item[i].memoryModelId) {
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

  // 修改卡槽数，暂时不做
  resetNum = (e) => {
    if (e < this.minSolts) {
      // 如果被删除的卡槽中有数据，不允许删除卡槽
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
          id: undefined, // 内存卡id
          info: {}// 内存卡信息
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
  selectRam (index, item, row) {
    let lists = _.cloneDeep(this.state.lists);
    lists.splice(index, 1, {
      memorySlot: item.memorySlot,
      id: item.id,
      memoryModelId: row.id,
      // memoryName: row.memorymodelList && row.memorymodelList[0] && row.memorymodelList[0].memName,
      memoryName: row.memName,
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
      memorySlot: item.memorySlot,
      id: item.id,
      memoryModelId: null,
      memoryName: null,
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
      memorySlot: this.props.defaultValues[index].memorySlot,
      id: this.props.defaultValues[index].id,
      memoryModelId: this.props.defaultValues[index].memoryModelId,
      memoryName: this.props.defaultValues[index].memoryName,
      serverId: this.props.defaultValues[index].serverId,
      version: this.props.defaultValues[index].version
    });
    this.setState({
      lists: lists
    });
    this.props.setSolts(lists);
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.formRefSetRam.current.resetFields();
  };


  render () {
    const {lists} = this.state;
    return (
      <React.Fragment>
        <Row>
          <FormItem name="serverMemorySlot" label="内存插槽数"
            rules={[{ required: true,
              pattern: regExpConfig.num,
              message: '请输入不超过2位的数字' }]}>
            <InputNumber onChange={this.resetNum} maxLength={2} />
          </FormItem>
          <FormItem name="serverMaxMemory" label="最大支持容量（G）"
            rules={[{ required: true,
              pattern: regExpConfig.num,
              message: '请输入不超过5位的数字' }]}>
            <InputNumber maxLength={5} />
          </FormItem>
          <FormItem name="serverOneMemory" label="单槽支持最大容量（G）"
            rules={[{ required: true,
              pattern: regExpConfig.num,
              message: '请输入不超过5位的数字' }]}>
            <InputNumber maxLength={5}/>
          </FormItem>
          <FormItem name="serverMemoryType" label="支持类型"
            rules={[{ required: true,
              message: '请选择' }]}>
            <Select
              style={{width: 150}} allowClear>
              {
                _.map(SYS_DICT_SERVERPART.memory_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
              }
            </Select>
          </FormItem>
          <FormItem name="serverMemorySpec" label="支持规格"
            rules={[{ required: true}]}>
            <Select
              style={{width: 150}} allowClear>
              {
                _.map(SYS_DICT_SERVERPART.mem_spec, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
              }
            </Select>
          </FormItem>
        </Row>
        {_.map(lists, (item, index) => <li className="my-column" key={index}>
          <span className="column-label">插槽{item.memorySlot}:</span>
          <Input value={item.memoryName} style={{width: 400}} disabled/>
          {/* <RamRadio
            disabled={!this.props.houseId} // 父组件 来控制子组件是否可用 比如：前置条件机房已经有了 就让使用子组件
            disabledTip="机房信息缺失" // 不能使用子组件原因
            fetchPath={`${BSS_ADMIN_URL}/api/product/memorydetail?saleStatus=0&houseId=${this.props.houseId}`} // 服务器所在机房下可用的CPU
            title={'选择内存条'}
            onSelect={(key, row) => {this.selectRam(index, item, row);}}>
            {item.memoryModelId && <Button>替换</Button>}
            {!item.memoryModelId && <Button>添加</Button>}
          </RamRadio> */}
          <RamModelRadio
            fetchPath={`${BSS_ADMIN_URL}/api/product/memorymodel`} // 选择内存卡型号
            title={'选择内存型号'}
            onSelect={(key, row) => {this.selectRam(index, item, row);}}>
            {item.memoryModelId && <Button>替换</Button>}
            {!item.memoryModelId && <Button>添加</Button>}
          </RamModelRadio>
          <Button onClick={() => {this.cancel(index, item);}} style={{marginLeft: 10}}>取消</Button>
          {item.id && <Button onClick={() => {this.del(index, item);}} style={{marginLeft: 10}}>移除</Button>}
        </li>)}
      </React.Fragment>
    );
  }
}
export default SetRam;


