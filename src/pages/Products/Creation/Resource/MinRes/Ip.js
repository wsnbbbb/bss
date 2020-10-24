import React from 'react';
import P from 'prop-types';
import http from '@src/util/http';
import tools from '@src/util/tools';
import _ from 'lodash';
import { Tabs, Radio, Breadcrumb, Select, Checkbox, Button, Input, Form, Row, InputNumber, Switch } from 'antd';
import { inject, observer} from 'mobx-react';
import {SYS_DICT_SERVERPART} from "@src/config/sysDict";
import {formItemLayout, formItemLayout2} from '@src/config/commvar'; // 全局通用变量
const { TabPane } = Tabs;
class MinResCpu extends React.PureComponent {
  static propTypes = {
    location: P.any,
    history: P.any,
    onSave: P.func, // 保存配置
    onDel: P.func, // 删除配置
    notDefaultRes: P.bool, // 是否允许删除（默认资源不可删除）
    defaultValue: P.any, // 默认值
  };
  constructor (props) {
    super(props);
    let selectedParams = {};
    this.state = {
      editable: false, // 编辑模式（编辑模式可编辑，且有确定按钮）
    };
  }
  componentDidMount () {
  }

  onFinish = (val) => {
    this.props.onSave(val);
    this.setState({ editable: true });
  }
  // 修改编辑状态
 editChange = (editable) => {
   this.setState({ editable });
 };

  // 删除配置
  OnDel = () => {
    this.props.onDel();
  }

  render () {
    const { editable} = this.state;
    console.log(this.props.defaultValue);
    const style = {
      display: 'inline-block',
      width: 150,
    };
    const style1 = {
      display: 'inline-block',
      width: 400,
      marginLeft: 160,
    };
    const style2 = {
      display: 'inline-block',
      width: 700,
    };
    return (
      <div className="min-res">
        <div className="min-res-head">
          <span className="min-res-title">+ IP </span>
          <Button onClick={() => {this.editChange(false);}}>配置</Button>
          {this.props.notDefaultRes && <Button onClick={this.OnDel} className="del-btn">删除</Button>}
        </div>
        <Form
          name="mem"
          onFinish={this.onFinish}
          initialValues={this.props.defaultValue}
          layout="inline"
        >
          {/* 最小数量 */}
          <div className="min-res-content">
            <Form.Item name="minNum" label="最少购买量"
              rules={[{required: true, message: '请输入' }]}
              style={style2}>
              <InputNumber style={{width: 150}} disabled={editable} />
            </Form.Item>
          </div>

          <div className="min-res-content">
            {!editable && <Button htmlType="submit" className="action-btn ok">保存</Button>}
          </div>
        </Form>
      </div>

    );
  }
}

export default MinResCpu;
