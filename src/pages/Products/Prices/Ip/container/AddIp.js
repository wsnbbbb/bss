/* eslint-disable react/prop-types */
import React from "react";
import P from "prop-types";
import {
  Form,
  Button,
  Input,
  TreeSelect,
  Select,
  Cascader
} from "antd";
import { inject, observer } from "mobx-react";
import {formItemLayout2} from '@src/config/commvar'; // 全局通用变量
import {SYS_DICT_PRODUCT, SYS_DICT_COMMON} from '@src/config/sysDict'; // 系统字典
const FormItem = Form.Item;
const { TreeNode } = TreeSelect;
const { Option } = Select;
const { SHOW_PARENT } = TreeSelect;
@inject("root")
@observer
class AddIp extends React.Component {
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
      fetching: true,
      loading: false,
    };
  }

  componentDidMount () {
  }
  componentWillReceiveProps (nextprops) {
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.props.onClose();
  };
  onFinish = (value) => {
    value.ipSegment = this.ipSegment;
    this.props.onOK(value);
  };
  reset = () => {
    this.formRef.current.resetFields();
  };
  onChange= (val, option) => {
    this.ipSegment = option.children;
  }
  render () {
    let {lists4, selectedKeys} = this.props;
    return (
      <div>
        <Form
          name="form_in_modal"
          ref={this.formRef}
          initialValues={{
            currency: 1
          }}
          onFinish={(value) => {
            this.onFinish(value);
          }}
          className="g-modal-field"
        >
          <FormItem
            label="Ip段"
            name="ipSegmentId"
            rules={[
              { required: true, message: "必填" },
            ]}
            {...formItemLayout2}
          >
            <Select
              placeholder="请选择"
              allowClear
              onChange={this.onChange}
            >
              {lists4.map((item) => <Option value={item.id} key={item.id}>
                {item.ipAddr}
              </Option>)
              }
            </Select>
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
              {_.map(SYS_DICT_COMMON.currency, (value, key) => <Option value={parseInt(key)} key={key}>
                {value}
              </Option>)
              }
            </Select>
          </FormItem>
          <FormItem
            label="基本价"
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
      </div>
    );
  }
}
export default AddIp;
