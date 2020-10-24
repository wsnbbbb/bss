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
  Table,
  Modal,
  Select,
  TreeSelect
} from 'antd';
import { EyeOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';
import {observable} from "mobx";
import {formItemLayout, houseAttribute, UBitStatus} from '@src/config/commvar'; // 全局通用变量
import {SYS_DICT_PORT} from '@src/config/sysDict'; // 系统字典
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式

@withRouter
@inject('root')
@observer
class PortManage extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    root: P.any,
    PortTempParam: P.any, // deviceType 和 deviceModelId 设备类型和设备型号必填，查询端口模板作为初始数据。
    powers: P.array, // 当前登录用户权限
    lists: P.any,  // 端口列表数据
  };
  formRefSearch = React.createRef();
  constructor (props) {
    super(props);
    this.state = {
      lists: [],  // table表中的数据 进行处理后的数据
    };
  }
  componentDidMount () {
  }
  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextState.someData !== this.state.someData;
  // }
  componentWillReceiveProps (nextProps) {
    if (nextProps.lists != this.props.lists) {
      this.setState({
        lists: nextProps.lists
      });
    }
  }

  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: '端口',
        dataIndex: 'port',
        // width: 150,
        key: 'port',
      },
      {
        title: '端口类型',
        dataIndex: 'sult',
        // width: 150,
        key: 'sult',
        render: (text, record) => SYS_DICT_PORT.port_type[text]
      },
      {
        title: '端口状态',
        dataIndex: 'status',
        // width: 150,
        key: 'status',
        render: (text) => tools.renderStatus(SYS_DICT_PORT.port_use, text)
      },
      {
        title: '端口速率（Mbps）',
        dataIndex: 'speed',
        // width: 150,
        key: 'speed',
      },
      {
        title: '浏览图url',
        dataIndex: 'url',
        // width: 150,
        key: 'url',
      },
      {
        title: '连接信息（管理IP）',
        dataIndex: 'manageIp',
        width: 150,
        key: 'manageIp',
      },
      {
        title: '连接信息（网卡名）',
        dataIndex: 'deviceNetworkName',
        width: 150,
        key: 'deviceNetworkName',
      },
      {
        title: '连接信息（服务器名称）',
        dataIndex: 'deviceName',
        width: 150,
        key: 'deviceName',
      },
      {
        title: '备注',
        dataIndex: 'remark',
        // width: 150,
        key: 'remark',
      }
    ];
    return columns;
  }

  // 查询
  search (val) {
    if (val.port == undefined) {
      Modal.warning({
        title: '请输入查询条件'
      });
    }
    let reg = new RegExp(val.port);
    let lists = _.filter(this.props.lists, (item) => reg.test(item.port));
    this.setState({
      lists: lists
    });
  }

  render () {
    const {lists} = this.state;
    return (
      <React.Fragment>
        <div className="g-search">
          <Form ref={this.formRefSearch} name="searchbox" layout="inline" onFinish={(values) => {this.search(values);}}>
            <Form.Item name="port" label="端口">
              <Input style={{width: 100}} placeholder="端口"/>
            </Form.Item>
            <Form.Item shouldUpdate>
              <Button type="primary" htmlType="submit" >查询</Button>
            </Form.Item>
          </Form>
        </div>
        {/* 数据展示 */}
        <div className="g-table">
          <Table
            columns={this.makeColumns()}
            rowKey={(record) => record.port}
            dataSource={lists}
            size="small"
          />
        </div>
      </React.Fragment>
    );
  }
}
export default PortManage;


