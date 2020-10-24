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
  Row,
  Form,
  Button,
  Input,
  InputNumber,
} from 'antd';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
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
    defultSolts: P.any,  // 当前选中cpu数
    setSolts: P.func, // 确认选择
  };
  formRefSetCpu = React.createRef();
  constructor (props) {
    super(props);
    let lists = [];
    // 模板入库时，带入模板卡槽数
    if (this.props.defultSolts) {
      for (let i = 0; i < this.props.defultSolts; i++) {
        lists.push({
          index: i + 1, // 卡槽号
          id: undefined, // cpu id
          info: {}// cpu 信息
        });
      }
    }
    this.state = {
      lists: lists
    };
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


  /**
   * index:卡槽号
   * e:插槽对应信息
   */
  onSelect (key, row, index) {
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
    return (
      <React.Fragment>
        <Row>
          <FormItem name="serverCpuSlot" label="CPU数量" maxLength={2}
            rules={[{ required: true,
              pattern: regExpConfig.num,
              message: '请输入数字' }]}>
            <InputNumber onChange={this.resetNum} />
          </FormItem>
        </Row>
        {_.map(this.state.lists, (item, index) => <li className="my-column" key={item.index}>
          <span className="column-label required">插槽{item.index}:</span>
          <Input value={item.info.cpuName} style={{width: 500}} disabled/>
          <CpuModelRadio onSelect={(key, row) => {this.onSelect(key, row, item.index);}}>
            {item.info.id && <Button>替换</Button>}
            {!item.info.id && <Button>添加</Button>}
          </CpuModelRadio>
          <Button onClick={() => {this.cancel(index, item);}} style={{marginLeft: 10}}>取消</Button>
        </li>)}
      </React.Fragment>
    );
  }
}
export default SetCpu;


