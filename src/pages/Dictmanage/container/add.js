/* eslint-disable react/jsx-no-undef */
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
  message,
  Popconfirm,
  Modal,
  Tooltip,
  Divider,
  Select,
  TreeSelect,
  Row,
  Col,
  Tree,
  Transfer,
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
@inject("root")
@inject("authManage")
@inject("pageUserstore")
@observer
class RoleAdminContainer extends React.Component {
  static propTypes = {
    location: P.any, // 当前位置
    history: P.any,
    userinfo: P.any, // 用户信息
    powers: P.array, // 用户权限
    authManage: P.any,
    match: P.any, // 路径
    pageUserstore: P.any,
    root: P.any, // 全局资源
    serverPartDict: P.any, // 服务器字典
    serverDict: P.any
  };
  constructor (props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      nowData: null, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      targetKeys: [],
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
  render () {
    const {
      operateType,
      nowData,
      dictLists
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
    const { targetKeys } = this.state;
    return (
      <div>
        <Modal
          title={
            { add: "字典添加", up: "字典修改", see: "字典查看" }[
              operateType
            ]
          }
          maskClosable={false}
          width="40%"
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
            {/* <Row>
              <Col span={24}>
                <FormItem
                  label="键值"
                  name="keyValues"
                  {...formItemLayout}
                >
                  <Input
                    disabled
                    allowClear
                    placeholder="自动生成"
                  />
                </FormItem>
              </Col>

            </Row> */}
            {/* <Row>
              <Col span={24}>
                <FormItem
                  label=""
                  name=""
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" }]}
                >
                  <Input
                    allowClear
                    placeholder="请输入"
                    disabled={operateType === "see"}
                  >
                  </Input>
                </FormItem>
              </Col>
            </Row> */}
            <Row>
              <Col span={24}>
                <FormItem
                  label="字典描述"
                  name="keyDesc"
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" }, {max: 40, message: "最多输入40个字符"}]}
                >
                  <Select
                    allowClear
                    placeholder="请选择"
                    disabled={operateType === "see" || operateType === 'up'}
                  >
                    {dictLists.map((item) => (
                      <Option value={item} key={item}>
                        {item}
                      </Option>
                    ))}
                  </Select>
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  label="字典名称"
                  name="keyNames"
                  {...formItemLayout}
                  rules={[{ required: true, message: "必填" },
                  ]}
                >
                  <Input
                    placeholder="请输入字典名称"
                    disabled={operateType === "see"}
                    allowClear
                  />
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  label="备注"
                  name="remark"
                  {...formItemLayout}
                  rules={[{max: 250, message: "最多输入250个字符"}]}
                >
                  <TextArea
                    placeholder="请输入备注"
                    disabled={operateType === "see"}
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
