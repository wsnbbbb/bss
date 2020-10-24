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
  Col,
  Row,
  DatePicker,
} from "antd";
import { inject, observer } from "mobx-react";
import { observable } from "mobx";
import tools from "@src/util/tools"; // 工具
import moment from "moment";
import Customer from '../../ServerPart/customer';
import SleMod from "./SleMod";
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import {SYS_DICT_SERVERPART} from '@src/config/sysDict'; // 系统字典
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
    // updateLists: P.func,
    // form: P.any
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
      value: 0,
    };
  }
  componentDidMount () {}
  componentWillReceiveProps (nextprops) {
    this.setState({
      value: nextprops.nowData.resourceAttribution
    });
  }


  /** 点击关闭时触发 **/
  onClose = () => {
    this.props.pageUserstore.changeShowmodal("off");
    this.setState({
      value: 1,
    });
  };
  onFinish = (value) => {
    if (this.props.operateType === "see") {
      // 是查看
      this.onClose();
      return;
    }
    if (this.props.operateType === "add") {
      value.purchasingTime = this.purchasingTime;
      value.storageTime = "";
      value.memModelId = this.id;
      value.number = parseInt(value.number);
      this.props.onOk(value); // 新增
    }
    if (this.props.operateType === "up") {
      let id = this.props.nowData.id;
      value.purchasingTime = this.purchasingTime;
      if (this.state.flag === true) {
        value.memModelId = this.props.memModelId;
      } else {
        value.memModelId = this.id;
      }
      this.props.edit(id, value);
    }
  };
  reset = () => {
    this.formRef.current.resetFields();
  };
  onChange = (value) => {
    if (value === 1) {
      this.formRef.current.setFieldsValue({
        customerName: ''
      });
    }
    this.setState({ value });
  };
  getPtime1 (data, dateString) {
    this.purchasingTime = data.format();
  }
  getPtime2 (data, dateString) {
    this.storageTime = dateString;
  }
  onSelect = (value) => {
    this.formRef.current.setFieldsValue({
      memSize: value[0].memSize,
      memModelId: value[0].memName,
    });
    this.id = value[0].id;
    this.setState({
      flag: false,
    });
  };
  onSelect2 = (value) => {
    this.formRef.current.setFieldsValue({
      customerName: value[0].name
    });
  }
  render () {
    const {
      operateType,
      nowData,
      releaseStatus,
      source,
      house,
      show_type,
      resource_attribution,
      sale_status,
    } = this.props;
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
          title={{ add: "内存入库", up: "内存修改", see: "查看" }[operateType]}
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
                  label="内存编号"
                  name="memCode"
                  {...formItemLayout}
                >
                  <Input
                    placeholder="自动生成"
                    disabled
                  />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="位置码"
                  name="houseLocationCode"
                  {...formItemLayout}
                >
                  <Input
                    placeholder="自动生成"
                    disabled
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
                  rules={[
                    { required: true, message: "必填" },
                  ]}
                >
                  <Select
                    allowClear
                    placeholder="请选择机房"
                    disabled={operateType === "see" || nowData.saleStatus === 1}
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
                        {  max: 4, message: "最多输入4位字符" },
                        { pattern: regExpConfig.num, message: "请输入数字" },
                      ]
                      : null
                  }
                  style={
                    operateType === "up"
                      ? { display: "none" }
                      : { display: "flex" }
                  }
                >
                  <Input
                    placeholder="请输入数量"
                    disabled={operateType === "see"}
                  />
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label={<span className="required">内存型号名称</span>}
                  {...formItemLayout}
                >
                  <FormItem
                    name="memModelId"
                    rules={[
                      { required: true, message: "必填" },
                    ]}
                    style={{ display: "inline-block" }}
                  >
                    <Input
                      disabled
                      placeholder="请选择内存型号名称"
                    />
                  </FormItem>
                  <Button
                    style={
                      operateType === "see"
                        ? { display: "none" }
                        : { display: "inline-block" }
                    }
                    disabled={nowData.saleStatus === 1}
                  >
                    <SleMod
                      operateType={operateType}
                      onSelect={this.onSelect}
                    >
                      选择
                    </SleMod>
                  </Button>
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="内存大小(G)"
                  name="memSize"
                  {...formItemLayout}
                  rules={[
                    { required: true, message: "必填" },
                    //  { max: 12, message: '最多输入8位字符' }
                  ]}
                >
                  <Input
                    placeholder="请输入内存大小"
                    disabled
                  />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  // label="采购时间"
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
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="来源"
                  name="source"
                  {...formItemLayout}
                  rules={[
                    { required: true, message: "必填" },
                    // { max: 12, message: '最多输入8位字符' }
                  ]}
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
                  label="入库时间"
                  name="storageTime"
                  {...formItemLayout}
                >
                  <div>
                    <DatePicker
                      // onChange={(date,dateString)=>{this.getPtime2(date,dateString)}}
                      disabled
                      defaultValue={moment(nowData.storageTime)}
                      style={{width: '100%'}}
                    />
                  </div>
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="资源归属"
                  name="resourceAttribution"
                  {...formItemLayout}
                  rules={[
                    { required: true, message: "必填" },
                  ]}
                >
                  <Select
                    allowClear
                    placeholder="请选择资源"
                    disabled={operateType === "see" || nowData.saleStatus === 1}
                    onChange={this.onChange}
                  >
                    {_.map(resource_attribution, (value, key) => (
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
                  label="归属方"
                  {...formItemLayout}
                >
                  <FormItem
                    name="customerName"
                    style={{ display: "inline-block" }}
                  >
                    <Input
                      placeholder="请选择归属方"
                      disabled
                    >
                    </Input>
                  </FormItem>
                  <Button
                    style={
                      operateType === "see"
                        ? { display: "none" }
                        : { display: "inline-block" }
                    }
                    disabled={this.state.value === 1 || nowData.saleStatus === 1}
                  >
                    <Customer
                      onSelect={this.onSelect2}
                      operateType={operateType}
                    >
                      选择
                    </Customer>
                  </Button>

                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="显示类型"
                  name="showType"
                  {...formItemLayout}
                  rules={[
                    { required: true, message: "必填" },
                    // { max: 12, message: '最多输入8位字符' }
                  ]}
                >
                  <Select
                    allowClear
                    placeholder="请选择类型"
                    disabled={operateType === "see" || nowData.saleStatus === 1}
                  >
                    {_.map(show_type, (value, key) => (
                      <Option value={parseInt(key)} key={key} >
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
                  label="发布状态"
                  name="releaseStatus"
                  {...formItemLayout}
                  rules={[
                    { required: true, message: "必填" },
                    //  { max: 12, message: '最多输入8位字符' }
                  ]}
                >
                  <Select
                    allowClear
                    placeholder="请选择发布状态"
                    disabled={operateType === "see" || nowData.saleStatus === 1}
                  >
                    {_.map(releaseStatus, (value, key) => (
                      <Option value={parseInt(key)} key={key}>
                        {value}
                      </Option>
                    ))}
                  </Select>
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="资源状态"
                  name="saleStatus"
                  {...formItemLayout}
                  rules={[
                    { required: true, message: "必填" },
                    //  { max: 12, message: '最多输入8位字符' }
                  ]}
                >
                  <Select
                    allowClear
                    placeholder="请选择类型"
                    disabled={operateType === "see" || nowData.saleStatus === 1}
                  >
                    {_.map(sale_status, (value, key) => (
                      <Option value={parseInt(key)} key={key} style={parseInt(key) === 1 ? {display: 'none'} : {display: 'block'}}>
                        {value.text}
                      </Option>
                    ))}
                  </Select>
                </FormItem>
              </Col>
            </Row>
            <Row>
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
                <FormItem label="备注" name="remark"   rules={[{ max: 120, message: "字数超出了" }]}>
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
