
/** 资源管理/服务器入库 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import http from '@src/util/http';
import tools from '@src/util/tools';
import {
  Form,
  Button,
  Input,
  DatePicker,
  InputNumber,
  Table,
  message,
  Popconfirm,
  Spin,
  Modal,
  Collapse,
  Tooltip,
  Divider,
  Row,
  Col,
  Select,
  TreeSelect
} from 'antd';
import { inject, observer} from 'mobx-react';
import {formItemLayout, formItemLayout2} from '@src/config/commvar'; // 全局通用变量
import {SYS_DICT_SERVER} from '@src/config/sysDict'; // 系统字典
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import UBit from '@src/pages/resources/Container/UBit';
import NodeRadio from '@src/pages/resources/Container/NodeRadio';
import BussineType from '@src/pages/resources/Container/BussineType';
import SetCpu from './SetCpu';
import SetRam from './SetRam';
import SetHardDisk from './SetHardDisk';
import SetRaid from './SetRaid';
import NetCardTable from '../NetCardTable';
import SetNetworkCard from './SetNetworkCard';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const { TreeNode } = TreeSelect;
@inject('root')
@inject('deviceDict')
@inject('serverDict')
@inject('areaResouse')
@inject('serverPartDict')
@observer
class Add extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    root: P.any,
    deviceDict: P.any,
    serverDict: P.any,
    areaResouse: P.any,
    serverPartDict: P.any,
    powers: P.array, // 当前登录用户权限
    data: P.any, // 初始值（新增默认值或者模板入库初始值）
    onOk: P.func, // 添加成功后的回调
    onClose: P.func, // 取消的回调
  };
  formRefEdit = React.createRef();
  constructor (props) {
    super(props);
    this.state = {
      showModal: false,
      modalLoading: false,
      uw: 1, // u位数
      us: 1, // 节点数
      houseIdChange: false, // 标识机房位置发生变更新
      ubitInfo: {}, // u位信息(存储修改后的信息)
      regionInfo: {}, // 区域信息(存储修改后的信息)
      cabinetInfo: {}, // 机柜信息(存储修改后的信息)
      masterInfo: {}, // 外机信息(存储修改后的信息)
      nodeInfo: {}, // 节点信息(存储修改后的信息)
      locationCode: this.props.data.serverLocationCode, // 位置码(存储修改后的信息)
      serverCpuInfo: this.props.data.serverCpus, // cpu信息(存储修改后的信息)
      bussineTypeInfo: this.props.data.businessTypes || {}, // 业务类型(存储修改后的信息)
      serverHardDiskInfo: this.props.data.serverDisk, // 硬盘信息
      serverRamInfo: this.props.data.serverMemory, // 内存信息
      serverRaidInfo: {}, // raid卡信息(存储修改后的信息)
      serverNetworkInfo: this.props.data.serverNetwork, // 网卡信息
      serverType: this.props.data.serverType, // 默认服务器类型为通用
      serverStatus: this.props.data.serverStatus,// 服务器状态
    };
  }
  componentDidMount () {
  }
  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextState.someData !== this.state.someData;
  // }
  componentWillReceiveProps (nextProps) {
    // if (nextProps.data !== this.props.data) {
    //   this.setState({
    //     value: nextProps.data.parId
    //   });
    // }
  }

  // 验证通过
  onFinish (values) {
    let params  = {
    };
    let server = values;
    if(server.serverEditRecord){
      server.serverEditRecord.status = server.serverStatus;
      params['serverEditRecord'] = server.serverEditRecord
    }
    // 通用服务器：处理入库位置
    // if (values.serverType == 1) {
    //   if (!this.state.ubitInfo.uw) {
    //     Modal.warning({
    //       title: '请选择入库位置'
    //     });
    //     return false;
    //   }
    //   server = {
    //     ...server,
    //     startUs: this.state.ubitInfo.uw, // u位起始位置
    //     locationId: this.state.regionInfo.fullLocationId, // 需要额外判断
    //     cabinetId: this.state.cabinetInfo.id, // 机柜id
    //   };
    // }
    // 节点服务器：处理入库位置
    // if (values.serverType == 2) {
    //   if (!this.state.nodeInfo.id) {
    //     Modal.warning({
    //       title: '请选择入库位置'
    //     });
    //     return false;
    //   }
    //   server = {
    //     ...server,
    //     masterNodeId: this.state.nodeInfo.id, // 节点id
    //     locationId: this.state.regionInfo.fullLocationId, // 地位id
    //     cabinetId: this.state.cabinetInfo.id, // 机柜id
    //     masterId: this.state.masterInfo.id, // 外机id
    //   };
    // }
    // 校验业务类型
    if (this.state.bussineTypeInfo.id == null) {
      Modal.error({
        title: '请选择业务类型！'
      });
      return;
    } else {
      server = {
        ...server,
        version: this.props.data.version,
        businessType: this.state.bussineTypeInfo.id
      };
    }

    // cpu信息逻辑判断：cpu数量>=0；cpu至少填一个
    if (this.state.serverCpuInfo.length > 0) {
      let hasCpu = false;
      let partCpuUpdateList = [];
      console.log(this.state.serverCpuInfo);
      _.map(this.state.serverCpuInfo, (item, index) => {
        if (!tools.isEmpty(item.cpuModelId)) {
          hasCpu = true;
          partCpuUpdateList.push({
            cpuModelId: item.cpuModelId,
            cpuSlot: item.cpuSlot,
            version: item.version,
            workOrder: 0, // 不走工单
          });
        }
      });
      if (!hasCpu) {
        Modal.error({
          title: "cpu配置报错",
          content: "CPU型号是必填项！"
        });
        return;
      }
      params['partCpuUpdateList'] = partCpuUpdateList;
    }

    // 内存信息逻辑判断：内存数量>=0；内存型号选填
    if (this.state.serverRamInfo.length > 0) {
      let serverPartMemoryList = [];
      _.map(this.state.serverRamInfo, (item, index) => {
        if (!tools.isEmpty(item.memoryModelId)) {
          serverPartMemoryList.push({
            memoryModelId: item.memoryModelId,
            memorySlot: item.memorySlot,
            version: item.version,
            workOrder: 0, // 不走工单
          });
        }
      });
      // let memoryMax = 0; // 记录用户选择数据的总容量
      // let overIndex = ""; // 记录超过最大单槽支持容量的插卡号和选择的最大容量
      // _.map(this.state.serverRamInfo, (item) => {
      //   if (item.memSize && parseInt(item.info.memSize) > 0) {
      //     let memSize = parseInt(item.info.memSize);
      //     memoryMax = memoryMax + memSize;
      //     // 超过最大值则，记录哪些超过
      //     if (memSize > values.serverOneMemory) {
      //       overIndex = `${overIndex};卡槽${item.index}:${memSize};`;
      //     }
      //   }
      //   serverPartMemoryList.push({
      //     "memoryModelId": item.id || null,
      //     "memorySlot": item.index
      //   });
      // });
      // // 卡槽总容量不能超过设置的最大支持容量
      // if (memoryMax > values.serverMaxMemory) {
      //   Modal.error({
      //     title: `内存卡配置问题：超过最大支持容量`,
      //     content: `你选择的卡槽总容量为:${memoryMax},超过你设置的最大支持容量：${values.serverMaxMemory};`
      //   });
      // }
      // // 卡槽的容量不能超过设置的单槽支持最大容量
      // if (overIndex != '') {
      //   Modal.error({
      //     title: `内存卡配置问题：超过单槽支持最大容量`,
      //     content: `你选择的${overIndex};超过单槽支持最大容量`
      //   });
      //   return;
      // }
      // 只传有内存条的数据
      if (serverPartMemoryList.length > 0) {
        params['partMemoryUpdateList'] = serverPartMemoryList;
      }
    }
    // 硬盘信息逻辑判断：硬盘数量>=0；硬盘型号选填
    if (this.state.serverHardDiskInfo.length > 0) {
      let serverPartDiskList = [];
      _.map(this.state.serverHardDiskInfo, (item) => {
        if (!tools.isEmpty(item.diskModelId)) {
          serverPartDiskList.push({
            diskModelId: item.diskModelId,
            diskSlot: item.diskSlot,
            version: item.version,
            workOrder: 0, // 不走工单
          });
        }
      });
      // 只传有硬盘的数据
      if (serverPartDiskList.length > 0) {
        params['partDiskUpdateList'] = serverPartDiskList;
      }

    }
    // 网卡信息额外判断:NIC1和ipmi是必填项，对应的所有字段都要填
    if (this.state.serverNetworkInfo) {
      let serverPartNetworkList = [];
      _.map(this.state.serverNetworkInfo, (item) => {
        serverPartNetworkList.push(tools.clearNull({
          id: item.id,
          serverId: item.serverId,
          network: item.network,
          networkDeviceId: item.networkDevice && item.networkDevice.id,
          networkDevicePort: item.devicePort && item.devicePort.id,
          status: item.status,
          speed: item.speed,
          isIpmi: item.isIpmi,
          interfaceType: item.interfaceType,
          version: item.version,
        }));
      });
      // let ipmiIndex = this.state.serverNetworkInfo.ipmiIndex; // ipmi 所在位置
      // _.map(this.state.serverNetworkInfo.lists, (item, index) => {
      //   let network = "";
      //   let listIndex = index + 1;
      //   // 如果是ipmi,则所有数据必填
      //   if (listIndex == ipmiIndex) {
      //     if (item.speed == null || item.interfaceType == null || item.switch.id == null || item.port.id == null) {
      //       Modal.error({
      //         title: "ipmi是必填项!"
      //       });
      //     }
      //   }
      //   // NIC1的在第一或者第二个位置（ipmi为1）
      //   if (((listIndex != ipmiIndex) && (listIndex == 1)) || ((listIndex != ipmiIndex) && (listIndex == 2))) {
      //     if (item.speed == null || item.interfaceType == null || item.switch.id == null || item.port.id == null) {
      //       Modal.error({
      //         title: "NIC1是必填项!"
      //       });
      //       return;
      //     }
      //   }
      //   // 如果是ipmi
      //   if (listIndex == ipmiIndex) {
      //     network = 'ipmi';
      //   }
      //   // 非ipmi的按照顺序生成：网卡+序号
      //   if (listIndex > ipmiIndex) {
      //     network = `NIC${listIndex  - 1}`;
      //   }
      //   if (listIndex < ipmiIndex) {
      //     network = `NIC${listIndex}`;
      //   }
      //   serverPartNetworkList.push({
      //     "network": network,
      //     "networkDeviceId": item.switch.id || null,
      //     "networkDevicePort": item.port.id || null,
      //     "speed": item.speed,
      //     "isIpmi": (listIndex == ipmiIndex) ? 1 : 0,
      //     "interfaceType": item.interfaceType
      //   });
      // });
      params['partNetowrkUpdateList'] = serverPartNetworkList;
    }
    // raid卡判断:如果支持且使用raid卡则必须选择raid卡型号
    // if (values.isRaid == null) {
    //   Modal.error({
    //     title: '请选择是否支持raid卡！'
    //   });
    // }
    // if (values.isRaid) { // 支持raid卡
    //   if (values.isUseRaid == null) {
    //     Modal.error({
    //       title: '请选择是否有raid卡！'
    //     });
    //   }
    //   if (values.isUseRaid && this.state.serverRaidInfo.id) { // 使用raid卡且选择型号
    //     server = {
    //       ...server,
    //       raidModelId: this.state.serverRaidInfo.id,
    //     };
    //   } else { // 使用raid卡未选择型号
    //     Modal.error({
    //       title: '请选择raid卡型号'
    //     });
    //   }
    // };
    // 服务器信息
    params['server'] = server;
    console.log(params);
    this.props.onOk(params);
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.formRefEdit.current.resetFields();
  };

  /** 点击关闭时触发 **/
  onClose = () => {
    this.props.onClose();
  };

  /**
   * 重置节点值
   * 需要清除选中的机柜和区域信息
   */
  resetNodeNum = (value) => {
    this.setState({
      us: value,
      ubitInfo: {},
      regionInfo: {},
      cabinetInfo: {},
      nodeInfo: {},
      locationCode: null
    });
  }
  // 用户修改服务器类型则重置
  resetServerType = (val) => {
    this.setState({
      serverType: val,
      regionInfo: {},
      cabinetInfo: {},
      uBitInfo: {},
      nodeInfo: {},
      locationCode: null,
    });
  }

  // 选择机柜
  onSelectUBit = (val) => {
    let enduw = val.uBitInfo.uw + this.state.uw - 1;
    let locationCode = `${val.regionInfo.fullLocationCode}-${val.cabinetInfo.row}-${val.cabinetInfo.coulmn}-${val.uBitInfo.uw}U-${enduw}U`;
    this.setState({
      ubitInfo: val.uBitInfo,
      regionInfo: val.regionInfo,
      cabinetInfo: val.cabinetInfo,
      locationCode: locationCode,
      houseIdChange: val.regionInfo.houseId != this.props.data.houseId
    });
  }
  // 选择节点
  onSelectNode (val) {
    let locationCode = `${val.masterInfo.physicsLocationCode}-${val.nodeInfo.sort}M`;
    this.setState({
      regionInfo: val.regionInfo,
      cabinetInfo: val.cabinetInfo,
      masterInfo: val.masterInfo,
      nodeInfo: val.nodeInfo,
      locationCode: locationCode,
      houseIdChange: val.regionInfo.houseId != this.props.data.houseId
    });
  }

  // 设置业务类型
  setBussineType (key, row) {
    this.setState({
      bussineTypeInfo: row
    });
  }
  // 设置cpu卡槽信息
  setCpuSolts (solts) {
    console.log(solts);
    this.setState({
      serverCpuInfo: solts
    });
  }
  // 设置ram卡槽信息
  setRamSolts (solts) {
    this.setState({
      serverRamInfo: solts
    });
  }
  // 设置ram卡槽信息
  setHardDiskSolts (solts) {
    this.setState({
      serverHardDiskInfo: solts
    });
  }
  // 设置Raid卡槽信息
  setRaidSolts (solts) {
    this.setState({
      serverRaidInfo: solts
    });
  }
  // 设置网卡信息
  setNetworkSolts (solts) {
    this.setState({
      serverNetworkInfo: solts
    });
  }
  onChange=(value)=>{
    this.setState({
      serverStatus: value
    });
  }
  render () {
    const { regionInfo, cabinetInfo, bussineTypeInfo, serverType, locationCode, serverStatus} = this.state;
    const {houseList} = this.props.areaResouse;
    return (
      <React.Fragment>
        <Form name="form_in_modal"
          ref={this.formRefEdit}
          className="g-modal-field"
          initialValues={this.props.data}
          onFinish={(values) => {this.onFinish(values);}}>
          <Row>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="服务器类型" name="serverType"
                rules={[{ required: true}]}
                {...formItemLayout}>
                <Select onChange={(val) => {this.resetServerType(val);}} disabled>
                  {
                    _.map(SYS_DICT_SERVER.se_unittype, (item, key) => <Option value={parseInt(key)} key={key}> {item}</Option>)
                  }
                </Select>
              </FormItem>
            </Col>
            {/* 通用服务器入库具体到U位 */}
            {serverType == 1 && <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label={<span className="required"> 入库位置</span>}
                style={{marginBottom: 0}}
                {...formItemLayout}>
                <FormItem name="serverUs"
                  rules={[{ required: true,
                    pattern: regExpConfig.num,
                    message: '请输入数字' }]}
                  style={{ display: 'inline-block', width: 150 }}>
                  <InputNumber disabled />
                </FormItem>
                {/* <UBit uw={1}
                  title="选择U位"
                  onSelect={(val) => {this.onSelectUBit(val);}}
                ><Button style={{width: 120}}> 选择U位</Button>
                </UBit> */}
                <Button style={{width: 120}} disabled> 选择U位</Button>
              </FormItem>
            </Col>}
            {/* 节点服务器入库具体到节点 */}
            {serverType == 2 && <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label={<span className="required"> 入库位置</span>}
                style={{marginBottom: 0}}
                {...formItemLayout}>
                <FormItem name="serverUs"
                  rules={[{ required: true}]}
                  style={{ display: 'inline-block', width: 150 }}>
                  <InputNumber disabled />
                </FormItem>
                <Button style={{width: 120}} disabled> 选择节点</Button>
                {/* <NodeRadio us={1}
                  title="选择节点"
                  onSelect={(val) => {this.onSelectNode(val);}}
                ><Button style={{width: 120}}> 选择节点</Button>
                </NodeRadio> */}
              </FormItem>
            </Col>}
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label={<span className="required"> 位置码</span>}
                {...formItemLayout}>
                <Input
                  placeholder="自动生成"
                  type="text"
                  disabled
                  value={locationCode}
                />
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem name="houseId" label={<span className="required"> 机房</span>}
                {...formItemLayout}>
                <Select
                  disabled
                  style={{width: 200}}>
                  {_.map(houseList, (item) => (
                    <Option value={item.id} key={item.id}>
                      {item.name}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="设备品牌" name="serverBrand"
                rules={[{ required: true}]}
                {...formItemLayout}>
                <Select disabled>
                  {
                    _.map(this.props.serverDict.server_brand, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="机房" name="houseId"
                rules={[{ required: true}]}
                {...formItemLayout}>
                <Select disabled>
                  {
                    _.map(houseList, (item, key) => <Option value={item.id} key={item.id} > {item.fullName} </Option>)
                  }
                </Select>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="设备型号" name="serverModel"
                rules={[{ required: true}]}
                {...formItemLayout}>
                <Select disabled>
                  {
                    _.map(this.props.serverDict.server_model, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="管理IP" name="serverIp"
                rules={[{ required: true, pattern: regExpConfig.ipv4, message: "请输入IPv4格式IP"}]}
                {...formItemLayout}>
                <Input
                  type="text"
                  placeholder="请输入"
                />
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="显示类型" name="showMode"
                rules={[{ required: true}]}
                {...formItemLayout}>
                <Select
                  placeholder="请选择" allowClear>
                  {
                    _.map(SYS_DICT_SERVER.show_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label={<span className="required">业务类型</span>} className="my-input"
                rules={[{ required: true}]}
                {...formItemLayout}>
                <BussineType
                  title="选择业务类型"
                  allowClear
                  fetchPath={`${BSS_ADMIN_URL}/api/product/server/business/types`}
                  onSelect={(id, row) => {this.setBussineType(id, row);}}>
                  <Input style={{width: "100%"}} placeholder="选择业务类型" value={bussineTypeInfo.name || ""}></Input>
                </BussineType>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="用途" name="serverUseType"
                rules={[{ required: true}]}
                {...formItemLayout}>
                <Select
                  placeholder="请选择" allowClear>
                  {
                    _.map(SYS_DICT_SERVER.server_useage, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="服务器状态" name="serverStatus"
                rules={[{ required: true}]}
                {...formItemLayout}>
                <Select
                  placeholder="服务器状态" allowClear onChange={this.onChange}>
                  {
                    _.map(SYS_DICT_SERVER.server_status, (item, key) => <Option value={parseInt(key)} key={key} > {item.text} </Option>)
                  }
                </Select>
              </FormItem>
            </Col>
            { serverStatus === 3 &&
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="故障分类" name={["serverEditRecord",'childStatusName']}
                rules={[{ required: true}]}
                {...formItemLayout}>
                <Select
                  placeholder="故障分类" allowClear >
                  {
                    _.map(this.props.serverDict.server_fault_category, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </FormItem>
            </Col>}
            {serverStatus === 3 && <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <FormItem label="保留原因" name={["serverEditRecord",'content']}
              rules={[{ required: true}]}
              {...formItemLayout}>
               <Input
                  type="text"
                  placeholder="请输入"
              />
            </FormItem>
            </Col>
            }
            {serverStatus === 4 && <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="保留原因" name={["serverEditRecord",'content']}
                rules={[{ required: true}]}
                {...formItemLayout}>
                 <Input
                    type="text"
                    placeholder="请输入"
                />
              </FormItem>
              </Col>
            }
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="销售状态" name="status"
                rules={[{ required: true}]}
                {...formItemLayout}>
                <Select
                  placeholder="销售状态" allowClear>
                  {
                    _.map(SYS_DICT_SERVER.market, (item, key) => <Option value={parseInt(key)} key={key} disabled={key == 2}> {item.text} </Option>)
                  }
                </Select>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="发布状态" name="releaseStatus"
                rules={[{ required: true}]}
                {...formItemLayout}>
                <Select
                  placeholder="发布状态" allowClear>
                  {
                    _.map(SYS_DICT_SERVER.releaseStatus, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Divider></Divider>
              <FormItem label="CPU配置"
                {...formItemLayout2}>
                <SetCpu
                  defaultValues={this.props.data.serverCpus}
                  houseId={this.props.data.houseId}
                  // houseinfo={{
                  //   houseIdChange: this.state.houseIdChange,
                  //   serverhouseId: this.props.data.houseId,
                  //   currentHouseId: this.props.data.houseId,
                  // }}
                  setSolts={(solts) => {this.setCpuSolts(solts);}}></SetCpu>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Divider></Divider>
              <FormItem label="内存配置"
                {...formItemLayout2}>
                <SetRam
                  defultSolts={this.props.data.serverMemorySlot}
                  defaultValues={this.props.data.serverMemory}
                  houseId={this.props.data.houseId}
                  houseIdChange={this.state.houseIdChange}
                  setSolts={(solts) => {this.setRamSolts(solts);}}></SetRam>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Divider></Divider>
              <FormItem label="硬盘配置"
                {...formItemLayout2}>
                <SetHardDisk
                  defultSolts={this.props.data.serverDiskSlot}
                  defaultValues={this.props.data.serverDisk}
                  houseId={this.props.data.houseId}
                  // houseinfo={{
                  //   houseIdChange: this.state.houseIdChange,
                  //   serverhouseId: this.props.data.houseId,
                  //   currentHouseId: this.props.data.houseId,
                  // }}
                  setSolts={(solts) => {this.setHardDiskSolts(solts);}}></SetHardDisk>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Divider></Divider>
              <FormItem label="网卡配置"
                {...formItemLayout2}>
                <SetNetworkCard defultSolts={this.props.data.networkNumber}
                  houseId={this.props.data && this.props.data.houseId}
                  defaultValues={this.props.data.serverNetwork}
                  setSolts={(solts) => {this.setNetworkSolts(solts);}}></SetNetworkCard>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Divider></Divider>
              <FormItem label="raid卡配置"
                {...formItemLayout2}>
                <SetRaid defaultValues={this.props.data.raidName} setSolts={(solts) => {this.setRaidSolts(solts);}}></SetRaid>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <FormItem label="备注" name="remarks"
                {...formItemLayout2}>
                <TextArea
                  autoSize={{ minRows: 5}}
                  placeholder="请输入"
                  maxLength={250}
                />
              </FormItem>
            </Col>
          </Row>
          <div className="actions-btn">
            <Button htmlType="submit" className="action-btn ok">确认提交</Button>
            <Button onClick={this.onClose} className="action-btn ok">取消</Button>
          </div>
        </Form>
      </React.Fragment>
    );
  }
}
export default Add;
