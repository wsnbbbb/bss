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
import { observable } from "mobx";
import tools from "@src/util/tools"; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const { TreeNode } = TreeSelect;
const { SHOW_PARENT } = TreeSelect;

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
    const { operateType, nowData, raid_type } = this.props;
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
            { add: "Raid型号添加", up: "Raid型号修改", see: "查看" }[
              operateType
            ]
          }
          maskClosable={false}
          width="50%"
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
                  label="Raid卡型号"
                  name="raidModel"
                  rules={[{ required: true, message: "必填" }, { type: 'string', max: 20, message: "最多输入20位字符" }]}
                  {...formItemLayout}
                >
                  <Input
                    placeholder="请输入Raid卡型号"
                    disabled={operateType === "see"}
                  />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="Raid卡类型"
                  name="raidType"
                  {...formItemLayout}
                  rules={[
                    { required: true, message: "必填" },
                  ]}
                >
                  {/**/}
                  <Select
                    allowClear
                    placeholder="请输入Raid卡类型"
                    disabled={operateType === "see"}
                  >
                    {_.map(raid_type, (value, key) => (
                      <Option key={key} value={parseInt(key)}>
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
                  label="Raid卡品牌"
                  name="raidBrand"
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" }, { type: 'string', max: 20, message: "最多输入20位字符" }]}
                >
                  <Input
                    allowClear
                    placeholder="请输入Raid卡品牌"
                    disabled={operateType === "see"}
                  ></Input>
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="缓存(MB)"
                  name="raidCache"
                  {...formItemLayout}
                  rules={[
                    { required: true, message: "必填" },
                    { pattern: regExpConfig.num, message: "请输入数字" },
                    { type: 'string', max: 6, message: "最多输入6位字符" },
                  ]}
                >
                  <Input
                    placeholder="请输入缓存"
                    disabled={operateType === "see"}
                  />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="名称"
                  name="raidName"
                  {...formItemLayout}
                  style={
                    operateType === "see"
                      ? { display: "flex" }
                      : { display: "none" }
                  }
                >
                  <Input
                    disabled={operateType === "see"}
                  />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem label="备注" name="remark"   rules={[{ max: 250, message: "最多输入250位字符" }]}>
                  <TextArea
                    placeholder="请输入备注"
                    disabled={operateType === "see"}
                    style={{ height: "100px" }}
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
