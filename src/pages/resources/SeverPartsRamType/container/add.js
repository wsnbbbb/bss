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
  InputNumber,
} from "antd";
import { inject, observer } from "mobx-react";
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import {SYS_DICT_SERVERPART} from '@src/config/sysDict'; // 系统字典
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
    // form: P.any
  };
  constructor (props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
    };
  }

  componentDidMount () {}

  /** 点击关闭时触发 **/
  onClose = () => {
    this.props.pageUserstore.changeShowmodal("off");
  };
  onFinish = (value) => {
    if (this.props.operateType === "see") {
      // 是查看
      this.onClose();
      return;
    }
    if (this.props.operateType === "add") {
      this.props.onOk(value); // 新增
    }
    if (this.props.operateType === "up") {
      let id = this.props.nowData.id;
      this.props.edit(id, value);
    }
  };
  reset = () => {
    this.formRef.current.resetFields();
  };
  onChange = (value) => {
    this.setState({ value });
  };
  render () {
    const {
      operateType,
      nowData,
      lists,
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
    let { showmodal } = this.props.pageUserstore;

    return (
      <div>
        <Modal
          title={
            { add: "内存型号添加", up: "内存型号修改", see: "查看" }[
              operateType
            ]
          }
          maskClosable={false}
          width="60%"
          destroyOnClose
          visible={showmodal}
          onCancel={this.onClose}
          confirmLoading={this.state.modalLoading}
          footer={null}
        >
          <Form
            name="form_in_modal"
            ref={this.formRef}
            initialValues={nowData}
            onFinish={(value) => {
              this.onFinish(value);
            }}
            className="g-modal-field"
          >
            <Row>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="内存名称"
                  name="memName"
                  {...formItemLayout}
                >
                  <Input
                    disabled
                    placeholder="自动生成"
                  />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="内存校验"
                  name="memVerify"
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" }]}
                >
                  <Select
                    allowClear
                    placeholder="请选择内存校验"
                    disabled={operateType === "see"}
                  >
                    {_.map(SYS_DICT_SERVERPART.mem_verify, (value, key) => (
                      <Option value={parseInt(key)} key={key}>
                        {value}
                      </Option>
                    ))}
                  </Select>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="内存容量(GB)"
                  name="memSize"
                  rules={
                    [{ required: true, message: "必填" },
                      { pattern: regExpConfig.num, message: "请输入数字" },
                      { type: 'number', max: 99999, message: "最多输入5位数" },
                    ]}
                  {...formItemLayout}
                >
                  <InputNumber
                    placeholder="请输入内存容量"
                    disabled={operateType === "see"}
                    allowClear
                    width="50%"
                  />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="内存品牌"
                  name="memBrand"
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" }, { type: "string", max: 20, message: "最多输入20位字符" }]}
                >
                  <Input
                    allowClear
                    placeholder="请输入内存品牌"
                    disabled={operateType === "see"}
                  >
                  </Input>
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="内存类型"
                  name="memType"
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" }]}
                >
                  <Select
                    allowClear
                    placeholder="请选择内存类型"
                    disabled={operateType === "see"}
                  >
                    {_.map(SYS_DICT_SERVERPART.memory_type, (value, key) => (
                      <Option value={parseInt(key)} key={key}>
                        {value}
                      </Option>
                    ))}
                  </Select>
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="内存主频"
                  name="memHz"
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" },
                    { pattern: regExpConfig.num, message: "请输入数字" },
                    { type: "string", max: 6, message: "最多输入6位字符" },
                  ]}
                >
                  <Input
                    placeholder="请输入内存主频"
                    disabled={operateType === "see"}
                    allowClear
                  />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="内存型号"
                  name="memModel"
                  {...formItemLayout}
                  rules={[
                    { type: "string", max: 20, message: "最多输入20位字符" },
                  ]}
                >
                  <Input
                    placeholder="请输入内存型号"
                    disabled={operateType === "see"}
                    allowClear
                  />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="内存规格"
                  name="memSpec"
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" }]}
                >
                  <Select
                    allowClear
                    placeholder="请选择内存规格"
                    disabled={operateType === "see"}
                  >
                    {_.map(SYS_DICT_SERVERPART.mem_spec, (value, key) => (
                      <Option value={parseInt(key)} key={key}>
                        {value}
                      </Option>
                    ))}
                  </Select>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem label="备注" name="remark"   rules={[{ type: "string", max: 250, message: "最多输入250位字符" }]}>
                  <TextArea
                    placeholder="请输入备注"
                    disabled={operateType === "see"}
                    style={{ height: "100px" }}
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
                    style={
                      operateType === "see"
                        ? { display: "none" }
                        : { display: "inline-block" }
                    }
                  >
                    提交
                  </Button>
                  <Button
                    htmlType="reset"
                    className="action-btn ok"
                    onClick={this.reset}
                    style={
                      operateType === "see"
                        ? { display: "none" }
                        : { display: "inline-block" }
                    }
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
