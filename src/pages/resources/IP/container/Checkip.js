
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
  Spin,
  Modal,
  Row,
  Col,
  Select,
  Cascader
} from 'antd';
import { inject, observer} from 'mobx-react';
import {formItemLayout, formItemLayout2, apex} from '@src/config/commvar'; // 全局通用变量
import {SYS_DICT_IP} from '@src/config/sysDict';// ip资源字典

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;

@inject('root')
@inject("areaResouse")
@inject("CategoryProduct")
@inject("ipresourceDict")
@observer
class Checkip extends React.Component {
  static propTypes = {
    children: P.any,
    deviceId: P.string, // 当前旋转的id
    data: P.any,  // 当前选中的信息
    visible: P.bool, // 弹框是否显示
    modalLoading: P.bool, // 添加/修改/查看 是否正在请求中
    location: P.any, // 当前位置
    areaResouse: P.any, // 区域字典
    id: P.string, // 当前修改的ID
    ipresourceDict: P.any, // ip资源字典
    CategoryProduct: P.any, // ip资源字典
    root: P.any, // 全局状态
    onClose: P.func, // 关闭编辑弹窗
    onOK: P.func, // 修改成功后的回调
  };
  formRefCheck = React.createRef();
  constructor (props) {
    super(props);
    this.ports = [];
    this.state = {
      showModal: false,
      modalLoading: false,
    };
  }

  /**
   * 获取设备详细）
   * @param {*} id 设备id
   */
  getDetail (id) {
    this.setState({
      showModal: true,
      // modalLoading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/product/ipSegment?id=${id}`)
    // http.get(`http://10.3.9.24:8080/api/product/ipSegment?id=${id}`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let data = res.data.records[0];
          this.setState({
            ipAddr: data.ipAddr,
            ipCount: data.availableSegment,
            netmask: data.netmask,
            gateway: data.gateway,
            vlan: data.vlan,
            defenseValues: data.defenseValues,
            ipType: data.ipType,
          });

          let businessType = tools.getCascaderValues(this.props.CategoryProduct.categoryList, data.businessType, []);
          businessType = businessType.length > 0 ? _.reverse(businessType) : [];

          this.formRefCheck.current.setFieldsValue({
            purchasingTime: data.purchasingTime == null ? null : moment(data.purchasingTime),
            storagetime: data.storagetime == null ? null : moment(data.storagetime),
            fullLocationName: data.fullLocationName,
            ipSegment: data.ipSegment,
            masterProduct: data.masterProduct,
            businessType: businessType,
            isDefense: data.isDefense,
            defenseType: data.defenseType,
            defenseLine: data.defenseLine,
            isShare: data.isShare,
            bandwidthType: data.bandwidthTypeName,
            source: data.source,
            isLock: data.isLock,
            resStatus: data.resStatus,
            specialStatus: data.specialStatus,
            ipSegmentRemark: data.ipSegmentRemark,
            remark: data.remark,
            ipResourceremark: data.ipResourceremark,
            showType: data.showType,
            appropriateTypes: data.appropriateTypes,
            isWall: data.isWall,
          });
          this.setState({
            modalLoading: false,
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
    // 防御线路
    if (Object.keys(this.props.ipresourceDict.defenseline).length <= 0) {
      this.props.ipresourceDict.fetchdefenseline();
    }
    // 带宽类型
    if (Object.keys(this.props.ipresourceDict.bandwidthType).length <= 0) {
      this.props.ipresourceDict.fetchbandwidthType();
    }
    this.getDetail(this.props.deviceId);
    // this.onGetCategory();
    // this.setState({
    //   showModal: true,
    // });
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.setState({showModal: false});
  };

  // 获取类目数据
  onGetCategory () {
    http
      .get(`${BSS_ADMIN_URL}/api/goods/category`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let lists = res.data;
          let lists2 = [];
          lists2 = tools.formatTree(lists);
          this.setState({
            lists2: lists2,
          });
        } else {
          tools.dealFail(res);
        }
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }
  render () {
    const {defenseline, bandwidthType} = this.props.ipresourceDict;
    const {business_type, ip_source, ip_customer_type, ip_defense_type, show_type, ip_type, boolean} = SYS_DICT_IP;
    const {showModal, modalLoading, ipAddr, ipCount, netmask, gateway, vlan, defenseValues, ipType, lists2} = this.state;
    return (
      <React.Fragment>
        <Modal
          title="ip资源查看"
          maskClosable={false}
          width="80%"
          destroyOnClose
          footer={null}
          onCancel={this.onClose}
          visible={showModal}
        >
          <Spin tip="Loading..." spinning={modalLoading}>
            <Form name="form_in_modal"
              ref={this.formRefCheck}
              className="g-modal-field">
              <Row>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem  name="fullLocationName" label="机房/区域"
                    rules={[{ required: true}]}
                    {...formItemLayout}>
                    <Input
                      type="text"
                      disabled
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="businessType" label={<span className="required"> 所属业务</span>}
                    {...formItemLayout}>
                    <Cascader disabled options={this.props.CategoryProduct.categoryTreeList}  placeholder="请选择所属业务" fieldNames={{ label: 'name', value: 'id', children: 'children' }}/>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="bandwidthType" label={<span className="required"> 带宽类型</span>}
                    {...formItemLayout}>
                    <Select disabled >
                      {
                        _.map(bandwidthType, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="source" label={<span className="required"> ip来源</span>}
                    {...formItemLayout}>
                    <Select disabled>
                      {
                        _.map(ip_source, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </FormItem>
                </Col>

                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item name="appropriateTypes" rules={[{ required: true}]} {...formItemLayout} label="适用客户类型">
                    <Select disabled>
                      {
                        _.map(ip_customer_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item name="showType" rules={[{ required: true}]} {...formItemLayout} label="显示方式">
                    <Select disabled>
                      {
                        _.map(show_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item name="isWall" rules={[{ required: true}]} {...formItemLayout} label="是否过墙">
                    <Select disabled>
                      {
                        _.map(boolean, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item name="isLock" rules={[{ required: true}]} {...formItemLayout} label="是否锁定">
                    <Select disabled>
                      {
                        _.map(boolean, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="isShare" label={<span className="required"> 是否共享</span>}
                    {...formItemLayout}>
                    <Select disabled
                      allowClear placeholder=" "
                    >
                      {_.map(boolean, (value, key) => <Option value={parseInt(key)} key={key}>{value}</Option>)}
                    </Select>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="purchasingTime" label={<span className="required"> 采购时间</span>}
                    {...formItemLayout}>
                    <DatePicker placeholder=" "
                      style={{width: "100%"}}
                      disabled
                    />
                  </FormItem>
                </Col>

                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="storagetime" label={<span className="required"> 入库时间</span>}
                    {...formItemLayout}>
                    <DatePicker placeholder=" "
                      style={{width: "100%"}}
                      disabled
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem name="ipType" label={<span className="required"> ip信息</span>}
                    {...formItemLayout2}>
                    <div className="ipmsg">
                      <Select disabled value={ipType}
                        allowClear
                        style={{width: 100}}>
                        {_.map(ip_type, (value, key) => <Option value={parseInt(key)} key={key}>{value}</Option>)}
                      </Select>
                      <Input
                        placeholder="ip地址"
                        type="text"
                        disabled
                        value={ipAddr}
                      />
                      <Input
                        placeholder="可用ip"
                        type="text"
                        disabled
                        value={ipCount}
                      />
                      <Input
                        placeholder="掩码"
                        type="text"
                        disabled
                        value={netmask}
                      />
                      <Input
                        placeholder="网关"
                        type="text"
                        disabled
                        value={gateway}
                      />
                      <Input
                        placeholder="vlan"
                        type="text"
                        disabled
                        value={vlan}
                      />
                    </div>

                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem label="ip资源备注" name="remark"
                    {...formItemLayout2}>
                    <TextArea disabled
                      autoSize={{ minRows: 5}}
                      maxLength="240"
                    />
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </Spin>
        </Modal>
        <span onClick={this.onModalShow}>
          {this.props.children}
        </span>
      </React.Fragment>
    );
  }
}
export default Checkip;
