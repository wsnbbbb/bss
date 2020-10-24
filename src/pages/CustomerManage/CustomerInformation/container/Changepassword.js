
/** 资源管理/地区管理增 修 **/

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
} from 'antd';
import { inject, observer } from 'mobx-react';
import {  formItemLayout2 } from '@src/config/commvar'; // 工具


// ==================
// Definition
// ==================
const FormItem = Form.Item;

@inject('root')
@observer
class Changepassword extends React.Component {
  static propTypes = {
    root: P.any, // 全局状态
    operateType: P.string, // 操作类型
    powers: P.array, // 当前登录用户权限
    data: P.any,  // 当前选中的信息
    visible: P.bool, // 是否开启弹窗
    modalLoading: P.bool, // 添加/修改/查看 是否正在请求中
    onOk: P.func, // 确认提交回调
    onClose: P.func, // 关闭弹窗回调
    customerDict: P.any, // 客户字典
  };
  constructor (props) {
    super(props);
    this.formRef = React.createRef();
    this.parId = undefined; // value 在state中更新不及时，所以传递数据的上级接口存到parId
    this.state = {
      modalLoading: false,
      modalShowRegion: false,
    };
  }

  // 验证通过
  onFinish (values) {
    const { operateType, data } = this.props;
    let params = {
      ...values,
      id: data.id
    };
    if (params.passWord == params.fixpassWord) {
      {this.props.onOk(params);}
    } else {
      Modal.warning({
        title: "提示",
        content: "两次密码输入不一致，请重新输入！",
        destroyOnClose: true,
      });
      return false;
    }
  }

  // 修改密码时触发
  Changepassword (values) {
    console.log(event.target.value);
    let reExg = /^(?![A-Z]+$)(?![a-z]+$)(?![0-9]+$)[0-9A-Za-z]{6,20}$/;
    if (!reExg.test(event.target.value)) {
      Modal.warning({
        title: "提示",
        content: "请输入6-20个字符，包含大写字母、小写字母、数字至少2种",
        destroyOnClose: true,
      });
      this.formRef.current.setFieldsValue({
        passWord: null,
        fixpassWord: null
      });
      return false;
    } else {
      return true;
    }
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.formRef.current.resetFields();
  };

  /** 点击关闭时触发 **/
  onClose = () => {
    this.parId = -1;
    this.props.onClose();
  };


  /**
   * 确定选择指定地区
   * @param {string} id
   */
  onSelectRegion = (id) => {
    this.parId = id;
  }

  render () {
    const { operateType, data, modalLoading, visible } = this.props;
    console.log(data);
    return (
      <div>
        <Modal
          title="更改密码"
          maskClosable={false}
          width="50%"
          destroyOnClose
          footer={null}
          onCancel={this.props.onClose}
          visible={visible}
        >
          <Spin tip="Loading..." spinning={modalLoading}>
            <Form name="form_in_modal"
              ref={this.formRef}
              className="g-modal-field"
              onFinish={(values) => {this.onFinish(values);}}
              initialValues={data}>
              <Row>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem name="email" label="用户邮箱"
                    rules={[{ required: true}]}
                    {...formItemLayout2}>
                    <Input
                      // placeholder="自动生成"
                      type="text"
                      disabled
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem name="passWord" label="密码"
                    rules={[{ required: true, message: '请输入密码'}]}
                    {...formItemLayout2}>
                    <Input
                      // placeholder="自动生成"
                      type="password"
                      onBlur={(v) => this.Changepassword(v)}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem name="fixpassWord" label="确认密码"
                    rules={[{ required: true, message: '请再次输入密码'}]}
                    {...formItemLayout2}>
                    <Input
                      // placeholder="自动生成"
                      type="password"
                    />
                  </FormItem>
                </Col>
              </Row>
              <div className="actions-btn">
                {(operateType !== 'see') && <Button htmlType="submit" className="action-btn ok">确认</Button>}
                <Button onClick={this.onClose} className="action-btn ok">取消</Button>
              </div>
            </Form>
          </Spin>
        </Modal>
      </div>
    );
  }
}
export default Changepassword;
