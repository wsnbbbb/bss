
/** 后台用户管理中心 实名认证列表 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import {
  Form,
  Button,
  Input,
  Spin,
  Modal,
  Row,
  Col,
  Select,
} from 'antd';
import { inject, observer } from 'mobx-react';
import { formItemLayout, formItemLayout2, formItemLayout4} from '@src/config/commvar'; // 全局通用变量
import { SYS_DICT_CUSTOMER } from '@src/config/sysDict';// 后台用户管理中心字典


// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { Option } = Select;

@inject('root')
@observer
class Check extends React.Component {
  static propTypes = {
    children: P.any,
    record: P.any, // 当前数据
    root: P.any, // 全局状态
  };
  formRefCheck = React.createRef();
  constructor (props) {
    super(props);
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

  onModalShow = () => {
    this.setState({
      showModal: true,
    });
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.setState({ showModal: false });
  };

  render () {
    const { auth_status, auth_type, auth_way, certificate_type, customer_period_status } = SYS_DICT_CUSTOMER;
    // eslint-disable-next-line react/prop-types
    const { record } = this.props;
    // eslint-disable-next-line react/prop-types
    const { showModal, modalLoading } = this.state;
    let imgsrc = 'http://bss2.oss-cn-hongkong.aliyuncs.com/' + this.props.record.businessImage;
    let imgsrc1 = 'http://bss2.oss-cn-hongkong.aliyuncs.com/' + this.props.record.frontImage;
    let imgsrc2 = 'http://bss2.oss-cn-hongkong.aliyuncs.com/' + this.props.record.backImage;
    let authType = this.props.record.authType;
    return (
      <React.Fragment>
        <Modal
          title="实名认证详情查看"
          maskClosable={false}
          width="90%"
          destroyOnClose
          footer={null}
          onCancel={this.onClose}
          visible={showModal}
        >
          <Spin tip="Loading..." spinning={modalLoading}>
            <Form name="form_in_modal"
              ref={this.formRefCheck}
              className="g-modal-field"
              initialValues={record}>
              <Row>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="email" label="用户邮箱"
                    rules={[{ required: true }]}
                    {...formItemLayout}>
                    <Input
                      // placeholder="自动生成"
                      type="text"
                      disabled
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="cardName" label="真实姓名/法人"
                    rules={[{ required: true }]}
                    {...formItemLayout}>
                    <Input
                      // placeholder="自动生成"
                      type="text"
                      disabled
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="cardNumber" label="证件号码"
                    rules={[{ required: true }]}
                    {...formItemLayout}>
                    <Input
                      type="text"
                      disabled
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="certificateType" label="证件类型"
                    rules={[{ required: true }]}
                    {...formItemLayout}>
                    <Select disabled>
                      {
                        _.map(certificate_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="authType" label="认证类型"
                    rules={[{ required: true }]}
                    {...formItemLayout}>
                    <Select disabled>
                      {
                        _.map(auth_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="authStatus" label="认证状态"
                    rules={[{ required: true }]}
                    {...formItemLayout}>
                    <Select disabled>
                      {
                        _.map(auth_status, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="authWay" label="认证方式"
                    rules={[{ required: true }]}
                    {...formItemLayout}>
                    <Select disabled>
                      {
                        _.map(auth_way, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </FormItem>
                </Col>
                {authType == 5 && <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="businessPeriod" label="经营期限"
                    rules={[{ required: true }]}
                    {...formItemLayout}>
                    <Input
                      type="text"
                      disabled
                    />
                  </FormItem>
                </Col>}
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="contactAddress" label="通讯地址"
                    // rules={[{ required: true }]}
                    {...formItemLayout}>
                    <Input
                      type="text"
                      disabled
                    />
                  </FormItem>
                </Col>
                {authType == 5 && <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="enterpriseName" label="企业名称"
                    rules={[{ required: true }]}
                    {...formItemLayout}>
                    <Input
                      type="text"
                      disabled
                    />
                  </FormItem>
                </Col>}
                {authType == 5 && <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="enterpriseTel" label="企业联系电话"
                    // rules={[{ required: true }]}
                    {...formItemLayout}>
                    <Input
                      type="text"
                      disabled
                    />
                  </FormItem>
                </Col>}
                {authType == 5 && <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="licenseLocation" label="执照所在地"
                    // rules={[{ required: true }]}
                    {...formItemLayout}>
                    <Input
                      type="text"
                      disabled
                    />
                  </FormItem>
                </Col>}
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="tel" label="联系方式/法人"
                    // rules={[{ required: true }]}
                    {...formItemLayout}>
                    <Input
                      type="text"
                      disabled
                    />
                  </FormItem>
                </Col>
                {authType == 5 && <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="uscc" label="统一社会信用代码"
                    rules={[{ required: true }]}
                    {...formItemLayout}>
                    <Input
                      type="text"
                      disabled
                    />
                  </FormItem>
                </Col>}
                {authType == 5 && <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem name="businessImage" label="营业执照照片或者扫描件"
                    rules={[{ required: true }]}
                    {...formItemLayout2}>
                    <img src={imgsrc} style={{  maxWidth: '80%', }}></img>
                  </FormItem>
                </Col>}
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem name="frontImage" label="个人/法人身份证正面"
                    rules={[{ required: true }]}
                    {...formItemLayout2}>
                    <img src={imgsrc1} style={{ maxWidth: '80%' }}></img>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem name="backImage" label="个人/法人身份证反面"
                    rules={[{ required: true }]}
                    {...formItemLayout2}>
                    <img src={imgsrc2} style={{maxWidth: '80%' }}></img>
                  </FormItem>
                </Col>
              </Row>
              <div className="actions-btn">
                <Button onClick={this.onClose} className="action-btn ok">关闭</Button>
              </div>
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
export default Check;
