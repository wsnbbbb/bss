/**
 * 服务器入库和模板入库 硬盘设置
 */
// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import {
  Form,
  Button,
  Input,
  InputNumber,
  Row,
  Select,
} from 'antd';
import { withRouter } from 'react-router';
import {SYS_DICT_SERVERPART} from '@src/config/sysDict'; // 系统字典
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
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
    defultSolts: P.any,  // 默认卡槽数
    setSolts: P.func, // 确认选择
  };
  formRefSetHardDisk = React.createRef();
  constructor (props) {
    super(props);
    let lists = [];
    // 模板入库时，带入模板卡槽数
    if (this.props.defultSolts) {
      for (let i = 0; i < this.props.defultSolts; i++) {
        lists.push({
          index: i + 1, // 卡槽号
          id: undefined, // 硬盘卡id
          info: {}// 硬盘卡信息
        });
      }
    }
    this.state = {
      lists: lists, // 卡槽
    };
  }
  componentDidMount () {

  }
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
   * index:卡槽号
   * e:插槽对应硬盘信息
   */
  onSelect (index, key, row) {
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
    render () {
      const {lists} = this.state;
      return (
        <React.Fragment>
          <Row>
            <FormItem name="serverDiskSlot" label="硬盘插槽数" maxLength={2}
              rules={[{ required: true,
                pattern: regExpConfig.num,
                message: '请输入数字' }]}>
              <InputNumber onChange={this.resetNum} />
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
          {_.map(lists, (item, index) => <li className="my-column" key={item.index}>
            <span className="column-label required">插槽{item.index}:</span>
            <Input value={item.info.diskName} style={{width: 400}} disabled/>
            <HardDiskModelRadio
              fetchPath={`${BSS_ADMIN_URL}/api/product/diskmodel`}
              title={'选择硬盘型号'}
              onSelect={(key, row) => {this.onSelect(item.index, key, row);}}>
              {item.info.diskModelId && <Button>替换</Button>}
              {!item.info.diskModelId && <Button>添加</Button>}
            </HardDiskModelRadio>
            <Button onClick={() => {this.cancel(index, item);}} style={{marginLeft: 10}}>取消</Button>
          </li>)}
        </React.Fragment>
      );
    }
}
export default SetHardDisk;


