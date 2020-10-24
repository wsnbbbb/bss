
/** 资源管理/区域管理增 修 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import http from '@src/util/http';
import tools from '@src/util/tools';
import {
  Form,
  Button,
  Input,
  InputNumber,
  Modal,
  Row,
  Col,
  Select,
  TreeSelect
} from 'antd';
import { inject, observer} from 'mobx-react';
import {formItemLayout, formItemLayout2} from '@src/config/commvar'; // 全局通用变量
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import UBit from '@src/pages/resources/container/UBit';
import EditNode from './EditNode';
import SeeNode from './SeeNode';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;

@inject('root')
@inject('nodeMasterDict')
@observer
class Edit extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    children: P.any,
    root: P.any,
    nodeMasterDict: P.any,
    powers: P.array, // 当前登录用户权限
    onOk: P.func, // 添加成功后的回调
    defaultData: P.any, // 添加成功后的回调
    onClose: P.func, // 关闭弹窗
    deviceId: P.string, // 设备id
  };
  formRefEdit = React.createRef();
  constructor (props) {
    super(props);
    this.nodeParam = { // 生成节点参数
      sortWay: this.props.defaultData.sortWay,
      nodeNum: this.props.defaultData.nodeNum
    };
    this.devideDetail = this.props.defaultData;
    this.nodes = []; // 节点信息
    if (this.props.defaultData.nodeServerDetailList && this.props.defaultData.nodeServerDetailList.length > 0) {
      _.map(this.props.defaultData.nodeServerDetailList, (item, index) => {
        this.nodes.push({
          node: item.node,
          id: item.id
        });
      });
    }
    this.state = {
      nodeNumDisabled: this.props.defaultData.sortWay === undefined, // 选择节点类型 才可以查看和修改节点编号
      showNodeModal: false,
      resetUw: false,
      modalLoading: false,
      uw: this.props.defaultData.us, // u位数 用于u位数做对比，判断u位数是否发生改变
      ubitInfo: {
        uw: this.props.defaultData.startUs, // 起始U位
      },
      regionInfo: {},
      cabinetInfo: {},
      locationCode: this.props.defaultData.positionalCode,
      fullLocationName: this.props.defaultData.locationName,
      cabinetName: this.props.defaultData.cabinetName
    };
  }
  componentDidMount () {
  }
  // 验证通过
  onFinish (values) {
    if (this.state.ubitInfo.uw == undefined) {
      Modal.error({
        title: '请选择U位'
      });
      return;
    }
    let nodeServerMasterUpdate = {
      sortWay: null, // 不修改sortWay情况下 传null 则后端不处理nodenum
      ...values,
      version: this.props.defaultData.version,
    };
    if (nodeServerMasterUpdate.sortWay == '2') {
      nodeServerMasterUpdate = {
        ...nodeServerMasterUpdate,
        nodeList: this.nodes
      };
    }
    // uw发生变更才提交u位相关信息
    if (this.state.resetUw) {
      nodeServerMasterUpdate = {
        ...nodeServerMasterUpdate,
        locationId: this.state.regionInfo.fullLocationId,
        cabinetId: this.state.cabinetInfo.id,
        startubat: this.state.ubitInfo.uw,
      };
    }
    this.props.onOk(nodeServerMasterUpdate);
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.formRefEdit.current.resetFields();
  };

  // 显示节点
  onShowNodeModal = () => {
    this.setState({
      showNodeModal: true,
    });
  }
  onCloseNode = () => {
    this.setState({
      showNodeModal: false,
    });
  }

  /**
   * 重置uw值
   * 需要清除选中的机柜和区域信息
   */
  resetUw = (value) => {
    let val =  value;
    if (val == this.state.uw) {
      return;
    }
    this.setState({
      resetUw: true,
      uw: parseInt(val),
      ubitInfo: {},
      regionInfo: {},
      cabinetInfo: {},
      locationCode: undefined,
      fullLocationName: undefined,
      cabinetName: undefined
    });
  }
    // 重置节点类型或者节点数发生改变
    resetNode = (name, value) => {
      if (name == 'sortWay' && this.state.nodeNumDisabled) {
        this.setState({
          nodeNumDisabled: false
        });
      }
      this.nodeParam[name] = value;
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
        fullLocationName: val.regionInfo.fullLocationName,
        cabinetName: val.cabinetInfo.name,
      });
    }

    // 节点保存
    saveNode (nodes) {
      this.nodes = nodes;
    }

    render () {
      const { device_spec, device_brand, device_model } = this.props.nodeMasterDict;
      const {uw, locationCode, fullLocationName, cabinetName} = this.state;
      const validateMessages = {
        required: "'${name}' 是必选字段",
      };
      console.log(this.nodeParam.sortWay);
      return (
        <React.Fragment>
          <Form name="form_in_modal"
            ref={this.formRefEdit}
            className="g-modal-field"
            initialValues={this.devideDetail}
            onFinish={(values) => {this.onFinish(values);}}
            validateMessages={validateMessages}>
            <Row>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem label={<span className="required"> 节点数</span>}
                  style={{marginBottom: 0}}
                  {...formItemLayout}>
                  <Form.Item
                    name="sortWay"
                    style={{ display: 'inline-block', width: 100 }}>
                    <Select placeholder="节点类型" disabled={this.devideDetail.status == 1}
                      onChange={(e) => {this.resetNode('sortWay', e);}}>
                      <Option value="0">数字 (1)</Option>
                      <Option value="1">字母 (A)</Option>
                      <Option value="2">自定义</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name="nodeNum" disabled={this.devideDetail.status == 1}
                    rules={[{ required: true, message: '请输入节点数' }]}
                    style={{ display: 'inline-block', width: 100 }}>
                    <InputNumber placeholder="节点数"
                      maxLength={2}
                      onChange={(value) => {this.resetNode('nodeNum', value);}}
                      disabled={this.state.nodeNumDisabled}/>
                  </Form.Item>
                  <Button style={{ display: 'inline-block', width: 80, marginRight: 10 }} onClick={this.onShowNodeModal} type="primary">修改节点</Button>
                  <div style={{ display: 'inline-block', width: 80 }}>
                    <EditNode
                      nodeParam={this.nodeParam}
                      defaultValues={this.nodes}
                      title="节点编号"
                      onSelect={(nodes) => {this.saveNode(nodes);}}>
                      <Button type="primary">节点编号</Button>
                    </EditNode>
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
                      disabled={this.devideDetail.status == 1}
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
                    value={fullLocationName}
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
                    value={cabinetName}
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
                  rules={[{ required: true}]}
                  {...formItemLayout}>
                  <Select disabled={this.devideDetail.status == 1}>
                    {
                      _.map(device_brand, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                    }
                  </Select>
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem label="设备型号" name="deviceModel"
                  rules={[{ required: true}]}
                  {...formItemLayout}>
                  <Select disabled={this.devideDetail.status == 1}>
                    {
                      _.map(device_model, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                    }
                  </Select>
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <Form.Item
                  name="deviceSpec" label="规格"
                  rules={[{ required: true, message: '请选择规格' }]}
                  {...formItemLayout}>
                  <Select disabled={this.devideDetail.status == 1}>
                    {
                      _.map(device_spec, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                    }
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <FormItem label="备注" name="remark"
                  {...formItemLayout2}>
                  <TextArea
                    maxLength={250}
                    autoSize={{ minRows: 5}}
                    placeholder="请输入"
                  />
                </FormItem>
              </Col>
            </Row>
            <div className="actions-btn">
              <Button htmlType="submit" className="action-btn ok">确认提交</Button>
              {/* <Button onClick={this.onResetSearch} className="action-btn ok">重置</Button> */}
              <Button onClick={this.props.onClose} className="action-btn ok">取消</Button>
            </div>
          </Form>
          <Modal
            title="节点信息"
            maskClosable={false}
            width="90%"
            destroyOnClose
            footer={null}
            onCancel={this.onCloseNode}
            visible={this.state.showNodeModal}
            modalLoading={this.state.modalLoading}>
            <SeeNode canOpt nodeMasterId={this.props.defaultData.id} lists={this.devideDetail.nodeServerDetailList}/>
          </Modal>
        </React.Fragment>
      );
    }
}
export default Edit;
