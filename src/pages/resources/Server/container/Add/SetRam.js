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
  Select
} from 'antd';
import { inject} from 'mobx-react';
import { withRouter } from 'react-router';
import {SYS_DICT_SERVERPART, SYS_DICT_SERVER} from '@src/config/sysDict'; // 系统字典
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import RamModelRadio from '@src/pages/resources/container/RamModelRadio';
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
    defultSolts: P.any,  // 模板入库初始卡槽数
    setSolts: P.func, // 确认选择
  };
  formRefSetRam = React.createRef();
  constructor (props) {
    super(props);
    let lists = [];
    // 模板入库时，带入模板卡槽数
    if (this.props.defultSolts) {
      for (let i = 0; i < this.props.defultSolts; i++) {
        lists.push({
          index: i + 1, // 卡槽号
          id: null, // 内存卡id
          info: {}// 内存卡信息
        });
      }
    }
    this.state = {
      orgionLists: [], // 第一次获取的list数据（原始数据）
      lists: lists, // 卡槽
    };
  }
  componentDidMount () {
    // this.getDetail(this.props.cabinetId);
  }
  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextProps.regionId !== this.props.regionId;
  // }
  componentWillReceiveProps (nextProps) {
  }

  // 修改卡槽数
  resetNum = (e) => {
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
          id: null, // 内存卡id
          info: {}// 内存卡信息
        });
      }
    }
    this.setState({
      lists: list
    });
  }

  // 选择ram
  /**
   * index:卡槽号
   * e:插槽对应内存条信息
   */
  selectRam (index, key, row) {
    let lists = _.cloneDeep(this.state.lists);
    lists.splice(index - 1, 1, {
      index: index,
      id: row.id,
      info: row
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
      index: item.index,
      id: null,
      info: {}
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
    // const {title, uw, regionId} = this.props;
    const {lists} = this.state;
    return (
      <React.Fragment>
        <Row>
          <FormItem name="serverMemorySlot" label="内存插槽数"
            rules={[{ required: true,
              pattern: regExpConfig.num,
              message: '请输入数字' }]}>
            <InputNumber onChange={this.resetNum} maxLength={2} />
          </FormItem>
          <FormItem name="serverMaxMemory" label="最大支持容量（G）"
            rules={[{ required: true,
              pattern: regExpConfig.num,
              message: '请输入数字' }]}>
            <InputNumber maxLength={5}/>
          </FormItem>
          <FormItem name="serverOneMemory" label="单槽支持最大容量（G）"
            rules={[{ required: true,
              pattern: regExpConfig.num,
              message: '请输入数字' }]}>
            <InputNumber maxLength={5}/>
          </FormItem>
          <FormItem name="serverMemoryType" label="支持类型"
            rules={[{ required: true,
              pattern: regExpConfig.num,
              message: '请输入数字' }]}>
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
        {_.map(lists, (item, index) => <li className="my-column" key={item.index}>
          <span className="column-label">插槽{item.index}:</span>
          <Input value={item.info && item.info.memName} style={{width: 400}} disabled/>
          <RamModelRadio
            fetchPath={`${BSS_ADMIN_URL}/api/product/memorymodel`} // 选择内存卡型号
            title={'选择内存型号'}
            onSelect={(key, row) => {this.selectRam(item.index, key, row);}}>
            {item.info.memoryModelId && <Button>替换</Button>}
            {!item.info.memoryModelId && <Button>添加</Button>}
          </RamModelRadio>
          <Button onClick={() => {this.cancel(index, item);}} style={{marginLeft: 10}}>取消</Button>
        </li>)}
      </React.Fragment>
    );
  }
}
export default SetRam;


