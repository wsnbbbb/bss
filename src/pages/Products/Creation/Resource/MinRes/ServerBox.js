import React from 'react';
import P from 'prop-types';
import http from '@src/util/http';
import tools from '@src/util/tools';
import _ from 'lodash';
import { Tabs, Radio, Breadcrumb, Select, Checkbox, Button, Input, Form, Row, InputNumber, Switch } from 'antd';
import { inject, observer} from 'mobx-react';
import {SYS_DICT_SERVER, SYS_DICT_COMMON} from "@src/config/sysDict";
import {formItemLayout, formItemLayout2} from '@src/config/commvar'; // 全局通用变量
const { TabPane } = Tabs;
class MinResServerBox extends React.PureComponent {
  static propTypes = {
    location: P.any,
    history: P.any,
    onSave: P.func, // 保存配置
    onDel: P.func, // 删除配置
    notDefaultRes: P.bool, // 是否允许删除（默认资源不可删除）
    defaultValue: P.any, // 默认值
  };
  constructor (props) {
    super(props);
    let selectedParams = {};
    if (this.props.defaultValue) {
      console.log(this.props.defaultValue);
      selectedParams['diskList'] = this.props.defaultValue.diskList && this.props.defaultValue.diskList.values || [];
      selectedParams['serverTypeList'] = this.props.defaultValue.serverTypeList && this.props.defaultValue.serverTypeList.values || [];
      selectedParams['memList'] = this.props.defaultValue.memList && this.props.defaultValue.memList.values || [];
      selectedParams['raidList'] = this.props.defaultValue.raidList && this.props.defaultValue.raidList.values || [];
      selectedParams['networkNumList'] = this.props.defaultValue.networkNumList && this.props.defaultValue.networkNumList.values || [];
    }
    this.state = {
      editable: false, // 编辑模式（编辑模式可编辑，且有确定按钮）
      conifgParams: {
        serverTypeList: [],
        diskList: [],
        memList: [],
        raidList: [],
        networkNumList: [],
      }, // 可选参数集
      selectedParams: selectedParams, // 已选参数集
    };
  }
  componentDidMount () {
    this.fetchConfigParams();
  }

  // 获取所有cpu型号
  fetchConfigParams () {
    this.setState({
      loading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/goods/crate-price/choose`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            conifgParams: res.data,
          });
        } else {
          tools.dealFail(res);
        }
      })
      .catch(() => {
      });
  }

  onFinish = (val) => {
    this.props.onSave({
      ...val,
      minNum: 1,
    });
    this.setState({ editable: true });
  }
  // 修改编辑状态
 editChange = (editable) => {
   this.setState({ editable });
 };

  //  根据用户选中的值控制默认值可选项
  onChangeOption = (key, options) => {
    let selectedParams = {...this.state.selectedParams};
    selectedParams[key] = options;
    this.setState({selectedParams: selectedParams});
  }

  // 删除配置
  OnDel = () => {
    this.props.onDel();
  }

  render () {
    const { editable, conifgParams, selectedParams} = this.state;
    console.log(this.props.defaultValue);
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
          <span className="min-res-title">+ 机箱 </span>
          <Button onClick={() => {this.editChange(false);}}>配置</Button>
          {this.props.notDefaultRes && <Button onClick={this.OnDel} className="del-btn">删除</Button>}
        </div>
        <Form
          name="mem"
          onFinish={this.onFinish}
          initialValues={this.props.defaultValue}
          layout="inline"
        >
          {/* 类型 */}
          <div className="min-res-content">
            <Form.Item
              name={["serverType", "limit"]}
              valuePropName="checked"
              style={style}>
              <Checkbox disabled={editable} >类型</Checkbox>
            </Form.Item>
            <Form.Item
              name={["serverType", "values"]}
              label="可选值"
              rules={[{required: true, message: '请选择', type: 'array'}]}
              style={style2}
            >
              <Select mode="multiple" placeholder="请选择" style={{width: 600}} disabled={editable} allowClear
                onChange={(val, options) => {this.onChangeOption('serverTypeList', options);}}>
                {
                  _.map(SYS_DICT_SERVER.se_unittype, (value, key) =>  <Select.Option value={parseInt(key)} key={key}>{value}</Select.Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item
              name={["serverType", "defaultValue"]}
              label="默认值"
              rules={[{required: true, message: '请选择' }]}
              style={style1}
            >
              <Select placeholder="默认值" style={{width: 300}} disabled={editable} allowClear>
                {
                  _.map(selectedParams.serverTypeList, (options) =>  <Select.Option value={options.value} key={options.value}>{options.children}</Select.Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item
              name={["serverType", "userSee"]}
              valuePropName="checked"
              style={style}>
              <Checkbox disabled={editable}>用户可见</Checkbox>
            </Form.Item>
          </div>

          {/* 内存扩展能力 */}
          <div className="min-res-content">
            <Form.Item
              name={["mem", "limit"]}
              valuePropName="checked"
              style={style}>
              <Checkbox disabled={editable}>内存扩展能力</Checkbox>
            </Form.Item>
            <Form.Item
              name={["mem", "values"]}
              label="可选值"
              // rules={[{required: true, message: '请选择', type: 'array'}]}
              style={style2}
            >
              <Select mode="multiple" placeholder="请选择" style={{width: 400}} disabled={editable} allowClear
                onChange={(val, options) => {this.onChangeOption('memList', options);}}>
                {
                  _.map(conifgParams.memList, (model) =>  <Select.Option value={model} key={model}>{model}</Select.Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item
              name={["mem", "defaultValue"]}
              label="默认值"
              // rules={[{required: true, message: '请选择' }]}
              style={style1}
            >
              <Select style={{width: 300}} disabled={editable} allowClear>
                {
                  _.map(selectedParams.memList, (options) =>  <Select.Option value={options.value} key={options.value}>{options.value}</Select.Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item
              name={["mem", "userSee"]}
              valuePropName="checked"
              style={style}>
              <Checkbox disabled={editable}>用户可见</Checkbox>
            </Form.Item>
          </div>
          {/* 硬盘扩展能力 */}
          <div className="min-res-content">
            <Form.Item
              name={["disk", "limit"]}
              valuePropName="checked"
              style={style}>
              <Checkbox disabled={editable}>硬盘扩展能力</Checkbox>
            </Form.Item>
            <Form.Item
              name={["disk", "values"]}
              label="可选值"
              // rules={[{required: true, message: '请选择', type: 'array'}]}
              style={style2}
            >
              <Select mode="multiple" placeholder="请选择" style={{width: 400}} disabled={editable} allowClear
                onChange={(val, options) => {this.onChangeOption('diskList', options);}}>
                {
                  _.map(conifgParams.diskList, (model) =>  <Select.Option value={model} key={model}>{model}</Select.Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item
              name={["disk", "defaultValue"]}
              label="默认值"
              // rules={[{required: true, message: '请选择' }]}
              style={style1}
            >
              <Select style={{width: 300}} disabled={editable} allowClear>
                {
                  _.map(selectedParams.diskList, (options) =>  <Select.Option value={options.value} key={options.value}>{options.value}</Select.Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item
              name={["disk", "userSee"]}
              valuePropName="checked"
              style={style}>
              <Checkbox disabled={editable}>用户可见</Checkbox>
            </Form.Item>
          </div>

          {/* RAID扩展能力 */}
          <div className="min-res-content">
            <Form.Item
              name={["raid", "limit"]}
              valuePropName="checked"
              style={style}>
              <Checkbox disabled={editable}>RAID扩展能力</Checkbox>
            </Form.Item>
            <Form.Item
              name={["raid", "values"]}
              label="可选值"
              // rules={[{required: true, message: '请选择', type: 'array'}]}
              style={style2}
            >
              <Select mode="multiple" placeholder="请选择" style={{width: 400}} disabled={editable} allowClear
                onChange={(val, options) => {this.onChangeOption('raidList', options);}}>
                {
                  _.map(SYS_DICT_COMMON.bool, (value, key) =>  <Select.Option value={parseInt(key)} key={key}>{value}</Select.Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item
              name={["raid", "defaultValue"]}
              label="默认值"
              // rules={[{required: true, message: '请选择' }]}
              style={style1}
            >
              <Select style={{width: 300}} disabled={editable} allowClear>
                {
                  _.map(selectedParams.raidList, (options) =>  <Select.Option value={options.value} key={options.value}>{options.children}</Select.Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item
              name={["raid", "userSee"]}
              valuePropName="checked"
              style={style}>
              <Checkbox disabled={editable}>用户可见</Checkbox>
            </Form.Item>
          </div>

          {/* 网卡扩展能力 */}
          <div className="min-res-content">
            <Form.Item
              name={["networkNum", "limit"]}
              valuePropName="checked"
              style={style}>
              <Checkbox disabled={editable}>网卡扩展能力</Checkbox>
            </Form.Item>
            <Form.Item
              name={["networkNum", "values"]}
              label="可选值"
              // rules={[{required: true, message: '请选择', type: 'array'}]}
              style={style2}
            >
              <Select mode="multiple" placeholder="请选择" style={{width: 400}} disabled={editable} allowClear
                onChange={(val, options) => {this.onChangeOption('networkNumList', options);}}>
                {
                  _.map(conifgParams.networkNumList, (model) =>  <Select.Option value={model} key={model}>{model}</Select.Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item
              name={["networkNum", "defaultValue"]}
              label="默认值"
              // rules={[{required: true, message: '请选择' }]}
              style={style1}
            >
              <Select style={{width: 300}} disabled={editable} allowClear>
                {
                  _.map(selectedParams.networkNumList, (options) =>  <Select.Option value={options.key} key={options.key}>{options.value}</Select.Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item
              name={["networkNum", "userSee"]}
              valuePropName="checked"
              style={style}>
              <Checkbox disabled={editable}>用户可见</Checkbox>
            </Form.Item>
          </div>

          {/* 最小数量 */}
          {/* <div className="min-res-content">
            <Form.Item name="minNum" label="最少购买量"
              rules={[{required: true, message: '请输入' }]}
              style={style2}>
              <InputNumber style={{width: 150}} disabled />
            </Form.Item>
          </div> */}

          <div className="min-res-content">
            {!editable && <Button htmlType="submit" className="action-btn ok">保存</Button>}
          </div>
        </Form>
      </div>

    );
  }
}

export default MinResServerBox;
