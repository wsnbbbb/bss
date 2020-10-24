/* eslint-disable react/prop-types */

/** 资源管理/机柜U位管理 **/

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
  Tag,
  InputNumber,
  Table,
  Pagination,
  message,
  Popconfirm,
  Spin,
  Modal,
  Tooltip,
  Divider,
  Select
} from 'antd';
import { ExclamationCircleOutlined, FormOutlined, DeleteOutlined} from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';
import {observable} from "mobx";
import {formItemLayout, houseAttribute, UBitStatus} from '@src/config/commvar'; // 全局通用变量
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import {SYS_DICT_SERVERPART} from '@src/config/sysDict'; // 系统字典
import HardDiskRadio from '@src/pages/resources/Container/HardDiskRadio';

// ==================
// Definition
// ==================
@withRouter
@inject('root')
@inject('deviceDict')
@observer
class List extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    root: P.any,
    powers: P.array, // 当前登录用户权限
    Serverinfo: P.any, // 服务器信息
    canOpt: P.bool, // 是否可以执行操作（例如：已售服务器不允许操作）
  };
  constructor (props) {
    super(props);
    this.formRefAdd =  React.createRef();
    this.searchFormRef =  React.createRef();
    this.flag_updateList = false; // 标识是否需要更新服务器列表（修改成功的移除成功后）
    this.state = {
      lists: this.props.data,
      page: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      modalShow: false,
      modalLoading: false,
    };
  }
  componentDidMount () {
  }
  // 查询
  onSearch (val) {
    let reg = new RegExp(val.ipAddr);
    let lists = _.filter(this.props.data, (item) => reg.test(item.ipAddr));
    this.setState({
      lists: lists
    });
  }

  // 显示业务Ip
  onModalShow () {
    this.setState({
      modalShow: true,
    });
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    if (this.flag_updateList) {
      this.props.updateList();
    }
    this.setState({modalShow: false});
  };

  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: 'IP',
        dataIndex: 'ipAddr',
        width: 150,
        key: 'ipAddr',
      },
      {
        title: '客户名称',
        dataIndex: 'customerName',
        width: 150,
        key: 'customerName',
      },
    ];
    return columns;
  }

  render () {
    const {modalShow} = this.state;
    return (
      <React.Fragment>
        <Modal
          title={this.props.title || '业务ip'}
          maskClosable={false}
          width="90%"
          destroyOnClose
          footer={false}
          onCancel={this.onClose}
          visible={modalShow}
        >
          {/* 搜索 */}
          <div className="g-search">
            <Form ref={this.searchFormRef} name="searchbox" layout="inline" onFinish={(values) => {this.onSearch(values);}}>
              <Form.Item name="ipAddr" label="业务IP">
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">搜索</Button>
              </Form.Item>
            </Form>
          </div>
          {/* 数据展示 */}
          <div className="g-table">
            <Table
              columns={this.makeColumns()}
              rowKey={(record) => record.id}
              dataSource={this.state.lists}
            />
          </div>
        </Modal>
        <span className="mytag light-blue" onClick={() => {this.onModalShow();}} style={{cursor: 'pointer'}}>
          {/* 显示第一条业务ip 和总数量 */}
          {this.props.data && this.props.data[0] && this.props.data[0].ipAddr}({this.props.data && this.props.data.length || 'null'})
        </span>
      </React.Fragment>
    );
  }
}
export default List;


