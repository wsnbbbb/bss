
/** 资源管理/区域管理增 修 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import http from '@src/util/http';
import tools from '@src/util/tools';
import moment from 'moment';
import {
  Form,
  Button,
  Input,
  DatePicker,
  Collapse,
  Spin,
  Modal,
  Row,
  Col,
  Select,
  TreeSelect
} from 'antd';
import { inject, observer} from 'mobx-react';
import {formItemLayout, formItemLayout2} from '@src/config/commvar'; // 全局通用变量
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
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
class DevicesDetail extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    root: P.any,
    children: P.any,
    nodeMasterDict: P.any,
    operateType: P.string,
    deviceId: P.string, // 外机id
    powers: P.array, // 当前登录用户权限
  };
  formRefAdd = React.createRef();
  constructor (props) {
    super(props);
    this.state = {
      showModal: false,
      modalLoading: false,
      devideDetail: {},
    };
  }
  componentDidMount () {
  }
  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextState.someData !== this.state.someData;
  // }
  componentWillReceiveProps (nextProps) {
  }

  /**
   * 获取设备详细）
   * @param {*} id 设备id
   */
  getDetail (id) {
    this.setState({
      modalLoading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/product/nodeserver/master/${id}/get`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let data = res.data;
          this.formRefAdd.current.setFieldsValue({
            remark: data.remark,
            deviceBrand: data.deviceBrand,
            deviceModel: data.deviceModel,
            deviceSpec: data.deviceSpec,
            nodeNum: data.nodeNum,
            us: data.us,
            locationName: data.locationName,
            fullLocationName: data.locationName,
            cabinetName: data.cabinetName,
            purchasingTime: moment(data.purchasingtime),
            storageTime: moment(data.storagetime),
            name: data.name,
            positionalCode: data.positionalCode,
          });
          this.setState({
            modalLoading: false,
            devideDetail: data,
          });
        } else {
          tools.dealFail(res);
          this.setState({
            modalLoading: false,
          });
        }
      })
      .catch(() => {
        this.setState({
          modalLoading: false,
        });
      });
  }

  onModalShow = () => {
    this.getDetail(this.props.deviceId);
    this.setState({
      showModal: true,
    });
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.setState({showModal: false});
  };
  componentWillUnmount () {
  }

  render () {
    const { device_spec, device_brand, device_model } = this.props.nodeMasterDict;
    const {devideDetail, showModal, modalLoading} = this.state;
    return (
      <React.Fragment>
        <Modal
          title="查看外机"
          maskClosable={false}
          width="80%"
          destroyOnClose
          footer={null}
          onCancel={this.onClose}
          visible={showModal}
        >
          <Spin tip="Loading..." spinning={modalLoading}>
            <Form name="form_in_modal"
              ref={this.formRefAdd}
              className="g-modal-field">
              <Row>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="外机名称" name="name"
                    rules={[{ required: true}]}
                    {...formItemLayout}>
                    <Input
                      disabled
                      type="text"
                      placeholder="请输入"
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label={<span className="required"> 节点数</span>}
                    style={{marginBottom: 0}}
                    {...formItemLayout}>
                    <Form.Item
                      name="sortWay"
                      rules={[{ required: true, message: '请选择节点类型' }]}
                      style={{ display: 'inline-block', width: "33%" }}>
                      <Select placeholder="节点类型"
                        disabled
                        onChange={(e) => {this.resetNode('sortWay', e);}}>
                        <Option value="0">数字 (1)</Option>
                        <Option value="1">字母 (A)</Option>
                        <Option value="2">自定义</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      name="nodeNum"
                      rules={[{ required: true, message: '请输入节点数' }]}
                      style={{ display: 'inline-block', width: "34%" }}>
                      <Input placeholder="节点数"
                        disabled
                        onChange={(e) => {this.resetNode('nodeNum', e.target.value);}}
                        rules={[{ required: true,
                          pattern: regExpConfig.num,
                          message: '请输入数字' }]}/>
                    </Form.Item>
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
                      style={{ display: 'inline-block', width: 150 }}>
                      <Input
                        disabled
                        onChange={this.resetUw} />
                    </FormItem>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem
                    name="fullLocationName"
                    label={<span className="required"> 区域</span>}
                    {...formItemLayout}>
                    <Input
                      placeholder="地区/机房/区域(自动生成)"
                      type="text"
                      disabled
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label={<span className="required"> 机柜</span>}
                    name="cabinetName"
                    {...formItemLayout}>
                    <Input
                      placeholder="自动生成"
                      type="text"
                      disabled
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label={<span className="required"> 位置码</span>}
                    name="positionalCode"
                    {...formItemLayout}>
                    <Input
                      placeholder="自动生成"
                      type="text"
                      disabled
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item
                    name="deviceSpec" label="规格"
                    rules={[{ required: true, message: '请选择规格' }]}
                    {...formItemLayout}>
                    <Select disabled>
                      {
                        _.map(device_spec, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="设备品牌" name="deviceBrand"
                    rules={[{ required: true}]}
                    {...formItemLayout}>
                    <Select disabled>
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
                    <Select disabled>
                      {
                        _.map(device_model, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="采购时间" name="purchasingTime"
                    rules={[{ required: true}]}
                    {...formItemLayout}>
                    <DatePicker
                      disabled
                      style={{width: "100%"}}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="入库时间" name="storageTime"
                    rules={[{ required: true}]}
                    {...formItemLayout}>
                    <DatePicker
                      disabled
                      style={{width: "100%"}}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem label="备注" name="remark"
                    {...formItemLayout2}>
                    <TextArea
                      disabled
                      autoSize={{ minRows: 5}}
                      placeholder="请输入"
                    />
                  </FormItem>
                </Col>
              </Row>

            </Form>
            <Collapse defaultActiveKey={['1']}>
              <Collapse.Panel header="节点信息" key="1">
                <SeeNode nodeMasterId={this.props.deviceId}
                  canOpt
                  lists={devideDetail.nodeServerDetailList}/>
              </Collapse.Panel>
            </Collapse>
          </Spin>
        </Modal>
        <span onClick={this.onModalShow}>
          {this.props.children}
        </span>
      </React.Fragment>
    );
  }
}
export default DevicesDetail;
