
/** 资源管理/区域管理增 修 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import tools from '@src/util/tools';
import {
  Form,
  Button,
  Input,
  DatePicker,
  InputNumber,
  Modal,
  Row,
  Col,
  Select
} from 'antd';
import { inject, observer} from 'mobx-react';
import {formItemLayout, formItemLayout2} from '@src/config/commvar'; // 全局通用变量
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import UBit from '@src/pages/resources/container/UBit';
import AddNode from './AddNode';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;

@inject('nodeMasterDict')
@observer
class Add extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    nodeMasterDict: P.any,
    powers: P.array, // 当前登录用户权限
    onOk: P.func, // 添加成功后的回调
    onClose: P.func, // 关闭弹窗
    defaultData: P.any, // 外机模板信息
    addType: P.string, // 入库类型：模板入库(tempadd)|普通入库（add）
  };
  formRefAdd = React.createRef();
  constructor (props) {
    super(props);
    this.nodeParam = { // 生成节点参数
      sortWay: undefined,
      nodeNum: this.props.addType == 'tempadd' ? this.props.defaultData.nodeNum : undefined,
    };
    this.defaultData = {};
    if (this.props.addType == 'tempadd') {
      this.defaultData = {
        deviceBrand: this.props.defaultData.deviceBrand,
        deviceModel: this.props.defaultData.deviceModel,
        deviceSpec: this.props.defaultData.deviceSpec,
        nodeNum: this.props.defaultData.nodeNum,
        remark: this.props.defaultData.remark,
        us: this.props.defaultData.us
      };
    }
    this.nodes = []; // 节点信息
    this.state = {
      uw: this.props.addType == 'tempadd' ? this.props.defaultData.us : null,
      ubitInfo: {},
      regionInfo: {},
      cabinetInfo: {},
      locationCode: undefined,
      nodeList: [],
    };
  }

  // 验证通过
  onFinish (values) {
    if (this.state.ubitInfo.uw == undefined) {
      Modal.error({
        title: '请选择U位'
      });
      return;
    }
    let nodeServerMasterAdd = {
      locationId: this.state.regionInfo.fullLocationId,
      cabinetId: this.state.cabinetInfo.id,
      startUs: this.state.ubitInfo.uw,
      ...values,
    };
    // 自定义节点
    if (values.sortWay == '2') {
      let nodes = [];
      _.map(this.state.nodeList, (item) => {
        nodes.push({
          id: item.id,
          name: item.node
        });
      });
      nodeServerMasterAdd = {
        ...nodeServerMasterAdd,
        nodeList: nodes
      };
    }
    this.props.onOk(nodeServerMasterAdd);
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.props.onClose();
  };

  /**
   * 重置uw值
   * 需要清除选中的机柜和区域信息
   */
  resetUw = (val) => {
    this.setState({
      uw: parseInt(val),
      ubitInfo: {},
      regionInfo: {},
      cabinetInfo: {},
      locationCode: undefined,
    });
  }
  // 重置设备
  resetNode = (name, value) => {
    this.nodeParam[name] = value;
    this.setState();
  }

  // 选择机柜
  onSelectUBit (val) {
    let enduw = val.uBitInfo.uw + this.state.uw - 1;
    let locationCode = `${val.regionInfo.fullLocationCode}-${val.cabinetInfo.row}-${val.cabinetInfo.coulmn}-${val.uBitInfo.uw}-${enduw}`;
    this.setState({
      ubitInfo: val.uBitInfo,
      regionInfo: val.regionInfo,
      cabinetInfo: val.cabinetInfo,
      locationCode: locationCode,
    });
  }

  // 节点信息保存
  saveNode (nodes) {
    this.setState({
      nodeList: nodes
    });
  }

  render () {
    const { uw, regionInfo, cabinetInfo, locationCode, nodeList} = this.state;
    const validateMessages = {
      required: "'${name}' 是必选字段",
    };
    return (
      <React.Fragment>
        <Form name="form_in_modal"
          ref={this.formRefAdd}
          className="g-modal-field"
          initialValues={this.defaultData}
          onFinish={(values) => {this.onFinish(values);}}
          validateMessages={validateMessages}>
          <Row>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label={<span className="required"> 节点数</span>}
                style={{marginBottom: 0}}
                {...formItemLayout}>
                <Form.Item
                  name="sortWay"
                  rules={[{ required: true, message: '请选择节点类型' }]}
                  style={{ display: 'inline-block', width: 120 }}>
                  <Select placeholder="节点类型"
                    onChange={(e) => {this.resetNode('sortWay', e);}}>
                    <Option value="0">数字 (1)</Option>
                    <Option value="1">字母 (A)</Option>
                    <Option value="2">自定义</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="nodeNum"
                  rules={[{ required: true, message: '请输入节点数' }]}
                  style={{ display: 'inline-block', width: 100 }}>
                  <InputNumber placeholder="节点数"
                    maxLength={2}
                    onChange={(value) => {this.resetNode('nodeNum', value);}}
                    rules={[{ required: true}]}/>
                </Form.Item>
                <div style={{ display: 'inline-block', width: 100 }}>
                  <AddNode
                    nodeParam={this.nodeParam}
                    title="节点编号"
                    lists={nodeList}
                    onSelect={(nodes) => {this.saveNode(nodes);}}>
                    <Button type="primary">节点编号</Button>
                  </AddNode>
                </div>

              </FormItem>
            </Col>

            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label={<span className="required"> U位</span>}
                style={{marginBottom: 0}}
                {...formItemLayout}>
                <FormItem name="us"
                  rules={[{ required: true,
                    pattern: regExpConfig.num,
                    message: '请输入数字' }]}
                  style={{ display: 'inline-block', width: 100 }}>
                  <InputNumber
                    onChange={this.resetUw} />
                </FormItem>
                <UBit uw={uw}
                  title="选择U位"
                  onSelect={(val) => {this.onSelectUBit(val);}}
                ><Button style={{width: 120}} disabled={!uw} type="primary">选择U位</Button>
                </UBit>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label={<span className="required"> 区域</span>}
                {...formItemLayout}>
                <Input
                  placeholder="地区/机房/区域(自动生成)"
                  type="text"
                  disabled
                  value={regionInfo.fullLocationName}
                />
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label={<span className="required"> 机柜</span>}
                {...formItemLayout}>
                <Input
                  placeholder="自动生成"
                  type="text"
                  disabled
                  value={cabinetInfo.name}
                />
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label={<span className="required"> 位置码</span>}
                {...formItemLayout}>
                <Input
                  placeholder="自动生成"
                  type="text"
                  disabled
                  value={locationCode}
                />
              </FormItem>
            </Col>

            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="设备品牌" name="deviceBrand"
                rules={[{ required: true, message: '请选择' }]}
                {...formItemLayout}>
                <Select>
                  {
                    _.map(this.props.nodeMasterDict.device_brand, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="设备型号" name="deviceModel"
                rules={[{ required: true, message: '请选择' }]}
                {...formItemLayout}>
                <Select>
                  {
                    _.map(this.props.nodeMasterDict.device_model, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="采购时间" name="purchasingTime"
                rules={[{ required: true, message: '请选择' }]}
                {...formItemLayout}>
                <DatePicker
                  style={{width: "100%"}}
                />
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <Form.Item
                name="deviceSpec" label="规格"
                rules={[{ required: true, message: '请选择规格' }]}
                {...formItemLayout}>
                <Select>
                  {
                    _.map(this.props.nodeMasterDict.device_spec, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <FormItem label="备注" name="remark"
                {...formItemLayout2}>
                <TextArea
                  autoSize={{ minRows: 5}}
                  placeholder="请输入"
                  maxLength={250}
                />
              </FormItem>
            </Col>
          </Row>
          <div className="actions-btn">
            <Button htmlType="submit" className="action-btn ok">确认提交</Button>
            <Button onClick={this.onClose} className="action-btn ok">取消</Button>
          </div>
        </Form>
      </React.Fragment>
    );
  }
}
export default Add;
