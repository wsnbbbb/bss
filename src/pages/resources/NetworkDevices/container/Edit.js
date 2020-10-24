
/** 资源管理/区域管理增 修 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import http from '@src/util/http';
import tools from '@src/util/tools';
import {
  Form,
  Button,
  Input,
  Modal,
  Row,
  Col,
  Select,
  TreeSelect
} from 'antd';
import { inject, observer} from 'mobx-react';
import {formItemLayout, formItemLayout2} from '@src/config/commvar'; // 全局通用变量
import {SYS_DICT_NET_DEVICE} from '@src/config/sysDict'; // 系统字典
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import UBit from '@src/pages/resources/container/UBit';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;

@inject('root')
@inject('deviceDict')
@observer
class Edit extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    root: P.any,
    children: P.any,
    deviceDict: P.any,
    powers: P.array, // 当前登录用户权限
    onClose: P.func, // 关闭编辑弹窗
    onOk: P.func, // 修改成功后的回调
    deviceId: P.string, // 设备id
    defaultData: P.any, // 设备基础信息
  };
  constructor (props) {
    super(props);
    this.formRefEdit = React.createRef();
    this.devideDetail = this.props.defaultData;
    this.fullLocationName = this.props.defaultData.fullLocationName;
    this.locationCode = this.props.defaultData.locationCode;
    this.cabinetName = this.props.defaultData.cabinetName;
    this.state = {
      resetUw: false, // 标识U位是否被修改
      showModal: false,
      modalLoading: false,
      uw: null,
      ubitInfo: {},
      regionInfo: {},
      cabinetInfo: {},
      devideDetail: {},
      locationCode: undefined,
      portsLength: this.props.defaultData.num
    };
  }
  componentDidMount () {
    this.getDetail(this.props.deviceId);
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.deviceId != undefined && nextProps.deviceId !== this.props.deviceId) {
      this.getDetail(this.props.deviceId);
    }
  }

  // /**
  //  * 获取设备详细）
  //  * @param {*} id 设备id
  //  */
  getDetail (id) {
    this.setState({
      modalLoading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/product/network/devices/${id}/get`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let data = res.data;
          this.setState({
            modalLoading: false,
            devideDetail: data,
            locationCode: data.locationCode,
            fullLocationName: data.fullLocationName,
            cabinetName: data.cabinetName,
            portsLength: data.devicePortList.length,
          });
          this.formRefEdit.current.setFieldsValue({
            brand: data.brand,
            deviceName: data.deviceName,
            deviceType: data.deviceType,
            ip: data.ip,
            modelnumber: data.modelnumber,
            purchasingtime: moment(data.purchasingtime),
            remarks: data.remarks,
            status: data.status,
            storagetime: moment(data.storagetime),
            uw: data.uw,
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

  // 验证通过
  onFinish = (values) => {
    // console.log(values);
    if (!this.state.portsLength) {
      Modal.error({
        title: '请选择端口'
      });
      return false;
    }
    let networkDevicesUpdateReq = {
      ...values,
      version: this.props.defaultData.version,
    };
    // uw发生变更才提交u位相关信息
    if (this.state.resetUw) {
      networkDevicesUpdateReq = {
        ...networkDevicesUpdateReq,
        locationId: this.state.regionInfo.fullLocationId,
        cabinetId: this.state.cabinetInfo.id,
        startubat: this.state.ubitInfo.uw,
      };
    }
    this.props.onOk(networkDevicesUpdateReq);
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.formRefEdit.current.resetFields();
  };

  onModalshow = () => {
    this.setState({
      showModal: true
    });
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.props.onClose();
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

  // 选择机柜
  onSelectUBit = (val) => {
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

  // 修改端口数量(端口的增删修 放在子组件，所以数量从子组件传出来,如果父组件重新获取详情会导致用户修改但没有保存的数据丢失)
  savePort = (portsLength) => {
    this.setState({
      portsLength: portsLength
    });
  }
  render () {
    const { devicebrand, devicemodel } = this.props.deviceDict;
    const { uw, locationCode, fullLocationName, cabinetName, portsLength} = this.state;
    return (
      <React.Fragment>
        <Form name="form_in_modal"
          ref={this.formRefEdit}
          className="g-modal-field"
          initialValues={this.props.defaultData}
          onFinish={this.onFinish}>
          <Row>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="设备名称" name="deviceName"
                rules={[{ required: true}]}
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
                {...formItemLayout}>
                <FormItem name="uw"
                  rules={[{ required: true,
                    pattern: regExpConfig.isNozeroNumber,
                    message: '请输入占用U位数' }]}
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
                rules={[{ required: true}]}
                {...formItemLayout}>
                <Select>
                  {
                    _.map(SYS_DICT_NET_DEVICE.re_facility, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="设备品牌" name="brand"
                rules={[{ required: true}]}
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
                rules={[{ required: true}]}
                {...formItemLayout}>
                <Select>
                  {
                    _.map(devicemodel, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label={<span className="required"> 端口数量</span>}
                {...formItemLayout}>
                <FormItem
                  style={{ display: 'inline-block', width: 150 }}>
                  <Input
                    value={portsLength}
                    type="text"
                    disabled></Input>
                </FormItem>
                {/* <div style={{ display: 'inline-block', width: 90 }}>
                  <EditPort
                    deviceId={this.props.deviceId}
                    title="修改端口"
                    onSelect={this.savePort}>
                    <Button >修改端口</Button>
                  </EditPort>
                </div>
                <div style={{ display: 'inline-block', width: 90 }}>
                  <GeneratePort
                    deviceId={this.props.deviceId}
                    title="增加端口"
                    onSelect={this.savePort}>
                    <Button >增加端口</Button>
                  </GeneratePort>
                </div> */}
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <FormItem label="备注" name="remark"
                {...formItemLayout2}>
                <TextArea
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
        <span onClick={this.onModalshow}>{this.props.children}</span>
      </React.Fragment>
    );
  }
}
export default Edit;
