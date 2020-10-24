/**
 * 网卡table 供快捷方式和修改页面使用
 */
// ==================
// 所需的各种插件
// ==================

import React, { useState } from 'react';
import P from 'prop-types';
import _ from 'lodash';
import http from '@src/util/http';
import { Form, Button, Input, Checkbox, Tag, InputNumber, Table, message, Popconfirm, Spin, Modal,
  Row, Col, Tooltip, Divider, Select} from 'antd';
import { EyeOutlined, FormOutlined, DeleteOutlined} from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';
import {observable} from "mobx";
import {formItemLayout} from '@src/config/commvar'; // 全局通用变量
import {SYS_DICT_PORT} from '@src/config/sysDict'; // 系统字典
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import RamModelRadio from '@src/pages/resources/container/RamModelRadio';
import DeviceRadio from '@src/pages/resources/container/DeviceRadio';
import PortRadio from '@src/pages/resources/container/PortRadio';
import debounce from 'lodash/debounce';
const { Option } = Select;

@withRouter
@inject('root')
@inject('portDict')
class NetCardTable extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    root: P.any,
    portDict: P.any,
    powers: P.array, // 当前登录用户权限
    NetCardList: P.any,  // 网卡数据
    serverInfo: P.any,  // 服务器信息
    houseId: P.any,  // 服务器信息
    setSolts: P.func, // 确认选择
  };
  formRefNetCardTable = React.createRef();
  constructor (props) {
    super(props);
    this.state = {
      serverId: this.props.serverInfo.id,
      houseId: this.props.houseId,
      ipmiIndex: 1, // 标识ipmi位置（）
      lists: this.props.NetCardList,
    };
  }
  componentDidMount () {
  }
  componentWillReceiveProps (nextProps) {
  }

  /**
   * filedName,修改的网卡字段
   * index,修改第index个网卡,从1开始
   * value，修改后的值
   */
  netCard = (filedName, index, value) => {
    let lists = [...this.state.lists];
    if (filedName == 'ipmi') {
      this.setState({
        ipmiIndex: index
      });
      this.props.setSolts(lists);
    }
    if (filedName == 'speed' || filedName == 'interfaceType') {
      lists[index - 1][filedName] = value;
      this.setState({
        lists: lists
      });
      this.props.setSolts(lists);
    }
    // 交换机处理
    if (filedName == 'networkDevice') {
      // 交换机清空
      if (!value.id) {
        lists[index - 1]['networkDevice'] = {
          id: null,
          deviceName: null,
        };
        // 端口号清空
        lists[index - 1]['devicePort'] = {
          id: null,
          port: null,
        };
        this.props.setSolts(lists);
      } else { // 交换机有值
        lists[index - 1]['networkDevice'] = {
          id: value.id,
          deviceName: value.deviceName,
        };
        // 获取一条端口作为默认值
        http.get(`${BSS_ADMIN_URL}/api/product/network/devices/port?networkDeviceId=${value.id}&status=1`)
          .then((res) => {
            res = res.data;
            if (tools.hasStatusOk(res) && (res.data.length > 0)) {
              // 网络设备发生变更 则重置端口号
              let port = res.data[0];
              lists[index - 1]['devicePort'] = {
                id: port.id,
                port: port.port,
              };
            } else {
              tools.dealFail(res);
              // 网络设备发生变更 则重置端口号
              lists[index - 1]['devicePort'] = {
                id: null,
                port: null,
              };
            }
            this.setState({
              lists: lists
            });
            this.props.setSolts(lists);
          })
          .catch(() => {
            // 网络设备发生变更 则重置端口号
            lists[index - 1]['devicePort'] = {
              id: null,
              port: null,
            };
            this.setState({
              lists: lists
            });
            this.props.setSolts(lists);
          });
      }
    }
    // 端口信息处理
    if (filedName == 'devicePort') {
      // 端口清空
      if (!value.id) {
        lists[index - 1]['devicePort'] = {
          id: null,
          port: null,
        };
      } else { // 端口有值
        lists[index - 1]['devicePort'] = {
          id: value.id,
          port: value.port,
        };
      }
      this.setState({
        lists: lists
      });
      this.props.setSolts(lists);
    }
  };

  columns = [{
    title: '网卡序号',
    dataIndex: 'index',
    width: 80,
    render: (text, record, index) => `网卡${index + 1}`
  },
  {
    title: '网卡名称',
    dataIndex: 'network',
    width: 100,
  },
  {
    title: 'ipmi',
    dataIndex: 'isIpmi',
    width: 80,
    render: (text, record, index) => <Select value={text} disabled style={{width: 80}}
      onChange={(e) => {this.netCard('ipmi', index + 1, e);}}>
      <Option value={1}>是</Option>
      <Option value={0}>否</Option>
    </Select>
  },
  {
    title: '网卡速率（M）',
    dataIndex: 'speed',
    width: 120,
    render: (text, record, index) => <InputNumber value={text} onChange={(e) => {this.netCard('speed', index + 1, e);}} maxLength={10}/>
  },
  {
    title: '网口类型',
    width: 150,
    dataIndex: 'interfaceType',
    render: (text, record, index) => <Select defaultValue={text} allowClear style={{width: 120}}
      onChange={(e) => {this.netCard('interfaceType', index + 1, e);}}>
      {_.map(SYS_DICT_PORT.port_type, (value, key) => <Option value={parseInt(key)} key={key}>{value}</Option>)}
    </Select>
  },
  {
    title: '网络设备',
    dataIndex: 'networkDevice',
    width: 340,
    render: (text, record, index) => <span className="my-input">
      <DeviceRadio
        title="选择网络设备"
        allowClear
        disabledTip="请先选择入库位置！"
        disabled={!this.props.houseId}
        fetchPath={`${BSS_ADMIN_URL}/api/product/network/devices/choose?houseId=${this.props.houseId}`}
        onSelect={(id, row) => {this.netCard('networkDevice', index + 1, row);}}>
        <Input style={{width: 340}} placeholder="请选择网络设备" value={record.networkDevice && record.networkDevice.deviceName || ""}></Input>
      </DeviceRadio>
    </span>
  },
  {
    title: '端口',
    dataIndex: 'networkDevicePort',
    width: 130,
    render: (text, record, index) => <span className="my-input">
      <PortRadio
        title="选择端口"
        disabled={!(record.networkDevice && record.networkDevice.id)}
        disabledTip="请选择网络设备！"
        allowClear
        fetchPath={`${BSS_ADMIN_URL}/api/product/network/devices/port?networkDeviceId=${record.networkDevice && record.networkDevice.id}`}
        onSelect={(id, row) => {this.netCard('devicePort', index + 1, row);}}>
        <Input style={{width: 120}} placeholder="请选择端口" value={record.devicePort && record.devicePort.port || ""}></Input>
      </PortRadio>
    </span>

  }];

  render () {
    const {lists} = this.state;
    return (
      <React.Fragment>
        <Table
          bordered
          key={(record) => record.id}
          dataSource={lists}
          columns={this.columns}
          scroll={{x: 1200}}
        />
      </React.Fragment>
    );
  }
}
export default NetCardTable;


