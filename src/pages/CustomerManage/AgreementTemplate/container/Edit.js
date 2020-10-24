/* eslint-disable no-duplicate-imports */
/* eslint-disable react/prop-types */

/** 后台用户管理中心 协议模板管理 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import http from '@src/util/http';
import BraftEditor from 'braft-editor';
import 'braft-editor/dist/index.css';
import {
  Form,
  Button,
  Input,
  Select,
  Modal
} from 'antd';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router';
import { formItemLayout2 } from '@src/config/commvar'; // 全局通用变量
import tools from '@src/util/tools'; // 工具
import { SYS_DICT_CUSTOMER } from '@src/config/sysDict'; // 字典
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { Option } = Select;
@withRouter
@inject('root')
@inject('cabinetDict')
@inject('serverDict')
@inject('deviceDict')
@observer
class Server extends React.Component {
  static propTypes = {
    defaultData: P.any, // 原始数据
    history: P.any,
    id: P.any, // 当前选中id
    location: P.any, // 当前位置
    match: P.any, // 路径
    onClose: P.any, // 关闭弹窗回调
    onOk: P.any, // 确认提交回调
    root: P.any, // 全局状态
    that: P.any, // 主组件对象
  };
  constructor(props) {
    super(props);
    console.log(this.props);
    this.selectedRowKeys = [];// 选中的key
    this.formRefEdit = React.createRef();
    this.searchCondition = {};
    this.state = {
      lists: [],
      loading: false,
      showModal: false,
      pageNum: 1, // 当前第几页
      total: 0, // 数据库总共多少条数据
      pages: 0,
      selectedRowKeys: [],
      editorState: BraftEditor.createEditorState(null), // 富文本原始数据
    };
  }
  componentDidMount() {
    console.log(this.props.id);
    this.onGetListData(this.props.id);
  }
  // 模板列表
  onGetListData(params) {
    http.get(`${BSS_ADMIN_URL}/api/customer/protocolTemplate?id=${params}`)
      .then((res) => {
        res = res.data;
        console.log(res);
        if (tools.hasStatusOk(res)) {
          let data = res.data.records[0];
          console.log(this.state.editorState);
          // 带入值
          this.formRefEdit.current.setFieldsValue({
            templateType: data.templateType,
            simplifiedName: data.simplifiedName,
            simplifiedContent: BraftEditor.createEditorState(data.simplifiedContent),
            traditionalName: data.traditionalName,
            traditionalContent: BraftEditor.createEditorState(data.traditionalContent),
            englishName: data.englishName,
            englishContent: BraftEditor.createEditorState(data.englishContent),

          });
        } else {
          tools.dealFail(res);
        }
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.props.onClose();
  };
  selectedRow = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRowKeys
    });
  }


  // 验证通过
  onFinish(values) {
    // eslint-disable-next-line react/prop-types
    console.log(values);
    const param = {
      ...values,
      simplifiedContent: values.simplifiedContent.toHTML(),
      traditionalContent: values.traditionalContent.toHTML(),
      englishContent: values.englishContent.toHTML(),
    };
    console.log(param);
    this.props.onOk(param);
  }

  handleChange = (editorState) => {
    this.setState({ editorState });
    console.log(editorState.toRAW(true).blocks[0].text.length)
  }

  render() {
    const { protocol_type } = SYS_DICT_CUSTOMER;
    const defaultData = {
      ...this.props.defaultData,
    };
    return (
      <Form name="form_in_modal"
        ref={this.formRefEdit}
        className="g-modal-field"
        initialValues={defaultData}
        onFinish={(values) => { this.onFinish(values); }}>
        <FormItem name="templateType" label="模板类型"
          rules={[{ required: true }]}
          {...formItemLayout2}>
          <Select disabled
            allowClear
          >
            {
              _.map(protocol_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
            }
          </Select>
        </FormItem>

        <Form.Item name="simplifiedName" rules={[{ required: true, message: '请输入模板名称' }]} {...formItemLayout2} label="中文简体名称">
          <Input
            type="text" maxLength={150}
          />
        </Form.Item>

        <FormItem name="simplifiedContent" label="中文简体内容"
          {...formItemLayout2}
          rules={[{ required: true, message: '请输入中文简体内容' }]}>
          <BraftEditor onChange={this.handleChange} />
        </FormItem>

        <Form.Item name="traditionalName" rules={[{ required: true, message: '请输入模板名称' }]}  {...formItemLayout2} label="中文繁体名称">
          <Input
            type="text" maxLength={150}
          />
        </Form.Item>

        <FormItem name="traditionalContent" label="中文繁体内容"
          {...formItemLayout2}
          rules={[{ required: true, message: '请输入中文繁体内容' }]}>
          <BraftEditor onChange={this.handleChange}/>
        </FormItem>

        <Form.Item name="englishName" rules={[{ required: true, message: '请输入模板名称' }]}  {...formItemLayout2} label="English Name">
          <Input
            type="text" maxLength={150}
          />
        </Form.Item>

        <FormItem name="englishContent" label="English Content"
          {...formItemLayout2}
          rules={[{ required: true, message: '请输入English Content' }]}>
          <BraftEditor onChange={this.handleChange} />
        </FormItem>
        <div className="actions-btn">
          <Button htmlType="submit" className="action-btn ok">保存</Button>
          <Button onClick={this.onClose} className="action-btn ok">取消</Button>
        </div>
      </Form>
    );
  }
}
export default Server;


