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
} from 'antd';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router';
import { User } from '@src/util/user.js';
import { formItemLayout2 } from '@src/config/commvar'; // 全局通用变量
import { SYS_DICT_CUSTOMER } from '@src/config/sysDict';// 后台用户管理中心字典

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { Option } = Select;
@withRouter
@inject('root')

@observer
class Personal extends React.Component {
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
      lists: [],
      loading: false,
      showModal: false,
      pageNum: 1, // 当前第几页
      page_size: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      pages: 0,
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
    let obj = {
      ...values,
      frontImage: 'http://bss2.oss-cn-hongkong.aliyuncs.com/' + values.frontImage
    };
    console.log(obj);
    this.props.onOCR(obj);
  };

  handleChange = (editorState) => {
    this.setState({ editorState });
  }

  render () {
    const defaultData = {
      ...this.props.defaultData,
    };
    let imgsrc1 = 'http://bss2.oss-cn-hongkong.aliyuncs.com/' + this.props.defaultData.frontImage;
    let imgsrc2 = 'http://bss2.oss-cn-hongkong.aliyuncs.com/' + this.props.defaultData.backImage;
    const { certificate_type, customer_period_status } = SYS_DICT_CUSTOMER;
    return (
      <Form name="form_in_modal"
        ref={this.formRefEdit}
        className="g-modal-field"
        initialValues={defaultData}
        onFinish={(values) => {this.onFinish(values);}}>
        <FormItem name="email" label="用户邮箱"
          rules={[{ required: true }]}
          {...formItemLayout2}>
          <Input
            type="text"
            disabled
          />
        </FormItem>
        <FormItem name="cardName" label="真实姓名"
          rules={[{ required: true }]}
          {...formItemLayout2}>
          <Input
            type="text"
            disabled
          />
        </FormItem>
        <FormItem name="certificateType" label="证件类型"  rules={[{ required: true }]}
          {...formItemLayout2}>
          <Select disabled>
            {
              _.map(certificate_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
            }
          </Select>
        </FormItem>
        <FormItem name="cardNumber" label="证件号码"
          rules={[{ required: true }]}
          {...formItemLayout2}>
          <Input
            type="text"
            disabled
          />
        </FormItem>
        <FormItem name="tel" label="联系方式"
          {...formItemLayout2}>
          <Input
            type="text"
            disabled
          />
        </FormItem>
        <FormItem name="contactAddress" label="通讯地址"
          {...formItemLayout2}>
          <Input
            type="text"
            disabled
          />
        </FormItem>
        <FormItem name="frontImage" label="请上传实名材料"
          // rules={[{ required: true }]}
          {...formItemLayout2}>
          <p style={{ marginTop: '5px' }}>个人手持身份证头像面彩色照,照片上所有信息需要清晰可见，内容真实有效，不得做任何修改,照片支持JPG,JPEG,大小不超过1M</p>
          <img src={imgsrc1} style={{ maxWidth: '80%' }}></img>
          <p style={{ marginTop: '15px' }}>个人手持身份证国徽面彩色照,照片上所有信息需要清晰可见，内容真实有效，不得做任何修改,照片支持JPG,JPEG,大小不超过1M</p>
          <img src={imgsrc2} style={{ maxWidth: '80%' }}></img>
        </FormItem>
        <div className="actions-btn">
          {User.hasPermission('customerAuth-auditOK') && <Button onClick={() => {this.onFinishok();}} className="action-btn ok">审核通过</Button>}
          {User.hasPermission('customerAuth-auditError') && <Button onClick={() => {this.onFail();}} className="action-btn ok">审核失败</Button>}
          {User.hasPermission('customerAuth-idcard') && <Button htmlType="submit" className="action-btn ok">OCR审核</Button>}
        </div>
      </Form>
    );
  }
}
export default Personal;


