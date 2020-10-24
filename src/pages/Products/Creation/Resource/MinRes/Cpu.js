import React from 'react';
import P from 'prop-types';
import http from '@src/util/http';
import tools from '@src/util/tools';
import _ from 'lodash';
import { Tabs, Radio, Breadcrumb, Select, Checkbox, Button, Input, Form, Row, InputNumber, Switch } from 'antd';
import { inject, observer} from 'mobx-react';
import {SYS_DICT_SERVERPART} from "@src/config/sysDict";
import {formItemLayout, formItemLayout2} from '@src/config/commvar'; // 全局通用变量
const { TabPane } = Tabs;
class MinResCpu extends React.PureComponent {
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
      selectedParams['models'] = this.props.defaultValue.models && this.props.defaultValue.models.values || [];
      selectedParams['coreNum'] = this.props.defaultValue.core_num && this.props.defaultValue.core_num.values || [];
    }
    this.state = {
      editable: false, // 编辑模式（编辑模式可编辑，且有确定按钮）
      conifgParams: {
        models: [],
        coreNum: [],
      }, // 可选参数集
      selectedParams: selectedParams, // 已选参数集
      typeUserSee: {
        models: false,
        coreNum: false,
      }
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

    http.get(`${BSS_ADMIN_URL}/api/goods/cpuprice/cpu_uniq`)
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
 //  修改用户可见状态
  setUserSee = (param, val) => {
    let typeUserSee = {...this.state.typeUserSee};
    typeUserSee[param] = val;
    this.setState({ typeUserSee: typeUserSee });
  };

  //  根据用户选中的值控制默认值可选项
  onChangeOption = (key, options) => {
    let selectedParams = {...this.state.selectedParams};
    selectedParams[key] = options;
    // TODO
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
          <span className="min-res-title">+ CPU </span>
          <Button onClick={() => {this.editChange(false);}}>配置</Button>
          {this.props.notDefaultRes && <Button onClick={this.OnDel} className="del-btn">删除</Button>}
        </div>
        <Form
          name="mem"
          onFinish={this.onFinish}
          initialValues={this.props.defaultValue}
          layout="inline">

          {/* 型号 */}
          <div className="min-res-content">
            {this.state.typeUserSee.models && <Form.Item
              name={['models', "limit"]}
              valuePropName="checked"
              rules={[{required: true, message: '请选择'}]}
              style={style}>
              <Radio disabled={editable}>型号</Radio>
            </Form.Item>}
            {!this.state.typeUserSee.models && <Form.Item
              name={['models', "limit"]}
              valuePropName="checked"
              style={style}>
              <Checkbox disabled={editable}>型号</Checkbox>
            </Form.Item>}
            <Form.Item
              name={['models', "values"]}
              label="可选值"
              // rules={[{required: this.state.typeUserSee.models, message: '请选择', type: 'array'}]}
              style={style2}
            >
              <Select mode="multiple" placeholder="请选择" style={{width: 400}} disabled={editable} allowClear
                onChange={(val, options) => {this.onChangeOption('models', options);}}>
                {
                  _.map(conifgParams.cpu_model_list, (model) =>  <Select.Option value={model} key={model}>{model}</Select.Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item
              name={['models', "defaultValue"]}
              label="默认值"
              // rules={[{required: this.state.typeUserSee.models, message: '请选择' }]}
              style={style1}
            >
              <Select style={{width: 300}} disabled={editable} allowClear>
                {
                  _.map(selectedParams.models, (options) =>  <Select.Option value={options.value} key={options.value}>{options.value}</Select.Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item
              name={['models', "userSee"]}
              valuePropName="checked"
              style={style}>
              <Checkbox disabled={editable} onChange={(e) => {this.setUserSee('models', e.target.checked);}}>用户可见</Checkbox>
            </Form.Item>
          </div>
          {/* 核心数 */}
          <div className="min-res-content">
            {!this.state.typeUserSee.coreNum && <Form.Item
              name={['coreNum', "limit"]}
              valuePropName="checked"
              style={style}>
              <Checkbox disabled={editable}>核心数</Checkbox>
            </Form.Item>}
            {this.state.typeUserSee.coreNum && <Form.Item
              name={['coreNum', "limit"]}
              valuePropName="checked"
              // rules={[{required: this.state.typeUserSee.coreNum, message: '请选择' }]}
              style={style}>
              <Radio disabled={editable}>核心数</Radio>
            </Form.Item>}
            <Form.Item
              name={['coreNum', "values"]}
              label="可选值"
              // rules={[{required: this.state.typeUserSee.coreNum, message: '请选择', type: 'array'}]}
              style={style2}
            >
              <Select mode="multiple" placeholder="请选择" style={{width: 400}} disabled={editable} allowClear
                onChange={(val, options) => {this.onChangeOption('coreNum', options);}}>
                {
                  _.map(conifgParams.core_num_list, (model) =>  <Select.Option value={model} key={model}>{model}</Select.Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item
              name={['coreNum', "defaultValue"]}
              label="默认值"
              // rules={[{required: this.state.typeUserSee.coreNum, message: '请选择' }]}
              style={style1}
            >
              <Select style={{width: 300}} disabled={editable} allowClear>
                {
                  _.map(selectedParams.coreNum, (options) =>  <Select.Option value={options.key} key={options.key}>{options.value}</Select.Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item
              name={['coreNum', "userSee"]}
              valuePropName="checked"
              style={style}>
              <Checkbox disabled={editable} onChange={(e) => {this.setUserSee('coreNum', e.target.checked);}}>用户可见</Checkbox>
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

export default MinResCpu;
