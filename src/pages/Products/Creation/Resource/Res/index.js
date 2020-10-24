import React from 'react';
import P from 'prop-types';
import http from '@src/util/http';
import tools from '@src/util/tools';
import _ from 'lodash';
import { Tabs, Select, Button, Input, Modal, Alert } from 'antd';
import { inject, observer} from 'mobx-react';
import {SYS_DICT_PRODUCT} from "@src/config/sysDict";
import MinResRam from "../MinRes/Ram";
import MinResCpu from "../MinRes/Cpu";
import MinResServerBox from "../MinRes/ServerBox";
import MinResRaid from "../MinRes/Raid";
import MinResHardDisk from "../MinRes/HardDisk";
import MinResIp from "../MinRes/Ip";
import MinResBrandWith from "../MinRes/BrandWith";
const { TabPane } = Tabs;
const { Option, OptGroup } = Select;
@inject("areaResouse")
class Res extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    areaResouse: P.any,
    defaultMinRes: P.any, // 目录带过来的最小资源
    defaultValue: P.any, // 最后一次保存的资源配置（修改机房和修改配置都会触发数据保存）
    saveContent: P.func, // 保存资源配置，防止步骤来回跳，导致数据丢失
    categoryId: P.array, // 类目
  };
  constructor (props) {
    super(props);
    if (this.props.areaResouse.houseList.length <= 0) {
      this.props.areaResouse.fetchHouse();
    }

    let res = {};
    if (!this.props.defaultValue.config) { // 如果没有暂存的配置项情况下，初始化最小资源
      if (this.props.defaultMinRes && this.props.defaultMinRes.length > 0) {
        _.map(this.props.defaultMinRes, (key) => {
          res[key] = {
            notDefaultRes: false, // 是否是默认资源
          };
        });
      }
    } else {
      res = this.props.defaultValue.config || [];
    }

    let houseKey = [];
    let houseOptions = [];
    if (this.props.defaultValue.houses) { // 如果有暂存起的机房
      houseKey = this.props.defaultValue.houses.keys || [];
      houseOptions = this.props.defaultValue.houses.options || [];
    }
    this.selectHouse = houseOptions; // 用户选择但未确认的机房
    this.selectHouseKeys = houseKey; // 用户选择但未确认的机房id
    this.state = {
      houses: houseOptions,
      houseOk: false,
      selectedMinResKey: undefined, // 当前选中的最小单元
      resContents: res, // 配置的所有最小资源数据集合
      brandWithOptions: {} // 带宽数据源
    };
  }
  componentDidMount () {
  }

  // 确定选中机房或者重置
  onHouse = (type) => {
    if (type == 'sure') {
      if (this.selectHouse.length < 1) {
        Modal.error({
          title: "请选择机房！"
        });
        return;
      }
      this.setState({
        houseOk: true,
        houses: this.selectHouse
      });
      this.props.saveContent({
        ...this.props.defaultValue,
        houses: {
          keys: this.selectHouseKeys,
          options: this.selectHouse,
        }
      });
    } else {
      this.setState({
        houseOk: false
      });
    }

  }

  // 保留选择的机房
  setHouses = (key, options) => {
    this.selectHouse = options;
    this.selectHouseKeys = key;
  }


  // 设置机房选项卡
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
    let resContents = { ...this.state.resContents };
    if (resContents[this.state.selectedMinResKey]) {
      Modal.error({
        title: '同一种最小资源不能重复添加！'
      });
      return;
    }
    resContents[this.state.selectedMinResKey] = {
      notDefaultRes: true, // 是否是默认资源
    },
    this.setState({resContents: resContents});
  }
  // 修改最小资源配置
  onEdit = (key, config) => {
    let resContents = {...this.state.resContents};
    resContents[key] = {
      ...resContents[key],
      ...config,
    };
    this.setState({resContents: resContents});
    this.props.saveContent({
      ...this.props.defaultValue,
      config: resContents
    });
    console.log(this.state.resContents);
  }

  // 删除最小资源
  onDel = (key) => {
    key = parseInt(key);
    let resContents = {...this.state.resContents};
    // resContents.splice(index, 1);
    delete resContents[key];
    this.setState({resContents: resContents});
  }

  render () {
    const { activeKey, houses, houseOk, minRes, resContents} = this.state;
    const { houseList } = this.props.areaResouse;
    return (
      <React.Fragment>
        {!houseOk && <div className="res-houses-wap">
          <span className="lable">选择机房:</span> <Select mode="multiple" placeholder="请选择资源机房"
            defaultValue={this.selectHouseKeys}
            onChange={this.setHouses} style={{width: "80%"}}>
            {_.map(houseList, (house) => <Select.Option value={house.id} key={house.id}>{house.fullName}</Select.Option>)}
          </Select>
          <Button type="primary" onClick={() => {this.onHouse('sure');}}>确认</Button>
        </div>}
        {houseOk && <div>
          <span style={{marginRight: 30}}>已选机房: {houses.length}</span> <Button onClick={() => {this.onHouse('reset');}}>重新选择机房</Button>
          <Tabs tabPosition="top" onChange={this.setActiveKey} activeKey={activeKey}>
            {_.map(houses, (house) => (
              <TabPane tab={house.children} key={house.key}></TabPane>
            ))}
          </Tabs>
        </div>}
        {/* {houses.length > 0 && <ResContent defaultMinRes={this.props.defaultMinRes}></ResContent>} */}
        {houses.length > 0 && <div className="res-contents">
          <div style={{margin: "20px auto"}}>
            <span>选择资源：</span> <Select style={{ width: 500 }} onChange={this.setMinRes}>
              {
                _.map(SYS_DICT_PRODUCT.product_resource_config_classify, (item) => <OptGroup label={item.title} key={item.value}>
                  {
                    _.map(item.children, (res) => <Option value={res.value} key={res.value}>{res.title}</Option>)
                  }
                </OptGroup>)
              }
            </Select>
            <Button onClick={this.addRes}>添加</Button>
            <Alert style={{margin: '10px 0px'}} message="备注：可选值不选默认为全部，默认值不选默认为不设置默认值" type="info" />
          </div>
          {_.map(resContents, (res, key) => {
            if (key == 1) {
              return <MinResServerBox notDefaultRes={res.notDefaultRes} key={key} defaultValue={res}
                onSave={(config) => {this.onEdit(key, config);}} onDel={() => {this.onDel(key);}}></MinResServerBox>;
            }
            if (key == 2) {
              return <MinResCpu notDefaultRes={res.notDefaultRes} key={key} defaultValue={res}
                onSave={(config) => {this.onEdit(key, config);}} onDel={() => {this.onDel(key);}}></MinResCpu>;
            }
            if (key == 3) {
              return <MinResRam notDefaultRes={res.notDefaultRes} key={key} defaultValue={res}
                onSave={(config) => {this.onEdit(key, config);}} onDel={() => {this.onDel(key);}}></MinResRam>;
            }
            if (key == 4) {
              return <MinResHardDisk notDefaultRes={res.notDefaultRes} key={key} defaultValue={res}
                onSave={(config) => {this.onEdit(key, config);}} onDel={() => {this.onDel(key);}}></MinResHardDisk>;
            }
            if (key == 5) {
              return <MinResIp notDefaultRes={res.notDefaultRes} key={key} defaultValue={res}
                onSave={(config) => {this.onEdit(key, config);}} onDel={() => {this.onDel(key);}}></MinResIp>;
            }
            if (key == 6) {
              return <MinResRaid notDefaultRes={res.notDefaultRes} key={key} defaultValue={res}
                onSave={(config) => {this.onEdit(key, config);}} onDel={() => {this.onDel(key);}}></MinResRaid>;
            }
            if (key == 7) {
              return <MinResBrandWith notDefaultRes={res.notDefaultRes} key={key} defaultValue={res}
                houses={houses}
                categoryId={this.props.categoryId}
                onSave={(config) => {this.onEdit(key, config);}} onDel={() => {this.onDel(key);}}></MinResBrandWith>;
            }
          })}
        </div>}
      </React.Fragment>

    );
  }
}

export default Res;
