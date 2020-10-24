/* eslint-disable no-duplicate-imports */
/* eslint-disable react/prop-types */

/** 后台用户管理中心 实名认证列表 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import 'braft-editor/dist/index.css';
import BraftEditor from 'braft-editor';
import {
  Form,
  Button,
  Input,
  Select,
  Row,
  Col,
} from 'antd';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router';
import { User } from '@src/util/user.js';
import { formItemLayout, formItemLayout2, formItemLayout4} from '@src/config/commvar'; // 全局通用变量
import { SYS_DICT_CUSTOMER } from '@src/config/sysDict';// 后台用户管理中心字典
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { Option } = Select;
@withRouter
@inject('root')

@observer
class Enterprise extends React.Component {
  static propTypes = {
    location: P.any, // 路径
    history: P.any,
    match: P.any,
    root: P.any, // 全局状态
    defaultData: P.any,  // 当前选中的信息
    onOk: P.func, // 弹框确认
    onClose: P.func, // 只关闭弹窗
    onFail: P.func, // 审核失败回调
    id: P.any, // 当前id
    that: P.any, // 父组件对象
  };
  // formRefAdd = React.createRef();
  constructor (props) {
    super(props);
    this.selectedRowKeys = [];// 选中的key
    this.formRefEdit = React.createRef();
    this.searchCondition = {};
    this.state = {
      selectedRowKeys: [],
      editorState: BraftEditor.createEditorState(null)
    };
  }


  /** 点击关闭时触发 **/
  onClose = () => {
    this.props.onClose();
  };
  selectedRow = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRowKeys
    });
  }


  // 审核通过
  onFinishok () {
    this.props.onOk();
  };


  // 审核失败
  onFail () {
    this.props.onFail();
  }

  // OCR审核
  onFinish (values) {
    console.log(values);
    let obj = {
      ...values,
      businessImage: 'http://bss2.oss-cn-hongkong.aliyuncs.com/' + values.businessImage
    };
    console.log(obj);
    this.props.onOCR(obj);
  };


  handleChange = (editorState) => {
    this.setState({ editorState });
  }

  render () {
    const { defaultData, id } = this.props;
    const {  certificate_type, customer_period_status } = SYS_DICT_CUSTOMER;
    console.log(this.props);
    let imgsrc = 'http://bss2.oss-cn-hongkong.aliyuncs.com/' + this.props.defaultData.businessImage;
    let imgsrc1 = 'http://bss2.oss-cn-hongkong.aliyuncs.com/' + this.props.defaultData.frontImage;
    let imgsrc2 = 'http://bss2.oss-cn-hongkong.aliyuncs.com/' + this.props.defaultData.backImage;
    return (
      <Form name="form_in_modal"
        ref={this.formRefEdit}
        className="g-modal-field"
        initialValues={defaultData}
        onFinish={(values) => {this.onFinish(values);}}>
        <Row>
          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <FormItem name="uscc" label="统一社会信用代码"
              rules={[{ required: true }]}
              {...formItemLayout}>
              <Input
                type="text"
                disabled
              />
            </FormItem>
          </Col>
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
            <FormItem name="businessPeriod" label="经营期限"
              rules={[{ required: true }]}
              {...formItemLayout}>
              <Input
                type="text"
                disabled
              />
            </FormItem>
          </Col>
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
          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <FormItem name="enterpriseName" label="企业名称"
              rules={[{ required: true }]}
              {...formItemLayout}>
              <Input
                type="text"
                disabled
              />
            </FormItem>
          </Col>
          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <FormItem name="enterpriseTel" label="企业联系电话"
              // rules={[{ required: true }]}
              {...formItemLayout}>
              <Input
                type="text"
                disabled
              />
            </FormItem>
          </Col>
          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <FormItem name="licenseLocation" label="执照所在地"
              // rules={[{ required: true }]}
              {...formItemLayout}>
              <Input
                type="text"
                disabled
              />
            </FormItem>
          </Col>
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
          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <FormItem name="businessImage" label="营业执照照片或者扫描件"
              rules={[{ required: true }]}
              {...formItemLayout2}>
              <img src={imgsrc} style={{ maxWidth: '80%', }}></img>
            </FormItem>
          </Col>
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
              <img src={imgsrc2} style={{ maxWidth: '80%' }}></img>
            </FormItem>
          </Col>
        </Row>
        <div className="actions-btn">
          {User.hasPermission('customerAuth-auditOK') && <Button onClick={() => {this.onFinishok();}} className="action-btn ok">审核通过</Button>}
          {User.hasPermission('customerAuth-auditError') && <Button onClick={() => {this.onFail();}} className="action-btn ok">审核失败</Button>}
          {User.hasPermission('customerAuth-businessLicense') && <Button htmlType="submit" className="action-btn ok">OCR审核</Button>}
        </div>
      </Form>
    );
  }
}
export default Enterprise;


