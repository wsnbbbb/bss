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
  DatePicker,
} from "antd";
import { inject, observer } from "mobx-react";
import { observable } from "mobx";
import tools from "@src/util/tools"; // 工具
import moment from "moment";
import SleMod from "./SleMod";
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
  };
  constructor (props) {
    super(props);
    this.formRef = React.createRef();
    this.purchasingTime = moment(this.props.nowData.purchasingTime);
    this.storageTime = moment().format();
    this.state = {
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      flag: true,
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
      value.purchasingTime = this.purchasingTime;
      value.storageTime = this.storageTime;
      value.raidModelId = this.id;
      value.number = parseInt(value.number);
      this.props.onOk(value); // 新增
    }
    if (this.props.operateType === "up") {
      let id = this.props.nowData.id;
      value.purchasingTime = this.purchasingTime;
      if (this.state.flag === true) {
        value.raidModelId = this.props.raidModelId;
      } else {
        value.raidModelId = this.id;
      }
      this.props.edit(id, value);
    }
  };
  reset = () => {
    this.formRef.current.resetFields();
  };
  onChange = (value) => {
  };
  getPtime1 (data, dateString) {
    this.purchasingTime = data.format();

  }
  getPtime2 (data, dateString) {
    this.storageTime = dateString;
  }
  onSelect = (value) => {
    this.formRef.current.setFieldsValue({
      raidBrand: value[0].raidBrand,
      raidModelId: value[0].raidModel,
      raidType: this.props.raid_type[value[0].raidType],
    });
    this.id = value[0].id;
    this.setState({
      flag: false,
    });
  };
  render () {
    const {
      releaseStatus,
      source,
      house,
      operateType,
      nowData,
      sale_status,
      raid_type
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
            { add: "Raid卡入库", up: "Raid卡修改", see: "查看" }[operateType]
          }
          maskClosable={false}
          width="80%"
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
                  label="Raid卡编号"
                  name="raidCode"
                  {...formItemLayout}
                  style={
                    operateType === "see"
                      ? { display: "flex" }
                      : { display: "none" }
                  }
                >
                  <Input
                    // placeholder="请输入Raid卡编号"
                    disabled={operateType === "see"}
                  />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="位置码"
                  name="houseLocationCode"
                  {...formItemLayout}
                  style={
                    operateType === "see"
                      ? { display: "flex" }
                      : { display: "none" }
                  }
                >
                  <Input
                    placeholder="请输入位置码"
                    disabled={operateType === "see"}
                  />
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="机房"
                  name="houseId"
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" }]}
                >
                  <Select
                    allowClear
                    placeholder="请选择机房"
                    disabled={operateType === "see" || nowData.status === 1}
                  >
                    {house.map((item) => (
                      <Option value={item.id} key={item.id}>
                        {item.fullName}
                      </Option>
                    ))}
                  </Select>
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="数量"
                  name="number"
                  {...formItemLayout}
                  rules={
                    operateType === "add"
                      ? [
                        { required: true, message: "必填" },
                        { max: 4, message: "最多输入4位字符" },
                        { pattern: regExpConfig.num, message: "请输入数字" },
                      ]
                      : null
                  }
                >
                  <Input
                    placeholder="数量"
                    disabled={operateType === "see" || operateType === 'up'}
                  />
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label={<span className="required">Raid卡型号</span>}
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" }]}
                >
                  <FormItem
                    name="raidModelId"
                    rules={[
                      { required: true, message: "必填" },
                    ]}
                    style={{ display: "inline-block" }}
                  >
                    <Input
                      disabled
                      placeholder="请选择raid型号"
                    />
                  </FormItem>
                  <Button
                    style={
                      operateType === "see"
                        ? { display: "none" }
                        : { display: "inline-block" }
                    }
                    disabled={nowData.status === 1}
                  >
                    <SleMod operateType={operateType} onSelect={this.onSelect} raid_type={raid_type}>
                      选择
                    </SleMod>
                  </Button>
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="Raid卡品牌"
                  name="raidBrand"
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" }]}
                >
                  <Input disabled placeholder="请输入raid品牌" />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="raid卡类型"
                  name="raidType"
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" }]}
                >
                  <Input placeholder="请输入raid卡类型" disabled />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label={<span className="required">采购时间</span>}
                  {...formItemLayout}

                >
                  <FormItem
                    name="purchasingTime"
                    rules={[
                      { required: true, message: "必填" },
                    ]}
                  >
                    <DatePicker
                      onChange={(date, dateString) => {
                        this.getPtime1(date, dateString);
                      }}
                      disabled={operateType === "see" || operateType === 'up'}
                      style={{ display: "flex" }}
                    />
                  </FormItem>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="入库时间"
                  name="storageTime"
                  {...formItemLayout}
                >
                  <div>
                    <DatePicker
                      defaultValue={moment(nowData.storageTime)}
                      onChange={(date, dateString) => {
                        this.getPtime2(date, dateString);
                      }}
                      disabled
                      style={
                        {width: '100%'}
                      }
                    />
                  </div>
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="来源"
                  name="source"
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" }]}
                >
                  <Select
                    allowClear
                    placeholder="请选择来源"
                    disabled
                  >
                    {_.map(source, (value, key) => (
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
                  label="资源状态"
                  name="status"
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" }]}
                >
                  <Select
                    allowClear
                    placeholder="请选择资源状态"
                    disabled={operateType === "see" || nowData.status === 1}
                  >
                    {_.map(sale_status, (value, key) => (
                      <Option value={parseInt(key)} key={key} style={parseInt(key) === 1 ? {display: 'none'} : {display: 'block'}}>
                        {value.text}
                      </Option>
                    ))}
                  </Select>
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                {operateType === 'see' && <FormItem
                  label="服务器"
                  name="serverManagerIp"
                  {...formItemLayout}
                >
                  <Input  disabled placeholder="服务器"/>
                </FormItem>}
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
