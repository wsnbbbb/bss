import React from 'react';
import P from 'prop-types';
import http from '@src/util/http';
import tools from '@src/util/tools';
import _ from 'lodash';
import { Tabs, Radio, Breadcrumb, Select, Checkbox, Button, Input, Form, Row, InputNumber, Modal } from 'antd';
import { inject, observer} from 'mobx-react';
import {SYS_DICT_SERVERPART} from "@src/config/sysDict";
import {formItemLayout, formItemLayout2} from '@src/config/commvar'; // 全局通用变量
import Item from 'antd/lib/list/Item';
const { TabPane } = Tabs;

class MinResBrandWith extends React.PureComponent {
  static propTypes = {
    location: P.any,
    history: P.any,
    onSave: P.func, // 保存配置
    onDel: P.func, // 删除配置
    notDefaultRes: P.bool, // 是否允许删除（默认资源不可删除）
    defaultValue: P.any, // 默认值
    houses: P.any, // 默认值
    categoryId: P.any, // 默认值
  };
  constructor (props) {
    super(props);
    this.state = {
      editable: false, // 编辑模式（编辑模式可编辑，且有确定按钮）
      activeKey: undefined,
      conifgParams: this.props.defaultValue && this.props.defaultValue.bands || {}, // 可选参数集
    };
  }
  componentDidMount () {
    this.getBrandwith();
  }

  getBrandwith = () => {
    let categoryId, houseKeys = [];
    if (!this.props.categoryId || this.props.categoryId.length == 0) {
      Modal.error({
        title: "请选择类目"
      });
      return;
    } else {
      categoryId = _.last(this.props.categoryId);
    }

    if (this.props.houses.length == 0) {
      Modal.error({
        title: "请选择机房"
      });
      return;
    } else {
      _.map(this.props.houses, (item) => {
        houseKeys.push(item.key);
      });
    }
    http.get(`${BSS_ADMIN_URL}/api/goods/bandwidth-price/choose`, {params: {
      categoryId: categoryId,
      houseIds: houseKeys,
    }})
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let conifgParams = {};
          _.map(res.data, (item, key) => {
            conifgParams[key] = [];
            if (item.length > 0) {
              _.map(item, (brand) => {
                let bandwidthName = brand.bandwidthName;
                let bandwidthId = brand.id;
                let bandSize = [];
                _.map(brand.bandwidthPriceList, (size) => {
                  bandSize.push(size.bandwidthSize);
                });
                let house = _.find(this.props.houses, (house) => house.key == key);
                conifgParams[key].push({
                  houseName: house ? house.children : 'UNKNOW',
                  bandwidthName: bandwidthName,
                  bandwidthId: bandwidthId,
                  selectValues: [],
                  options: bandSize,
                  defaultValue: null,
                });
              });
            }
          });
          this.setState({
            conifgParams: conifgParams,
          });
        } else {
          tools.dealFail(res);
        }
      })
      .catch(() => {
      });
  }

  //  根据用户选中的值控制默认值可选项
  setvalue = (name, index, key, val) => {
    let conifgParams = {...this.state.conifgParams};
    if (name == 'selectValues') {
      conifgParams[key][index].selectValues = val;
    } else {
      // 可选项里面包含ALL 默认值随便选
      if (_.find(conifgParams[key][index].selectValues, (value) => value == 'ALL')) {
        conifgParams[key][index].defaultValue = conifgParams[key][index].options;
      } else {
        conifgParams[key][index].defaultValue = val;
      }
    }
    this.props.onSave({bands: conifgParams});
    this.setState({conifgParams: conifgParams});
  }

  // 删除配置
  OnDel = () => {
    this.props.onDel();
  }
  // 切换带宽机房
  setBrandwithHouse = (key) => {
    this.setState({
      activeKey: key
    });
  }

  render () {
    const { conifgParams} = this.state;
    const style = {
      display: 'inline-block',
      width: 150,
    };
    const style1 = {
      display: 'inline-block',
      width: 400,
      marginLeft: 160,
    };
    const style2 = {
      display: 'inline-block',
      width: 700,
    };
    return (
      <div className="min-res">
        <div className="min-res-head">
          <span className="min-res-title">+ 带宽 </span>
          <Button onClick={() => {this.editChange(false);}}>配置</Button>
          {this.props.notDefaultRes && <Button onClick={this.OnDel} className="del-btn">删除</Button>}
        </div>
        <Form
          name="bandwith"
          layout="inline"
        >
          <Tabs defaultActiveKey="1" onChange={this.setBrandwithHouse}>
            {
              _.map(conifgParams, (item, key) => <TabPane tab={"tabs"} key={key}>
                {
                  _.map(item, (bandwidth, index) => <div className="min-res-content" key={index + key}>
                    <Form.Item
                      style={style}>
                      <span>{bandwidth.bandwidthName}:</span>
                    </Form.Item>
                    <Form.Item
                      label="可选值"
                      style={style2}>
                      <Select style={{width: 400}} mode="multiple" defaultValue={bandwidth.selectValues}
                        onChange={(val) => {this.setvalue('selectValues', index, key, val);}}>
                        {
                          _.map(bandwidth.options, (val) =>  <Select.Option value={val} key={val}>{val}</Select.Option>)
                        }
                      </Select>
                    </Form.Item>
                    <Form.Item
                      label="默认值"
                      style={style1}>
                      {bandwidth.selectValues.length > 0 && <Select allowClear  style={{width: 300}} defaultValue={bandwidth.defaultValue}
                        onChange={(val) => {this.setvalue('defaultValue', index, key, val);}}>
                        {
                          _.map(bandwidth.selectValues, (val) =>  <Select.Option value={val} key={val}>{val}</Select.Option>)
                        }
                      </Select>}
                      {bandwidth.selectValues.length == 0 && <Select allowClear  style={{width: 300}} onChange={(val) => {this.setvalue('defaultValue', index, key, val);}}>
                        {
                          _.map(bandwidth.options, (val) =>  <Select.Option value={val} key={val}>{val}</Select.Option>)
                        }
                      </Select>}
                    </Form.Item>
                  </div>)
                }
              </TabPane>)
            }
          </Tabs>
        </Form>
      </div>

    );
  }
}

export default MinResBrandWith;
