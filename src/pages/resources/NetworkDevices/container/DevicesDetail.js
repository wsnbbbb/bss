
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
  Input,
  DatePicker,
  Collapse,
  Spin,
  Modal,
  Row,
  Col,
  Select,
} from 'antd';
import { inject, observer} from 'mobx-react';
import {formItemLayout, formItemLayout2} from '@src/config/commvar'; // 全局通用变量
import {SYS_DICT_NET_DEVICE} from '@src/config/sysDict'; // 系统字典
import SeePort from './SeePort';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;

@inject('root')
@inject('deviceDict')
@inject('portDict')
@observer
class DevicesDetail extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    root: P.any,
    children: P.any,
    deviceDict: P.any,
    portDict: P.any,
    operateType: P.string,
    powers: P.array, // 当前登录用户权限
    deviceId: P.string, // 设备id
    data: P.any,  // 当前选中的信息
    visible: P.bool, // 弹框是否显示
    modalLoading: P.bool, // 添加/修改/查看 是否正在请求中
    onOk: P.func, // 弹框确认
    onClose: P.func, // 只关闭弹窗
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
      devideDetail: {
        devicePortList: []
      },
      uw: null,
      ubitInfo: {},
      regionInfo: {},
      cabinetInfo: {}
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

  /**
   * 获取设备详细）
   * @param {*} id 设备id
   */
  getDetail (id) {
    this.setState({
      modalLoading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/product/network/devices/${id}/get`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let data = res.data;
          this.formRefAdd.current.setFieldsValue({
            brand: data.brand,
            deviceName: data.deviceName,
            deviceSn: data.deviceSn,
            deviceType: data.deviceType,
            cabinetName: data.cabinetName,
            fullLocationName: data.fullLocationName,
            ip: data.ip,
            locationCode: data.locationCode,
            modelnumber: data.modelnumber,
            num: data.num,
            purchasingtime: moment(data.purchasingtime),
            remark: data.remark,
            startubat: data.startubat,
            status: data.status,
            storagetime: moment(data.storagetime),
            uw: data.uw,
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
    if (Object.keys(this.props.portDict.portprefix).length <= 0) {
      this.props.portDict.fetchPortPrefix();
    }
    if (Object.keys(this.props.deviceDict.devicebrand).length <= 0) {
      this.props.deviceDict.fetchDeviceBrand();
    }
    if (Object.keys(this.props.deviceDict.devicemodel).length <= 0) {
      this.props.deviceDict.fetchDeviceModel();
    }
    this.getDetail(this.props.deviceId);
    this.setState({
      showModal: true,
    });
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.setState({showModal: false});
  };

  render () {
    const { devicebrand, devicemodel } = this.props.deviceDict;
    const {devideDetail, showModal, modalLoading} = this.state;
    return (
      <React.Fragment>
        <Modal
          title="查看网络设备"
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
                  <FormItem label="设备名称" name="deviceName"
                    rules={[{ required: true}]}
                    {...formItemLayout}>
                    <Input
                      type="text"
                      disabled
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label={<span className="required"> U位</span>}
                    name="uw"
                    {...formItemLayout}>
                    <Input
                      disabled/>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label={<span className="required"> 区域</span>}
                    name="fullLocationName"
                    {...formItemLayout}>
                    <Input type="text" disabled />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label={<span className="required"> 机柜</span>}
                    name="cabinetName"
                    {...formItemLayout}>
                    <Input
                      type="text"
                      disabled
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label={<span className="required"> 位置码</span>}
                    name="locationCode"
                    {...formItemLayout}>
                    <Input
                      type="text"
                      disabled
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="管理IP" name="ip"
                    rules={[{ required: true}]}
                    {...formItemLayout}>
                    <Input
                      type="text"
                      disabled
                    />
                  </FormItem>
                </Col>

                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="设备类型" name="deviceType"
                    rules={[{ required: true}]}
                    {...formItemLayout}>
                    <Select disabled>
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
                    <Select
                      disabled>
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
                    <Select disabled>
                      {
                        _.map(devicemodel, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label={<span className="required"> 端口数量</span>}
                    name="num"
                    {...formItemLayout}>
                    <Input disabled/>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="采购时间" name="purchasingtime"
                    rules={[{ required: true}]}
                    {...formItemLayout}>
                    <DatePicker
                      style={{width: "100%"}}
                      disabled
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="入库时间" name="storagetime"
                    rules={[{ required: true}]}
                    {...formItemLayout}>
                    <DatePicker
                      style={{width: "100%"}}
                      disabled
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem label="备注" name="remark"
                    {...formItemLayout2}>
                    <TextArea
                      autoSize={{ minRows: 5}}
                      disabled
                    />
                  </FormItem>
                </Col>
              </Row>
            </Form>
            <Collapse defaultActiveKey={['1']}>
              <Collapse.Panel header="端口信息" key="1">
                <SeePort lists={devideDetail.devicePortList}/>
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
