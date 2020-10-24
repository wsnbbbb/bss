
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
  DatePicker,
  Spin,
  Modal,
  Row,
  Col,
  Select
} from 'antd';
import { inject, observer} from 'mobx-react';
import {formItemLayout, formItemLayout2} from '@src/config/commvar'; // 全局通用变量
import {SYS_DICT_NET_DEVICE} from '@src/config/sysDict'; // 系统字典
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import UBit from '@src/pages/resources/container/UBit';
import AddPort from './AddPort';
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;

@inject('deviceDict')
@observer
class Add extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    deviceDict: P.any,
    updateList: P.func, // 添加成功后的回调
    children: P.any,
  };
  formRefAdd = React.createRef();
  constructor (props) {
    super(props);
    this.PortTempParam = { // 获取端口模板参数
      deviceModelId: undefined,
      deviceType: undefined
    };
    this.ports = [];
    this.state = {
      showModal: false,
      modalLoading: false,
      uw: null,
      ubitInfo: {},
      regionInfo: {},
      cabinetInfo: {},
      locationCode: undefined,
    };
  }
  componentDidMount () {
  }
  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextState.someData !== this.state.someData;
  // }
  componentWillReceiveProps (nextProps) {
    // if (nextProps.data !== this.props.data) {
    //   this.setState({
    //     value: nextProps.data.parId
    //   });
    // }
  }

  // 验证通过
  onFinish (values) {
    if (this.ports.length <= 0) {
      Modal.error({
        title: '请选择端口'
      });
      return;
    }
    if (this.state.ubitInfo.uw == undefined) {
      Modal.error({
        title: '请选择U位'
      });
      return;
    }
    const param = {
      networkDevicesAddReq: {
        locationId: this.state.regionInfo.fullLocationId,
        cabinetId: this.state.cabinetInfo.id,
        startubat: this.state.ubitInfo.uw,
        ...values,
      },
      devicePortReqList: this.ports,
    };
    this.setState({
      modalLoading: true,
    });
    http.post(`${BSS_ADMIN_URL}/api/product/stock/add`, param)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          tools.auto_close_result('ok', '操作成功');
          this.setState({
            modalLoading: false,
            showModal: false,
          });
          this.props.updateList();
        } else {
          tools.dealFail(res);
        }
        this.setState({ modalLoading: false });
      })
      .catch(() => {
        this.setState({ modalLoading: false });
      });
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.formRefAdd.current.resetFields();
  };

  onModalshow = () => {
    this.setState({
      showModal: true
    });
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.setState({showModal: false});
  };

  /**
   * 重置uw值
   * 需要清除选中的机柜和区域信息
   */
  resetUw = (e) => {
    let val =  e.target.value;
    if (val == this.state.uw) {
      return;
    }
    this.setState({
      uw: parseInt(val),
      ubitInfo: {},
      regionInfo: {},
      cabinetInfo: {},
      locationCode: undefined,
    });
  }
  // 重置设备类型或者型号
  resetDeviceTM = (name, value) => {
    this.PortTempParam[name] = value;
  }

  // 选择机柜
  onSelectUBit = (val) => {
    let enduw = val.uBitInfo.uw + this.state.uw - 1;
    let locationCode = `${val.regionInfo.fullLocationCode}-${val.cabinetInfo.row}-${val.cabinetInfo.coulmn}-${val.uBitInfo.uw}U-${enduw}U`;
    this.setState({
      ubitInfo: val.uBitInfo,
      regionInfo: val.regionInfo,
      cabinetInfo: val.cabinetInfo,
      locationCode: locationCode,
    });
  }

  // 管理端口保存
  savePort (ports) {
    this.formRefAdd.current.setFieldsValue({
      num: ports.length
    });
    this.ports = ports;
  }

  render () {
    const { devicebrand, devicemodel } = this.props.deviceDict;
    const { uw, regionInfo, cabinetInfo, locationCode, showModal, modalLoading} = this.state;
    const validateMessages = {
      required: "'${name}' 是必选字段",
    };
    return (
      <React.Fragment>
        <Modal
          title="新增网络设备"
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
              className="g-modal-field"
              onFinish={(values) => {this.onFinish(values);}}
              validateMessages={validateMessages}>
              <Row>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="设备名称" name="deviceName"
                    rules={[{ required: true, message: '请输入设备名称'}]}
                    {...formItemLayout}>
                    <Input
                      maxLength={60}
                      type="text"
                      placeholder="请输入"
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label={<span className="required"> U位</span>}
                    style={{marginBottom: 0}}
                    {...formItemLayout}>
                    <FormItem name="uw"
                      rules={[{ required: true,
                        pattern: regExpConfig.num,
                        message: '请输入数字' }]}
                      style={{ display: 'inline-block', width: 150 }}>
                      <Input
                        maxLength={2}
                        onChange={this.resetUw} />
                    </FormItem>
                    <UBit uw={uw}
                      title="选择U位"
                      onSelect={(val) => {this.onSelectUBit(val);}}
                    ><Button style={{width: 120}} disabled={!uw}>选择U位</Button></UBit>
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
                  <FormItem label="管理IP" name="ip"
                    rules={[{ required: true,
                      pattern: regExpConfig.ipv4,
                      message: '请输入合法的ipv4地址' }]}
                    {...formItemLayout}>
                    <Input
                      type="text"
                    />
                  </FormItem>
                </Col>

                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="设备类型" name="deviceType"
                    rules={[{ required: true, message: '请选择设备类型'}]}
                    {...formItemLayout}>
                    <Select
                      onChange={(val) => {this.resetDeviceTM('deviceType', val);}}>
                      {
                        _.map(SYS_DICT_NET_DEVICE.re_facility, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="设备品牌" name="brand"
                    rules={[{ required: true, message: '请选择设备品牌'}]}
                    {...formItemLayout}>
                    <Select>
                      {
                        _.map(devicebrand, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="设备型号" name="modelnumber"
                    rules={[{ required: true, message: '请选择设备型号'}]}
                    {...formItemLayout}>
                    <Select
                      onChange={(val) => {this.resetDeviceTM('deviceModelId', val);}}>
                      {
                        _.map(devicemodel, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label={<span className="required"> 端口数量</span>}
                    style={{marginBottom: 0}}
                    {...formItemLayout}>
                    <FormItem name="num"
                      style={{ display: 'inline-block', width: 150 }}>
                      <Input disabled/>
                    </FormItem>
                    <div style={{ display: 'inline-block', width: 150 }}>
                      <AddPort
                        PortTempParam={this.PortTempParam}
                        title="生成端口"
                        onSelect={(ports) => {this.savePort(ports);}}>
                        <Button >生成端口</Button>
                      </AddPort>
                    </div>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="采购时间" name="purchasingtime"
                    rules={[{ required: true, message: '请选择采购时间'}]}
                    {...formItemLayout}>
                    <DatePicker
                      style={{width: "100%"}}
                    />
                  </FormItem>
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
                <Button onClick={this.onResetSearch} className="action-btn ok">重置</Button>
                <Button onClick={this.onClose} className="action-btn ok">取消</Button>
              </div>
            </Form>
          </Spin>
        </Modal>
        <span onClick={this.onModalshow}>{this.props.children}</span>
      </React.Fragment>
    );
  }
}
export default Add;
