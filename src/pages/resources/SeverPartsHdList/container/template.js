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
import Customer from '../../ServerPart/customer';
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
      tFlag: true,
      value: 0
    };
  }

  componentDidMount () {}
  componentWillReceiveProps (nextprops) {
    this.setState({
      value: nextprops.selectedRows.resourceAttribution
    });
  }
  onClose = () => {
    this.props.onCancel();
    this.setState({
      value: 1,
    });
  };
  onFinish = (value) => {
    value.storageTime = this.storageTime;
    if (this.state.flag === true) {
      value.diskModelId = this.props.diskModelId;
    } else {
      value.diskModelId = this.id;
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
      diskSize: value[0].diskSize,
      diskModelId: value[0].diskName,
      diskBrand: value[0].diskBrand,
    });
    this.id = value[0].id;
    this.setState({
      flag: false,
    });
  };
  onSelect2 =(value) => {
    this.formRef.current.setFieldsValue({
      customerName: value[0].name
    });
  }
  onChange = (value) => {
    if (value === 1) {
      this.formRef.current.setFieldsValue({
        customerName: ''
      });
    }
    this.setState({ value });
  };
  render () {
    const {
      releaseStatus,
      source,
      house,
      title,
      visible,
      selectedRows,
      resource_attribution,
      show_type,
      disk_type,
      sale_status,
      operateType,
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
    return (
      <div>
        <Modal
          title={title}
          maskClosable={false}
          width="80%"
          destroyOnClose
          visible={visible}
          onCancel={this.props.onCancel}
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
                        {item.name}
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
                  rules={[{ required: true, message: "必填" },  { max: 4, message: "最多输入4位字符" }, { pattern: regExpConfig.num, message: "请输入数字" }]}
                >
                  <Input placeholder="请输入数量" />
                </FormItem>
              </Col>
            </Row>

            <Row>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem label={<span className="required">硬盘型号名称</span>}
                  {...formItemLayout}
                >
                  <FormItem
                    name="diskModelId"
                    rules={[
                      { required: true, message: "必填" },
                    ]}
                    style={{ display: "inline-block" }}
                  >
                    <Input
                      disabled
                      placeholder="请选择硬盘型号名称"
                    />
                  </FormItem>
                  <Button>
                    <SleMod disk_type={disk_type} onSelect={this.onSelect}>
                      选择
                    </SleMod>
                  </Button>
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="硬盘容量(G)"
                  name="diskSize"
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" }]}
                >
                  <Input placeholder="硬盘容量" disabled />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="硬盘品牌"
                  name="diskBrand"
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" }]}
                >
                  <Input placeholder="硬盘品牌" disabled />
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
                  label="入库时间"
                  name="storageTime"
                  {...formItemLayout}

                >
                  <div>
                    <DatePicker
                      onChange={(date, dateString) => {
                        this.getPtime2(date, dateString);
                      }}
                      defaultValue={moment()}
                      disabled
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
                  <Select allowClear placeholder="请选择资源"  onChange={this.onChange}>
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
                    ></Input>
                  </FormItem>
                  <Button
                    disabled={this.state.value === 1}
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
                  ]}
                >
                  <Select allowClear placeholder="请选择类型">
                    {_.map(show_type, (value, key) => (
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
                  label="发布状态"
                  name="releaseStatus"
                  {...formItemLayout}
                  rules={[
                    { required: true, message: "必填" },
                  ]}
                >
                  <Select allowClear placeholder="请选择发布状态">
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
                  ]}
                >
                  <Select allowClear placeholder="请选择类型">
                    {_.map(sale_status, (value, key) => (
                      <Option key={key} value={parseInt(key)} style={parseInt(key) === 1 ? {display: 'none'} : {display: 'block'}}>
                        {value.text}
                      </Option>
                    ))}
                  </Select>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem
                  label="来源"
                  name="source"
                  {...formItemLayout}
                  rules={[
                    { required: true, message: "必填" },
                  ]}
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
              <Col span={24}>
                <FormItem label="备注" name="remark"   rules={[{ max: 120, message: "字数超出了" }]}>
                  <TextArea placeholder="请输入备注" style={{height: '100px'}}/>
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
