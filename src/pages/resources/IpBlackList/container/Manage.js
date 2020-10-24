/* eslint-disable react/prop-types */
/** User 系统管理/用户管理 **/

// ==================
// 所需的各种插件
// ==================

import React from "react";
import P from "prop-types";
import {
  Form,
  Button,
  Input,
  Modal,
  Select,
  TreeSelect,
  Row,
  Col,
} from "antd";
import { inject, observer } from "mobx-react";


// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;


@inject("root")
@inject("authManage")
@inject("pageUserstore")
@observer
class RoleAdminContainer extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    userinfo: P.any,
    powers: P.array,
    updateLists: P.func,
    authManage: P.any,
    obj: P.any, // 选择的ip
    onOk: P.any, // 确认提交后的回调
    specialStatus: P.any, // 特殊状态
    pageUserstore: P.any,
    text: P.any, // 弹窗标题
    visible: P.any,
  };
  constructor (props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
    };
  }


  /** 模态框确定 **/
  onFinish = (value) => {
    this.props.onOk(value);
  };
  reset = () => {
    this.formRef.current.resetFields();
  };
  onClose = () => {
    this.props.onCancel();
  };
  render () {
    console.log(this.props);
    const {
      specialStatus,
      obj
    } = this.props;
    const me = this;
    const p = this.props.root.powers;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    return (
      <div>
        <Modal
          title={this.props.text}
          maskClosable={false}
          width="60%"
          destroyOnClose
          visible={this.props.visible}
          onCancel={this.onClose}
          footer={null}
        >
          <Form
            name="form_in_modal"
            ref={this.formRef}
            initialValues={obj}
            onFinish={(value) => {
              this.onFinish(value);
            }}
            className="g-modal-field"
          >
            <Row>
              <Col span={24}>
                <FormItem
                  label="ip名称"
                  name="ipAddr"
                  {...formItemLayout}
                >

                  <Input
                    disabled
                  />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  label="特殊状态"
                  name="specialStatus"
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" }]}
                >
                  <Select
                    allowClear
                    placeholder="请选择特殊状态"
                  >
                    {_.map(specialStatus, (value, key) => (
                      <Option value={key} key={key} style={key === '9' ? {display: 'none'} : {display: 'block'}}>
                        {value}
                      </Option>
                    ))}
                  </Select>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  label="备注"
                  name="remark"
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" }]}
                >
                  <TextArea
                    placeholder="请输入备注"
                    style={{height: '100px'}}
                    allowClear
                  />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <div className="actions-btn">
                  <Button
                    htmlType="submit"
                    className="action-btn ok"
                  >
                    提交
                  </Button>
                  <Button
                    htmlType="reset"
                    className="action-btn ok"
                    onClick={this.reset}
                  >
                    重置
                  </Button>
                  <Button onClick={this.onClose} className="action-btn ok">
                    取消
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  }
}
export default RoleAdminContainer;
