/* eslint-disable react/prop-types */
/* Tree选择 - 权限选择 - 多选 */
import React from "react";
import {
  Modal,
  Tooltip,
  Transfer,
  Row,
  Col,
  message,
  Button,
  Select,
  Form,
  Input
} from "antd";
import P from "prop-types";
import _ from "lodash";
import { inject, observer } from "mobx-react";
import {formItemLayout2} from '@src/config/commvar'; // 全局通用变量
import {SYS_DICT_PRODUCT, SYS_DICT_COMMON} from '@src/config/sysDict'; // 系统字典
import tools from "@src/util/tools"; // 工具
import qs from "qs";
import http from "@src/util/http";
const FormItem = Form.Item;
const { Option } = Select;
@inject("authManage")
@observer
export default class RoleTreeComponent extends React.PureComponent {
  static propTypes = {
    data: P.array, // 原始数据
    title: P.string, // 标题
    visible: P.bool, // 是否显示
    defaultKeys: P.array, // 当前默认选中的key们
    loading: P.bool, // 确定按钮是否在等待中状态
    onOk: P.func, // 确定
    onClose: P.func, // 关闭
    record: P.object,
  };

  constructor (props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      loading: false,
      showModal: false,
    };
  }
  componentDidMount () {
  }


  /** 点击关闭时触发 **/
  onClose = () => {
    this.setState({ showModal: false });
  };
  modalShow () {
    this.setState({
      showModal: true
    });
  }
  onFinish = (value) => {
    value.price = parseInt(value.price);
    value.version = this.props.record.version;
    http
      .put(`${BSS_ADMIN_URL}/api/goods/ip-price-detail/${this.props.record.id}/update`, tools.clearNull(value))
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.onClose();
          this.props.updatalists();
          message.success("修改成功");
        } else {
          message.error(res.data);
        }
      })
      .catch(() => {
      });
  };
  reset = () => {
    this.formRef.current.resetFields();
  };
  render () {
    const {
      record,
    } = this.props;
    return (
      <main style={{display: "inline-block"}}>
        <Modal
          title="修改基础价"
          visible={this.state.showModal}
          destroyOnClose
          width="50%"
          onCancel={this.onClose}
          footer={null}
        >
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Form
                name="form_in_modal"
                ref={this.formRef}
                initialValues={{
                  ...record,
                  currency: 1,
                }}
                onFinish={(value) => {
                  this.onFinish(value);
                }}
                className="g-modal-field"
              >
                <FormItem
                  label="基础价"
                  name="price"
                  rules={[
                    { required: true, message: "必填" },
                  ]}
                  {...formItemLayout2}
                >
                  <Input
                    placeholder="请输入"
                  />
                </FormItem>
                <FormItem
                  label="币种"
                  name="currency"
                  rules={[
                    { required: true, message: "必填" },
                  ]}
                  {...formItemLayout2}
                >
                  <Select
                    placeholder="请选择"
                    allowClear
                    disabled
                  >
                    {_.map(SYS_DICT_COMMON.currency, (value, key) => <Select.Option value={parseInt(key)} key={key}>
                      {value}
                    </Select.Option>)
                    }
                  </Select>
                </FormItem>
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
                  <Button
                    onClick={this.onClose}
                    className="action-btn ok"
                    style={{ margin: "0 auto" }}
                  >
                取消
                  </Button>
                </div>
              </Form>
            </Col>
          </Row>
        </Modal>
        <span onClick={() => {this.modalShow();}}>
          {this.props.children}
        </span>
      </main>
    );
  }
}
