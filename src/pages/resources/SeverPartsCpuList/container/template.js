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
  Table,
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
    // updateLists: P.func,
    // form: P.any
  };
  constructor (props) {
    super(props);
    this.formRef = React.createRef();
    this.purchasingTime = "";
    this.storageTime = moment().format();
    this.state = {
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      flag: true,
      tFlag: true, // 采购时间
    };
  }

  componentDidMount () {}

  onClose = () => {
    this.props.onCancel();
  };
  onFinish = (value) => {
    value.storageTime = this.storageTime;
    if (this.state.flag === true) {
      value.cpuModelId = this.props.cpuModelId;
    } else {
      value.cpuModelId = this.id;
      // value.purchasingTime = this.purchasingTime;
    }
    if (this.state.tFlag === true) {
      console.log(value.purchasingTime);
    } else {
      value.purchasingTime = this.purchasingTime;
    }
    this.props.onOk(value); // 新增
  };
  reset = () => {
    this.formRef.current.resetFields();
  };
  getPtime1 (data, dateString) {
    this.purchasingTime = data.format();
    this.state({
      tFlag: false
    });

  }
  getPtime2 (data, dateString) {
    this.storageTime = dateString;
  }
  onSelect = (value) => {
    this.formRef.current.setFieldsValue({
      cpuBrand: value[0].cpuBrand,
      cpuModelId: value[0].cpuName,
      cpuModel: value[0].cpuModel,
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
      title,
      visible,
      selectedRows,
      sale_status,
    } = this.props;
    // const me = this;
    // const p = this.props.root.powers;
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
    // let {showmodal} = this.props.pageUserstore;

    return (
      <div>
        <Modal
          title={title}
          maskClosable={false}
          width="80%"
          destroyOnClose
          visible={visible}
          onCancel={this.props.onCancel}
          // confirmLoading={this.state.modalLoading}
          footer={null}
        >
          <Form
            name="form_in_modal"
            ref={this.formRef}
            initialValues={selectedRows}
            onFinish={(value) => {
              this.onFinish(value);
            }}
            className="g-modal-field"
          >
            <Row>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="机房"
                  name="houseId"
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" }]}
                >
                  <Select allowClear placeholder="请选择机房">
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
                  rules={[{ required: true, message: "必填" }, { max: 4, message: "最多输入4位字符" },
                    { pattern: regExpConfig.num, message: "请输入数字" }]}
                >
                  <Input placeholder="请输入数量" />
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label={<span className="required">CPU型号名称</span>}
                  {...formItemLayout}
                >
                  <FormItem
                    name="cpuModelId"
                    style={{ display: "inline-block" }}
                    rules={[{ required: true, message: "必填" }]}
                  >
                    <Input
                      disabled
                      placeholder="请选择cpu型号名称"
                    />
                  </FormItem>
                  <Button style={{ display: "inline-block" }}>
                    <SleMod onSelect={this.onSelect}>选择</SleMod>
                  </Button>
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="CPU品牌"
                  name="cpuBrand"
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" }]}
                >
                  <Input disabled placeholder="请输入cpu品牌" />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="CPU型号"
                  name="cpuModel"
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" }]}
                >
                  <Input placeholder="请输入cpu型号" disabled />
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
                      style={{ display: "flex" }}
                    />
                  </FormItem>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="资源状态"
                  name="status"
                  rules={[{ required: true, message: "必填" }]}
                  {...formItemLayout}
                >
                  <Select allowClear placeholder="请选择资源状态">
                    {_.map(sale_status, (value, key) => (
                      <Option value={parseInt(key)} key={key}  style={parseInt(key) === 1 ? {display: 'none'} : {display: 'block'}}>
                        {value.text}
                      </Option>
                    ))}
                  </Select>
                </FormItem>
              </Col>

              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="来源"
                  name="source"
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" }]}
                >
                  <Select allowClear placeholder="请选择来源" disabled>
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
                  label="入库时间"
                  name="storageTime"
                  {...formItemLayout}
                  style={{ display: "none" }}
                >
                  <div>
                    <DatePicker
                      onChange={(date, dateString) => {
                        this.getPtime2(date, dateString);
                      }}
                      defaultValue={moment()}
                      disabled
                      style={{ display: "none" }}
                    />
                  </div>
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="服务器"
                  name="serverManagerIp"
                  {...formItemLayout}
                  style={{ display: "none" }}
                >
                  <Input
                    placeholder="请输入服务器"
                    style={{ display: "none" }}
                    disabled
                  />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                <FormItem label="备注" name="remark"   rules={[{ max: 250, message: "最多输入250个字符" }]} >
                  <TextArea placeholder="请输入备注"  style={{height: '100px'}} />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <div className="actions-btn">
                  <Button htmlType="submit" className="action-btn ok">
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
