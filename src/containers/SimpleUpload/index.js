/**
 * 用于选择机柜,为其他组件提供
 */
// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import http from '@src/util/http';
import {
  Form,
  Button,
  Input,
  Upload,
  InputNumber,
  Table,
  message,
  Popconfirm,
  Spin,
  Modal,
  Tooltip,
  Divider,
  Select,
  TreeSelect
} from 'antd';
import { UploadOutlined} from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';
import {observable} from "mobx";
import {formItemLayout, houseAttribute, UBitStatus} from '@src/config/commvar'; // 全局通用变量
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import UBitOptLog from '@src/pages/resources/container/UBitOptLog';
import RegionInput from '@src/pages/resources/container/RegionInput';
import { User } from '@src/util/user';
import moment from 'moment';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const { TreeNode } = TreeSelect;

@withRouter
@inject('root')
export default class RamRadio extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    root: P.any,
    children: P.any,
    houseId: P.string,
    title: P.string,
    powers: P.array, // 当前登录用户权限
    onSelect: P.func, // 确认选择
    filetext: P.any, // 上传按钮文本
    url: P.string, // 上传url
  };
  formRefAdd = React.createRef();
  constructor (props) {
    super(props);
    this.selectAreaNode = {}; // 选中的地区节点信息
    this.selectedRows = []; // 选中行数据
    this.houseId = '';
    this.uw = 0;
    this.state = {
      fileList: [],
      uploading: false,
    };
  }
  componentDidMount () {
  }


  modalShow () {
    this.setState({
      showModal: true
    });
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.setState({showModal: false});
  };

  render () {
    const { uploading, fileList, showModal} = this.state;
    const props = {
      name: 'file',
      method: 'post',
      action: this.props.url,
      headers: {
        "Authorization": 'token ' + User.getToken(),
      },
      onChange (info) {
        if (info.file.status !== 'uploading') {
          console.log('已上传');
        }
        if (info.file.status === 'done') {
          if (info.file.response.code == 20000) {
            tools.auto_close_result('ok', '上传成功！');
            this.setState({showModal: false});
          } else {
            tools.dealFail(info.file.response);
          }
        } else if (info.file.status === 'error') {
          Modal.error({
            title: "上传失败！"
          });
        }
      },
    };

    return (
      <React.Fragment>
        <Modal
          title={this.props.title || '上传文件'}
          maskClosable={false}
          width="600px"
          destroyOnClose
          footer={false}
          onCancel={this.onClose}
          visible={showModal}
        >
          <Upload {...props}>
            <Button> <UploadOutlined /> {this.props.filetext} </Button>
          </Upload>
        </Modal>
        <span onClick={() => {this.modalShow();}}>
          {this.props.children}
        </span>
      </React.Fragment>
    );
  }
};
