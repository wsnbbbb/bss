
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
  Row,
  Col,
  Table,
  Divider,
  Select,
  TreeSelect,
  Modal
} from 'antd';
import { inject, observer} from 'mobx-react';
import {formItemLayout, formItemLayout2} from '@src/config/commvar'; // 全局通用变量
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import {SYS_DICT_SERVER, SYS_DICT_SERVERPART} from '@src/config/sysDict'; // 系统字典
import SeeNetCard from './SeeNetCard';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
@inject('root')
@inject('deviceDict')
@inject('serverDict')
@inject('serverPartDict')
@observer
class Add extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    root: P.any,
    deviceDict: P.any,
    serverDict: P.any,
    serverPartDict: P.any,
    powers: P.array, // 当前登录用户权限
    data: P.any, // 当前登录用户权限
    onOk: P.func, // 添加成功后的回调
    onClose: P.func, // 取消的回调
  };
  constructor (props) {
    super(props);
    this.state = {
      serverDetail: {}, // 服务器详情信息
      uw: 1, // u位数
      us: 1, // 节点数
      ubitInfo: {}, // u位信息
      regionInfo: {}, // 区域信息
      cabinetInfo: {}, // 机柜信息
      masterInfo: {}, // 外机信息
      nodeInfo: {}, // 节点信息
      locationCode: '', // 位置码
      serverCpuInfo: {}, // cpu信息
      bussineTypeInfo: {}, // 业务类型
      serverHardDiskInfo: {}, // 硬盘信息
      serverRamInfo: {}, // 内存信息
      serverRaidInfo: {}, // raid卡信息
      serverNetworkInfo: {
        ipmiIndex: 1,
        lists: []
      }, // 网卡信息
      serverType: 1, // 默认服务器类型为通用
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

  render () {
    const serverDetail = this.props.data;
    return (
      <React.Fragment>
        <Form name="form_in_modal"
          initialValues={serverDetail}
          className="g-modal-field">
          <Row>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="服务器类型" name="serverType"
                rules={[{ required: true}]}
                {...formItemLayout}>
                <Select disabled>
                  {
                    _.map(SYS_DICT_SERVER.se_unittype, (item, key) => <Option value={parseInt(key)} key={key}> {item}</Option>)
                  }
                </Select>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem name="serverLocationCode" label={<span className="required"> 位置码</span>}
                {...formItemLayout}>
                <Input
                  placeholder="自动生成"
                  type="text"
                  disabled
                />
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
                rules={[{ required: true}]}
                {...formItemLayout}>
                <Input
                  disabled
                  type="text"
                  placeholder="请输入"
                />
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="服务器名称" name="serverName"
                rules={[{ required: true}]}
                {...formItemLayout}>
                <Input
                  disabled
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
                  disabled
                  placeholder="请选择" allowClear>
                  {
                    _.map(SYS_DICT_SERVER.show_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label={<span className="required">业务类型</span>}
                {...formItemLayout}>
                <Input disabled style={{width: "100%"}} value={serverDetail.businessTypes && serverDetail.businessTypes.name}></Input>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="用途" name="serverUseType"
                rules={[{ required: true}]}
                {...formItemLayout}>
                <Select disabled
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
                <Select disabled
                  placeholder="服务器状态" allowClear>
                  {
                    _.map(SYS_DICT_SERVER.server_status, (item, key) => <Option value={parseInt(key)} key={key} > {item.text} </Option>)
                  }
                </Select>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="故障分类" name={["serverEditRecord",'childStatusName']}
                rules={[{ required: true}]}
                {...formItemLayout}>
                <Select disabled
                  placeholder="故障分类" allowClear >
                  {
                    _.map(this.props.serverDict.server_fault_category, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </FormItem>
            </Col>
          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <FormItem label="保留原因" name={["serverEditRecord",'content']}
              rules={[{ required: true}]}
              {...formItemLayout}>
               <Input
                  type="text"
                  placeholder="请输入"
                  disabled
              />
            </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="销售状态" name="status"
                rules={[{ required: true}]}
                {...formItemLayout}>
                <Select disabled
                  placeholder="销售状态" allowClear>
                  {
                    _.map(SYS_DICT_SERVER.market, (item, key) => <Option value={parseInt(key)} key={key} > {item.text} </Option>)
                  }
                </Select>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="采购时间" name="purchasingTime"
                rules={[{ required: true}]}
                {...formItemLayout}>
                <DatePicker disabled />
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem label="入库时间" name="storageTime"
                rules={[{ required: true}]}
                {...formItemLayout}>
                <DatePicker disabled />
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Divider></Divider>
              <FormItem label={<span className="required">cpu型号</span>} {...formItemLayout2}>
                <Row>
                  <FormItem name="serverCpuSlot" label="CPU数量" rules={[{ required: true}]}>
                    <Input style={{width: 200}} disabled/>
                    {/* <Input value={serverDetail.serverCpu && serverDetail.serverCpu.cpuName || ''}  style={{width: 500}} disabled/> */}
                  </FormItem>
                </Row>
                <Row>
                  {_.map(serverDetail.serverCpus, (item) => <li className="my-column" key={item.cpuSlot}>
                    <span className="column-label">序号{item.cpuSlot}:</span>
                    <Input value={item.cpuName}  style={{width: 400}} disabled></Input>
                  </li>)}
                </Row>
              </FormItem>

            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Divider></Divider>
              <FormItem label={<span className="required" >内存配置</span>} {...formItemLayout2}>
                <Row>
                  <FormItem name="serverMemorySlot" label="内存插槽数"
                    rules={[{ required: true}]}>
                    <Input disabled />
                  </FormItem>
                  <FormItem name="serverMaxMemory" label="最大支持容量（G）"
                    rules={[{ required: true}]}>
                    <InputNumber disabled />
                  </FormItem>
                  <FormItem name="serverOneMemory" label="单槽支持最大容量（G）"
                    rules={[{ required: true}]}>
                    <InputNumber disabled />
                  </FormItem>
                  <FormItem name="serverMemoryType" label="支持类型"
                    rules={[{ required: true}]}>
                    <Select
                      style={{width: 150}} disabled>
                      {
                        _.map(SYS_DICT_SERVERPART.memory_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </FormItem>
                  <FormItem name="serverMemorySpec" label="支持规格"
                    rules={[{ required: true}]}>
                    <Select
                      style={{width: 150}} disabled>
                      {
                        _.map(SYS_DICT_SERVERPART.mem_spec, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </FormItem>
                </Row>
                {_.map(serverDetail.serverMemory, (item) => <li className="my-column" key={item.memorySlot}>
                  <span className="column-label">插槽{item.memorySlot}:</span>
                  <Input value={item.memoryName}  style={{width: 400}} disabled></Input>
                </li>)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Divider></Divider>
              <FormItem label={<span className="required" >硬盘配置</span>} {...formItemLayout2}>
                <Row>
                  <FormItem name="serverDiskSlot" label="硬盘插槽数" maxLength={200}
                    rules={[{ required: true}]}>
                    <Input disabled />
                  </FormItem>
                  <FormItem name="serverDiskHot" label="是否支持热插拔"
                    rules={[{ required: true}]}>
                    <Select style={{width: 150}} disabled>
                      <Option value={1} key={1} > 是 </Option>
                      <Option value={0} key={0} > 否 </Option>
                    </Select>
                  </FormItem>
                  <FormItem name="diskInterfaceType" label="接口类型"
                    rules={[{ required: true}]}>
                    <Select
                      style={{width: 150}} disabled>
                      {
                        _.map(SYS_DICT_SERVERPART.disk_interface_type, (value, key) => <Option value={parseInt(key)} key={key}> {value} </Option>)
                      }
                    </Select>
                  </FormItem>
                  <FormItem name="serverDiskSpec" label="支持规格"
                    rules={[{ required: true, message: '请选择' }]}>
                    <Select
                      style={{width: 150}} disabled>
                      {
                        _.map(SYS_DICT_SERVERPART.server_disk_spec, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </FormItem>
                </Row>
                {
                  _.map(serverDetail.serverDisk, (item) => <li className="my-column" key={item.diskSlot}>
                    <span className="column-label required">插槽{item.diskSlot}:</span>
                    <Input value={item.diskName} style={{width: 400}} disabled/>
                  </li>)
                }
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Divider></Divider>
              <FormItem label="网卡配置"
                {...formItemLayout2}>
                <Row>
                  <FormItem name="networkNumber" label="网卡数量"
                    rules={[{ required: true}]}>
                    <InputNumber disabled/>
                  </FormItem>
                  <span style={{paddingLeft: 10}}>(ipmi 和NIC1 的信息为必填项)</span>
                </Row>
                <SeeNetCard data={serverDetail.serverNetwork}></SeeNetCard>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Divider></Divider>
              <FormItem label="raid卡配置"
                {...formItemLayout2}>
                <FormItem name="isRaid" label="是否支持raid卡"
                  rules={[{ required: true}]}>
                  <Select style={{width: 100}} disabled>
                    <Option value={1} key={1} > 是 </Option>
                    <Option value={0} key={0} > 否 </Option>
                  </Select>
                </FormItem>
                <FormItem name="isUseRaid" label="是否有raid卡"
                  rules={[{ required: !!serverDetail.isRaid }]}>
                  <Select style={{width: 100}} disabled>
                    <Option value={1} key={1} > 是 </Option>
                    <Option value={0} key={0} > 否 </Option>
                  </Select>
                </FormItem>
                <FormItem label="raid卡型号">
                  <Input disabled value={serverDetail.raidModelId}/>
                </FormItem>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <FormItem label="备注" name="remarks"
                {...formItemLayout2}>
                <TextArea disabled
                  autoSize={{ minRows: 5}}
                  placeholder="请输入"
                  maxLength={250}
                />
              </FormItem>
            </Col>
          </Row>
        </Form>
      </React.Fragment>
    );
  }
}
export default Add;
