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
import {SYS_DICT_PRODUCT} from '@src/config/sysDict'; // 系统字典
const FormItem = Form.Item;
const { TreeNode } = TreeSelect;
const { Option } = Select;
const { SHOW_PARENT } = TreeSelect;
@inject("root")
@observer
class Add extends React.Component {
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
    this.props.onOK(value);
  };
  reset = () => {
    this.formRef.current.resetFields();
  };
  onChange = (value) => {
    console.log(value);
  }
  getNodes = (tree) => tree.reduce((pre, item) => {
    pre.push(
      <TreeNode value={item.id} title={item.name} key={item.id} level={item.level}>
        {item.children ? this.getNodes(item.children) : null}
      </TreeNode>
    );
    return pre;
  }, []);
  render () {
    let {lists, selectedKeys} = this.props;
    let obj = {parId: selectedKeys[0]};
    return (
      <div>
        <Form
          name="form_in_modal"
          ref={this.formRef}
          initialValues={obj}
          onFinish={(value) => {
            this.onFinish(value);
          }}
          className="g-modal-field"
        >
          <FormItem
            label="请选择上级类目"
            name="parId"
            rules={[
              { required: true, message: "必填" },
            ]}
            {...formItemLayout2}
          >
            <TreeSelect
              placeholder="请选择"
              allowClear
              onChange={this.onChange}
            >
              {this.getNodes(lists)}
            </TreeSelect>
          </FormItem>
          <FormItem
            label="前台展示名"
            name="showName"
            rules={[
              { required: true, message: "必填" },
            ]}
            {...formItemLayout2}
          >
            <Input
              placeholder="请输入展示名"
            />
          </FormItem>
          <FormItem
            label="类目名"
            name="name"
            rules={[
              { required: true, message: "必填" },
            ]}
            {...formItemLayout2}
          >
            <Input
              placeholder="请输入类目名"
            />
          </FormItem>
          <FormItem
            label="管理的产品类别"
            name="type"
            // rules={[
            //   { required: true, message: "必填" },
            // ]}
            {...formItemLayout2}
          >
            <Select
              placeholder="请选择"
              allowClear
            >
              {_.map(SYS_DICT_PRODUCT.product_category_type, (value, key) => (
                <Option value={parseInt(key)} key={key}>
                  {value}
                </Option>
              ))}
            </Select>
          </FormItem>
          <FormItem
            label="最小资源配置"
            name="resourceConfigs"
            // rules={[
            //   { required: true, message: "必填" },
            // ]}
            {...formItemLayout2}
          >
            <Select
              placeholder="请选择"
              allowClear
              mode="multiple"
            >
              {_.map(SYS_DICT_PRODUCT.product_resource_config, (value, key) => (
                <Option value={parseInt(key)} key={key}>
                  {value}
                </Option>
              ))}
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
      </div>
    );
  }
}
export default Add;
