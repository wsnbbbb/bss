import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import { Tabs, Radio, Breadcrumb, Select, Button, TreeSelect, Modal } from 'antd';
import { inject, observer} from 'mobx-react';
import {SYS_DICT_PRODUCT} from "@src/config/sysDict";
import MinResRam from "../MinRes/Ram";
import MinResCpu from "../MinRes/Cpu";
const { TabPane } = Tabs;
const { Option, OptGroup } = Select;
class ResContent extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    houseId: P.string, // 针对哪个机房编辑
    defaultMinRes: P.any, // 业务类型带入的最小资源
  };
  constructor (props) {
    super(props);
    let res = [];
    if (this.props.defaultMinRes && this.props.defaultMinRes.length > 0) {
      _.map(this.props.defaultMinRes, (key) => {
        res.push({
          canDel: false, // 是否允许删除
          type: key, // 最小资源的key
          value: {} // 配置的值
        });
      });
    }
    this.state = {
      mode: 'top',
      selectedMinResKey: undefined, // 当前选中的最小单元
      resContents: res, // 配置的所有最小资源数据集合
      houseOk: false,
    };
  }
  componentDidMount () {
  }

  handleModeChange = (e) => {
    const mode = e.target.value;
    this.setState({ mode });
  };

  callback = (key) => {
    sessionStorage.setItem('roomkey', key);
    this.setState({activeKey: key});
  }

  setActiveKey = (key) => {
    this.setState({activeKey: key});
  }
  // 选择最小资源
  setMinRes = (key, options) => {
    this.setState({
      selectedMinResKey: key
    });
  }
  // 确定增加最小资源
  addRes = () => {
    if (!this.state.selectedMinResKey) {
      Modal.error({
        title: '请选择最小资源'
      });
      return;
    }
    let resContents = [...this.state.resContents];
    resContents.push({
      canDel: true,
      type: this.state.selectedMinResKey,
      value: {},
    });
    this.setState({resContents: resContents});
  }
  // 修改最小资源配置
  onEdit = (index, config) => {
    let resContents = { ...this.state.resContents};
    resContents[index].value = config;
    this.setState({resContents: resContents});
  }

  // 删除最小资源
  onDel = (index) => {
    let resContents = { ...this.state.resContents};
    resContents.splice(index, 1);
    this.setState({resContents: resContents});
  }

  render () {
    const { mode, activeKey, minRes, resContents} = this.state;
    return (
      <div className="res-contents">
        <div style={{margin: "20px auto"}}>
          <span>选择资源：</span> <Select style={{ width: 500 }} onChange={this.setMinRes}>
            {
              _.map(SYS_DICT_PRODUCT.product_resource_config_classify, (item) => <OptGroup label={item.title}>
                {
                  _.map(item.children, (res) => <Option value={res.value} key={res.value}>{res.title}</Option>)
                }
              </OptGroup>)
            }
          </Select>
          <Button onClick={this.addRes}>添加</Button>
        </div>
        {_.map(resContents, (res, index) => {
          if (res.type == 2) {
            return <MinResCpu canDel={res.canDel} key={index} onSave={(config) => {this.onEdit(index, config);}} onDel={() => {this.onDel(index);}}></MinResCpu>;
          }
          if (res.type == 3) {
            return <MinResRam canDel={res.canDel} key={index} onSave={(config) => {this.onEdit(index, config);}} onDel={() => {this.onDel(index);}}></MinResRam>;
          }

        })}
      </div>

    );
  }
}

export default ResContent;
