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
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
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
    };
  }

  componentDidMount () {
  }
  /** 点击关闭时触发 **/
  onClose = () => {
    this.props.onClose();
  };
  onFinish = (value) => {
    value.deptname = this.props.nowData.deptname;
    this.props.onOK(value);
  };
  getNodes = (tree) => tree.reduce((pre, item) => {
    pre.push(
      <TreeNode value={item.id} title={item.name} key={item.id} disabled={item.id === '-1'}>
        {item.children ? this.getNodes(item.children) : null}
      </TreeNode>
    );
    return pre;
  }, []);
  handleChange = (value,lable)=>{
    this.props.nowData.deptname = lable[0];
  }
  render () {
    let { treenode,nowData} = this.props;
    //console.log(nowData);
    return (
      <div>
        <Form
            name="form_in_modal"
            ref={this.formRef}
            initialValues={nowData}
            onFinish={(value) => {
            this.onFinish(value);
            }}
            className="g-modal-field"
        >
            <FormItem
            label="部门"
            name="deptId"
            rules={[
            { required: true, message: "必填" },
            ]}
            {...formItemLayout2}
        >
            <TreeSelect
                style={{ width: "100%" }}
                placeholder="请选择部门"
                allowClear
                treeDefaultExpandedKeys={['1']}
                onChange={this.handleChange}
                >
                {this.getNodes(treenode)}
                </TreeSelect>
        </FormItem>
        <FormItem
            label="时间"
            name="time"
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
                <Button onClick={this.onClose} className="action-btn ok">
                    取消
                </Button>
            </div>
               </Form>
      </div>
    );
  }
}
export default Add;
