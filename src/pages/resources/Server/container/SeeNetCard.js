/**
 * 查看详情展示 网卡信息
 */
// ==================
// 所需的各种插件
// ==================

import React, { useState } from 'react';
import P from 'prop-types';
import _ from 'lodash';
import http from '@src/util/http';
import { Table} from 'antd';
import {SYS_DICT_PORT} from '@src/config/sysDict'; // 系统字典
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
class SeeNetCard extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    powers: P.array, // 当前登录用户权限
    data: P.array, // 当前登录用户权限
  };
  formRefSeeNetCard = React.createRef();
  constructor (props) {
    super(props);
    this.state = {
      ipmiIndex: 1, // 标识ipmi位置（）
      lists: [],
    };
  }
  componentDidMount () {
  }

  columns = [
    {
      title: '网卡名称',
      dataIndex: 'network',
      width: 80,
    },
    {
      title: 'ipmi',
      dataIndex: 'isIpmi',
      width: 50,
      render: (text, record, index) => text ? '是' : '否'
    },
    {
      title: '网卡速率（M）',
      dataIndex: 'speed',
      width: 120,
    },
    {
      title: '网口类型',
      width: 150,
      dataIndex: 'interfaceType',
      render: (text, record, index) => SYS_DICT_PORT.port_type[text]
    },
    {
      title: '交换机',
      dataIndex: 'switch',
      width: 340,
      render: (text, record) => record.networkDevice && record.networkDevice.deviceName || ''
    },
    {
      title: '端口',
      dataIndex: 'port',
      width: 120,
      render: (text, record) => record.devicePort && record.devicePort.port || ''
    }];

  render () {
    return (
      <React.Fragment>
        <Table
          bordered
          key={(record) => record.id}
          dataSource={this.props.data}
          columns={this.columns}
        />
      </React.Fragment>
    );
  }
}
export default SeeNetCard;


