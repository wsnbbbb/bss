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
import { Form,  Input, InputNumber, Table, Modal,
  Row,  Select} from 'antd';
import debounce from 'lodash/debounce';
import { inject} from 'mobx-react';
import { withRouter } from 'react-router';
import {SYS_DICT_PORT} from '@src/config/sysDict'; // 系统字典
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import DeviceRadio from '@src/pages/resources/container/DeviceRadio';
import PortRadio from '@src/pages/resources/container/PortRadio';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { Option } = Select;

@withRouter
@inject('root')
@inject('deviceDict')
@inject('portDict')
class SetNetworkCard extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    root: P.any,
    portDict: P.any,
    deviceDict: P.any,
    powers: P.array, // 当前登录用户权限
    defaultValues: P.any,  // 原始数据
    houseId: P.string,  // 机房id 只能选择当前机房信息
    setSolts: P.func, // 确认选择
  };
  formRefSetNetworkCard = React.createRef();
  constructor (props) {
    super(props);
    this.state = {
      houseId: this.props.houseId,
      // ipmiIndex: 1, // 标识ipmi位置（从1开始）
      orgionLists: [], // 第一次获取的list数据（原始数据）
      lists: this.props.defaultValues,
    };
    this.resetNum = debounce(this.resetNum, 800);
  }
  componentDidMount () {
    if (Object.keys(this.props.deviceDict.devicebrand).length <= 0) {
      this.props.deviceDict.fetchDeviceBrand();
    }
    if (Object.keys(this.props.deviceDict.devicemodel).length <= 0) {
      this.props.deviceDict.fetchDeviceModel();
    }
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.houseId != this.state.houseId) {
      // 机房发生改变则： 因为交换机前置条件是机房，端口前置条件是交换机。
      if (this.state.lists.length > 0) {
        let serverPartNetworkLists = [];
        _.map(this.state.lists, (item) => {
          serverPartNetworkLists.push({
            ...item,
            networkDevice: {},
            devicePort: {},
          });
        });
        this.setState({
          lists: serverPartNetworkLists,
          houseId: nextProps.houseId
        });
      }
    }
  }
  // 修改卡槽数
  resetNum = (e) => {
    if (e < 2) {
      Modal.warning({
        title: '至少两张网卡'
      });
      return;
    }
    let oldlen = this.state.lists.length;
    let list = _.cloneDeep(this.state.lists);
    if (e == oldlen) {
      return;
    }
    if (oldlen > e) {
      list.splice(e, oldlen - e);
    } else {
      for (let i = oldlen + 1; i <= e; i++) {
        list.push({
          index: i, // 卡槽号
          speed: 1000,
          interfaceType: 0,
          networkDeviceId: '',
          networkDevicePort: '',
          networkDevice: {}, // 为了显示名称 所以存成对象
          devicePort: {}
        });
      }
    }
    this.setState({
      lists: list
    });
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
      return;
    }

    if (filedName == 'speed' || filedName == 'interfaceType') {
      lists[index - 1][filedName] = value;
      this.setState({
        lists: lists
      });
      this.props.setSolts(lists);
      return;
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
        // 默认设置一个可用端口
        http.get(`${BSS_ADMIN_URL}/api/product/network/devices/port?networkDeviceId=${value.id}&status=1`)
          .then((res) => {
            res = res.data;
            if (tools.hasStatusOk(res) && (res.data.length > 0)) {
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
      return;
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
      return;
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
    width: 150,
    render: (text, record, index) => <InputNumber value={text} maxLength={10} style={{width: 150}}
      onChange={(e) => {this.netCard('speed', index + 1, e);}} />
  },
  {
    title: '网口类型',
    width: 150,
    dataIndex: 'interfaceType',
    render: (text, record, index) => <Select defaultValue={text} allowClear onChange={(e) => {this.netCard('interfaceType', index + 1, e);}}>
      {_.map(SYS_DICT_PORT.port_type, (value, key) => <Option value={parseInt(key)} key={key}>{value}</Option>)}
    </Select>
  },
  {
    title: '网络设备',
    dataIndex: 'networkDevice',
    width: 340,
    render: (text, record, index) => <div className="my-input">
      <DeviceRadio
        title="选择网络设备"
        allowClear
        disabledTip="请先选择入库位置！"
        disabled={this.props.houseId == undefined}
        fetchPath={`${BSS_ADMIN_URL}/api/product/network/devices/choose?houseId=${this.props.houseId}`}
        onSelect={(id, row) => {this.netCard('networkDevice', index + 1, row);}}>
        <Input style={{width: 320}} placeholder="请选择网络设备" value={record.networkDevice && record.networkDevice.deviceName || ""}></Input>
      </DeviceRadio>
    </div>
  },
  {
    title: '端口',
    dataIndex: 'devicePort',
    width: 120,
    render: (text, record, index) => <React.Fragment>
      <PortRadio
        title="选择端口"
        disabled={!(record.networkDevice && record.networkDevice.id)}
        disabledTip="请选择交换机！"
        allowClear
        fetchPath={`${BSS_ADMIN_URL}/api/product/network/devices/port?networkDeviceId=${record.networkDevice && record.networkDevice.id}`}
        onSelect={(id, row) => {this.netCard('devicePort', index + 1, row);}}>
        <Input style={{width: 100}} placeholder="请选择端口" value={record.devicePort && record.devicePort.port || ""}></Input>
      </PortRadio>
    </React.Fragment>

  }];

  render () {
    const {lists} = this.state;
    return (
      <React.Fragment>
        <Row>
          <FormItem name="networkNumber" label="网卡数量"
            rules={[{ required: true,
              pattern: regExpConfig.num,
              message: '请输入数字' }]}>
            <InputNumber onChange={this.resetNum} maxLength={2} />
          </FormItem>
          <span style={{paddingLeft: 10}}>(ipmi 和NIC1 的信息为必填项)</span>
        </Row>
        <Table
          bordered
          key={(record) => record.index}
          dataSource={lists}
          columns={this.columns}
          scroll={{x: 1000}}
        />
      </React.Fragment>
    );
  }
}
export default SetNetworkCard;


