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
} from 'antd';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';
import {observable} from "mobx";
import tools from '@src/util/tools'; // 工具
import debounce from 'lodash/debounce';
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import CpuRadio from '@src/pages/resources/container/CpuRadio';
import CpuModelRadio from '@src/pages/resources/container/CpuModelRadio';
// ==================
// Definition
// ==================
const FormItem = Form.Item;

@withRouter
@inject('root')
class SetCpu extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    root: P.any,
    powers: P.array, // 当前登录用户权限
    defaultValues: P.any,  // 服务器里面存储的数据，用于重置使用
    // houseinfo: P.any,  // 机房信息会发生变更情况下使用
    houseId: P.any,  // 服务器里面存储的数据，用于重置使用
    setSolts: P.func, // 确认选择
  };
  formRefSetCpu = React.createRef();
  constructor (props) {
    super(props);
    // 硬盘数修改规则：末尾增删，末尾移除的时候，如果有数据，不允许删除(算法：末尾取值遇到卡槽有卡的，则卡槽值为最小卡槽数)
    let minSolts = 0;
    let defaultValuesLen = this.props.defaultValues && this.props.defaultValues.length;
    if (defaultValuesLen) {
      for (let i = defaultValuesLen - 1; i > 0; i--) {
        let item = this.props.defaultValues;
        if (item[i].cpuModelId) {
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
  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextProps.regionId !== this.props.regionId;
  // }
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
    // console.log(list);
  }

  // 选择cpu
  /**
   * index:卡槽号
   * e:插槽对应信息
   */
  // index, item, row
  selectCpu (index, item, row) {
    console.log(item);
    let lists = _.cloneDeep(this.state.lists);
    if(item.cpuModelId){
      lists.splice(index, 1, {
        cpuSlot: item.cpuSlot,
        id: item.id,
        cpuModelId: row.id, // 硬盘id
        // cpuName: row.cpuModelList && row.cpuModelList[0] && row.cpuModelList[0].cpuName,// 列表
        cpuName: row.cpuName,
        serverId: item.serverId,
        version: item.version
      });
    }else{
      lists.splice(index, 1, {
        cpuSlot: item.index,
        id: item.id,
        cpuModelId: row.id, // 硬盘id
        // cpuName: row.cpuModelList && row.cpuModelList[0] && row.cpuModelList[0].cpuName,// 列表
        cpuName: row.cpuName,
        serverId: item.serverId,
        version: item.version
      });
    }
    this.setState({
      lists: lists
    });
    this.props.setSolts(lists);
  }

    // 移除
    del = (index, item) => {
      console.log(item);
      let lists = _.cloneDeep(this.state.lists);
      lists.splice(index, 1, {
        cpuSlot: item.cpuSlot,
        id: item.id,
        cpuModelId: null,
        cpuName: null,
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
        cpuSlot: this.props.defaultValues[index].cpuSlot,
        id: this.props.defaultValues[index].id,
        cpuModelId: this.props.defaultValues[index].cpuModelId,
        cpuName: this.props.defaultValues[index].cpuName,
        serverId: this.props.defaultValues[index].serverId,
        version: this.props.defaultValues[index].version
      });
      this.setState({
        lists: lists
      });
      this.props.setSolts(lists);
    }

    render () {
      return (
        <React.Fragment>
          <FormItem>
            <Row>
              <FormItem name="serverCpuSlot" label="CPU数量"
                rules={[{ required: true,
                  pattern: regExpConfig.num,
                  message: '请输入数字' }]}>
                <InputNumber onChange={this.resetNum} maxLength={2}/>
              </FormItem>
            </Row>
            {_.map(this.state.lists, (item, index) => <li className="my-column" key={index}>
              <span className="column-label required">插槽{item.cpuSlot}:</span>

              <Input value={item.cpuName} style={{width: 400}} disabled/>
              {/* <CpuRadio
                disabled={!this.props.houseId} // 父组件 来控制子组件是否可用 比如：前置条件机房已经有了 就让使用子组件
                disabledTip="机房信息缺失" // 不能使用子组件原因
                fetchPath={`${BSS_ADMIN_URL}/api/product/cpudetail?saleStatus=0&houseId=${this.props.houseId}`} // 服务器所在机房下可用的CPU
                title={'选择cpu'}
                onSelect={(key, row) => {this.selectCpu(index, item, row);}}>
                {item.cpuModelId && <Button>替换</Button>}
                {!item.cpuModelId && <Button>添加</Button>}
              </CpuRadio> */}
              <CpuModelRadio onSelect={(key, row) => {this.selectCpu(index, item, row);}}>
                {item.cpuModelId && <Button>替换</Button>}
                {!item.cpuModelId && <Button>添加</Button>}
              </CpuModelRadio>
              <Button onClick={() => {this.cancel(index, item);}} style={{marginLeft: 10}}>取消</Button>
              {item.id && <Button onClick={() => {this.del(index, item);}} style={{marginLeft: 10}}>移除</Button>}
            </li>)}
          </FormItem>
        </React.Fragment>
      );
    }
}
export default SetCpu;


