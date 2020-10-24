
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
  Modal,
  Divider,
  Row,
  Col,
  Select,
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
import SetNetworkCard from './SetNetworkCard';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
@inject('root')
@inject('serverDict')
@observer
class Add extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    root: P.any,
    serverDict: P.any,
    data: P.any, // 初始值（新增默认值或者模板入库初始值）
    onOk: P.func, // 添加成功后的回调
    onClose: P.func, // 取消的回调
  };
  formRefAdd = React.createRef();
  constructor (props) {
    super(props);
    this.state = {
      showModal: false,
      modalLoading: false,
      uw: 1, // u位数
      us: 1, // 节点数
      ubitInfo: {}, // u位信息
      regionInfo: {}, // 区域信息
      cabinetInfo: {}, // 机柜信息
      masterInfo: {}, // 外机信息
      nodeInfo: {}, // 节点信息
      locationCode: '', // 位置码
      serverCpuInfo: [], // cpu信息
      bussineTypeInfo: {}, // 业务类型
      serverHardDiskInfo: {}, // 硬盘信息
      serverRamInfo: {}, // 内存信息
      serverRaidInfo: {}, // raid卡信息
      serverNetworkInfo: {
        ipmiIndex: 1,
        lists: []
      }, // 网卡信息
      serverType: this.props.data.serverType || 1, // 默认服务器类型为通用
      status: 2,
    };
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
    if (values.serverType == 1) {
      if (!this.state.ubitInfo.uw) {
        Modal.warning({
          title: '请选择入库位置'
        });
        return false;
      }
      server = {
        ...server,
        startUs: this.state.ubitInfo.uw, // u位起始位置
        locationId: this.state.regionInfo.fullLocationId, // 需要额外判断
        cabinetId: this.state.cabinetInfo.id, // 机柜id
      };
    }
    // 节点服务器：处理入库位置
    if (values.serverType == 2) {
      if (!this.state.nodeInfo.id) {
        Modal.warning({
          title: '请选择入库位置'
        });
        return false;
      }
      server = {
        ...server,
        masterNodeId: this.state.nodeInfo.id, // 节点id
        locationId: this.state.regionInfo.fullLocationId, // 地位id
        cabinetId: this.state.cabinetInfo.id, // 机柜id
        masterId: this.state.masterInfo.id, // 外机id
      };
    }
    // 校验业务类型
    if (this.state.bussineTypeInfo.id == undefined) {
      Modal.error({
        title: '请选择业务类型！'
      });
      return;
    } else {
      server = {
        ...server,
        businessType: this.state.bussineTypeInfo.id
      };
    }
    // cpu信息:校验规则，只有一个且必填
    // if (this.state.serverCpuInfo.id) {
    //   if (this.state.serverCpuInfo.id == undefined) {
    //     Modal.error({
    //       title: "cpu配置报错",
    //       content: "CPU型号是必填项！"
    //     });
    //     return;
    //   }
    //   params['serverPartCpuList'] = [{
    //     "cpuModelId": this.state.serverCpuInfo.id
    //   }];
    // }
    // cpu信息:可以有多个cpu
    if (values.serverCpuSlot > 0) {
      let serverPartCpuList = [];
      let hasCpu = false;
      _.map(this.state.serverCpuInfo, (item) => {
        if (item.id) {
          hasCpu =  true;
        }
        serverPartCpuList.push({
          "cpuModelId": item.id || null,
          "cpuSlot": item.index
        });
      });
      if (!hasCpu) {
        Modal.error({
          title: "cpu配置报错",
          content: "CPU型号是必填项！"
        });
        return;
      }
      params['serverPartCpuList'] = serverPartCpuList;
    }
    // 内存信息逻辑判断：内存数量>=0；内存型号选填
    if (values.serverMemorySlot > 0) {
      let serverPartMemoryList = [];
      let memoryMax = 0; // 记录用户选择数据的总容量
      let overIndex = ""; // 记录超过最大单槽支持容量的插卡号和选择的最大容量
      _.map(this.state.serverRamInfo, (item) => {
        if (item.memSize && parseInt(item.info.memSize) > 0) {
          let memSize = parseInt(item.info.memSize);
          memoryMax = memoryMax + memSize;
          // 超过最大值则，记录哪些超过
          if (memSize > values.serverOneMemory) {
            overIndex = `${overIndex};卡槽${item.index}:${memSize};`;
          }
        }
        serverPartMemoryList.push({
          "memoryModelId": item.id || null,
          "memorySlot": item.index
        });
      });
      // 卡槽总容量不能超过设置的最大支持容量
      if (memoryMax > values.serverMaxMemory) {
        Modal.error({
          title: `内存卡配置问题：超过最大支持容量`,
          content: `你选择的卡槽总容量为:${memoryMax},超过你设置的最大支持容量：${values.serverMaxMemory};`
        });
      }
      // 卡槽的容量不能超过设置的单槽支持最大容量
      if (overIndex != '') {
        Modal.error({
          title: `内存卡配置问题：超过单槽支持最大容量`,
          content: `你选择的${overIndex};超过单槽支持最大容量`
        });
        return;
      }
      params['serverPartMemoryList'] = serverPartMemoryList;
    }
    // 硬盘信息逻辑判断：硬盘数量>=0；硬盘型号选填
    if (values.serverDiskSlot > 0) {
      let serverPartDiskList = [];
      _.map(this.state.serverHardDiskInfo, (item) => {
        serverPartDiskList.push({
          "diskModelId": item.id,
          "diskSlot": item.index
        });
      });
      params['serverPartDiskList'] = serverPartDiskList;
    }
    // 网卡信息额外判断:NIC1和ipmi是必填项，对应的所有字段都要填
    if (values.networkNumber > 0) {
      let serverPartNetworkList = [];
      let ipmiIndex = this.state.serverNetworkInfo.ipmiIndex; // ipmi 所在位置
      _.map(this.state.serverNetworkInfo.lists, (item, index) => {
        if (index >= values.networkNumber) {
          // 网卡数量以用户填写的网卡数为准
          return;
        }
        let network = "";
        let listIndex = index + 1;
        // 如果是ipmi,则所有数据必填
        // if (listIndex == ipmiIndex) {
        //   if (tools.isEmpty(item.speed) || tools.isEmpty(item.interfaceType) || tools.isEmpty(item.networkDevice.id) || tools.isEmpty(item.port.id)) {
        //     Modal.error({
        //       title: "ipmi各字段都是必填项!"
        //     });
        //   }
        // }
        // NIC1的在第一或者第二个位置（ipmi为1）
        // if (((listIndex != ipmiIndex) && (listIndex == 1)) || ((listIndex != ipmiIndex) && (listIndex == 2))) {
        //   if (tools.isEmpty(item.speed) || tools.isEmpty(item.interfaceType) || tools.isEmpty(item.networkDevice.id) || tools.isEmpty(item.port.id)) {
        //     Modal.error({
        //       title: "NIC1各字段都是必填项!"
        //     });
        //   }
        // }
        // 如果是ipmi
        if (listIndex == ipmiIndex) {
          network = 'ipmi';
        }
        // 非ipmi的按照顺序生成：网卡+序号
        if (listIndex > ipmiIndex) {
          network = `NIC${listIndex  - 1}`;
        }
        if (listIndex < ipmiIndex) {
          network = `NIC${listIndex}`;
        }
        serverPartNetworkList.push(tools.clearNull({
          "network": network,
          "networkDeviceId": item.networkDevice.id || null,
          "networkDevicePort": item.devicePort.id || null,
          "speed": item.speed || null,
          "isIpmi": (listIndex == ipmiIndex) ? 1 : 0,
          "interfaceType": item.interfaceType
        }));
      });
      params['serverPartNetworkList'] = serverPartNetworkList;
    }
    // raid卡判断:如果支持且使用raid卡则必须选择raid卡型号
    if (values.isRaid && values.isUseRaid) {
      if (this.state.serverRaidInfo.id) {
        server = {
          ...server,
          raidModelId: this.state.serverRaidInfo.id,
        };
      } else {
        Modal.warning({
          title: '请选择raid卡型号'
        });
        return false;
      }
    };
    // 服务器信息
    params['server'] = server;
    this.props.onOk(params);
  }


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
      locationCode: undefined
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
      locationCode: undefined,
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
      locationCode: locationCode
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
  onChange=(value,option)=>{
    this.setState({
      status: value
    });
  }
  render () {
    const { regionInfo, cabinetInfo, bussineTypeInfo, serverType, locationCode, status} = this.state;
    return (
      <React.Fragment>
        <Form name="form_in_modal"
          ref={this.formRefAdd}
          className="g-modal-field"
          initialValues={this.props.data}
          onFinish={(values) => {this.onFinish(values);}}>
          <Row>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="服务器类型" name="serverType"
                rules={[{ required: true}]}
                {...formItemLayout}>
                <Select onChange={(val) => {this.resetServerType(val);}}>
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
                <UBit uw={1}
                  title="选择U位"
                  onSelect={(val) => {this.onSelectUBit(val);}}
                ><Button style={{width: 120}}> 选择U位</Button>
                </UBit>
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
                <NodeRadio us={1}
                  title="选择节点"
                  onSelect={(val) => {this.onSelectNode(val);}}
                ><Button style={{width: 120}}> 选择节点</Button>
                </NodeRadio>
              </FormItem>
            </Col>}
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label={<span className="required"> 区域</span>}
                {...formItemLayout}>
                <Input
                  placeholder="地区/机房/区域(自动生成)"
                  type="text"
                  disabled
                  value={regionInfo.fullLocationName}
                />
              </FormItem>
            </Col>
            {/* <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label={<span className="required"> 服务器名称</span>}
                {...formItemLayout}>
                <Input
                  placeholder="规则：品牌_型号_规则"
                  type="text"
                  disabled
                  value={servername}
                />
              </FormItem>
            </Col> */}
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
              <FormItem label={<span className="required"> 机柜</span>}
                {...formItemLayout}>
                <Input
                  placeholder="自动生成"
                  type="text"
                  disabled
                  value={cabinetInfo.name}
                />
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="设备品牌" name="serverBrand"
                rules={[{ required: true}]}
                {...formItemLayout}>
                <Select>
                  {
                    _.map(this.props.serverDict.server_brand, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="设备型号" name="serverModel"
                rules={[{ required: true}]}
                {...formItemLayout}>
                <Select>
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
                  defaultValue={{}}
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
            { status === 3 &&
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="故障分类" name={["serverEditRecord",'childStatus']}
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
            {status === 3 && <Col xs={24} sm={24} md={24} lg={12} xl={12}>
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
            {status === 4 && <Col xs={24} sm={24} md={24} lg={12} xl={12}>
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
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="采购时间" name="purchasingTime"
                rules={[{ required: true}]}
                {...formItemLayout}>
                <DatePicker
                  style={{width: "100%"}}
                />
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Divider></Divider>
              <FormItem label="CPU配置"
                {...formItemLayout2}>
                <SetCpu defultSolts={this.props.data.serverCpuSlot}
                  setSolts={(solts) => {this.setCpuSolts(solts);}}></SetCpu>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Divider></Divider>
              <FormItem label="内存配置"
                {...formItemLayout2}>
                <SetRam defultSolts={this.props.data.serverMemorySlot}
                  setSolts={(solts) => {this.setRamSolts(solts);}}></SetRam>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Divider></Divider>
              <FormItem label="硬盘配置"
                {...formItemLayout2}>
                <SetHardDisk defultSolts={this.props.data.serverDiskSlot}
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
                  houseId={this.state.regionInfo.houseId}
                  setSolts={(solts) => {this.setNetworkSolts(solts);}}></SetNetworkCard>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Divider></Divider>
              <FormItem label="raid卡配置"
                {...formItemLayout2}>
                <SetRaid setSolts={(solts) => {this.setRaidSolts(solts);}}></SetRaid>
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
