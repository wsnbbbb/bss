
/** ip资源管理 修 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import http from '@src/util/http';
import '../index.css';
import tools from '@src/util/tools';
import {
  Form,
  Button,
  Input,
  DatePicker,
  Row,
  Col,
  Select,
  Tooltip,
  Cascader,
  Modal
} from 'antd';
import {
  PlusCircleOutlined,
  MinusCircleOutlined
} from "@ant-design/icons";
import { inject, observer } from 'mobx-react';
import { formItemLayout, formItemLayout2, apex } from '@src/config/commvar'; // 全局通用变量
import { SYS_DICT_IP } from '@src/config/sysDict';// ip资源字典
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;

// ==================
// 所需的所有组件
// ==================
import Creat from './Creat';

@inject('root')
@inject("areaResouse")
@inject("ipresourceDict")
@observer
class Warehousing extends React.Component {
  static propTypes = {
    location: P.any, // 当前位置
    areaResouse: P.any, // 区域字典
    id: P.string, // 当前修改的ID
    ipresourceDict: P.any, // ip资源字典
    that: P.any, // 父组件对象
    root: P.any, // 全局状态
    onClose: P.func, // 关闭编辑弹窗
    onOK: P.func, // 修改成功后的回调
    defaultData: P.any, // ip基础信息
  };
  constructor(props) {
    super(props);
    console.log(this.props);
    this.formRefEdit = React.createRef();
    this.devideDetail = this.props.defaultData;
    this.state = {
      showModal: false,
      modalLoading: false,
      uw: null,
      ubitInfo: {},
      regionInfo: {},
      cabinetInfo: {},
      devideDetail: {},
      locationCode: undefined,
      lists2: [],
      arr: [{ipAddr:'',
      availableSegment:'',
      netmask:'',
      gateway:'',
      vlan:'',
      ipType: 2}],
      modalShow: false,
    };
  }
  componentDidMount() {
    this.props.areaResouse.fetchVarea();
    this.onGetCategory()
  }

  // 验证通过
  onFinish=(values)=>{
    console.log(values)
    console.log(moment(values.purchasingTime).format('YYYY-MM-DDTHH:mm:ss'))
    const param = {
      ...values,
      ipInformationReqs:this.state.arr,
      businessType:values.businessType[values.businessType.length-1]
    };
    console.log(param)
    let a=param.ipInformationReqs[0]
    if(a.availableSegment==''|| a.gateway==''|| a.ipAddr==''|| a.ipType==''|| a.netmask==''){
      Modal.warning({
        title: "提示",
        content: "请输入完整的IP信息",
        destroyOnClose: true,
      });
      return false;
    }else{
      // eslint-disable-next-line react/prop-types
      let params=param.ipInformationReqs[0].ipAddr
      // http.get(`http://10.3.9.24:8080/api/product/ipSegment/checkIps?ipAddr=${params}`)
      http.get(`${BSS_ADMIN_URL}/api/product/ipSegment/checkIps?ipAddr=${params}`)
      .then((res) => {
        console.log(res)
        if (res.data!==null) {
          Modal.warning({
            title: "提示",
            content: "当前IP库存中已存在，请不要重复添加",
            destroyOnClose: true,
          });
          return false;
        }
        this.props.onOk(param);
      })
      .catch((v) => {
        console.log(v)
        this.setState({ modalLoading: false, loading: false });
      });
    }
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.formRefEdit.current.resetFields();
  };

  onModalshow = () => {
    // 防御线路
    if (Object.keys(this.props.ipresourceDict.defenseline).length <= 0) {
      this.props.ipresourceDict.fetchdefenseline();
    }
      this.props.ipresourceDict.fetchbandwidthType();
    this.setState({
      showModal: true,
      bandwidthType: this.props.ipresourceDict.bandwidthType
    });
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.props.onClose();
  };


  //生成ip信息
  createip = (index) => {
    console.log(index)
    let arr = [...this.state.arr]
    let obj={
      ipAddr:'',
      availableSegment:'',
      netmask:'',
      gateway:'',
      vlan:'',
      ipType:2
    }
    arr.push(obj)
    console.log(this.state.arr)
    this.setState({
      arr:arr
    })
  }
  //删除ip信息
  deleteip = (index) => {
    console.log(index)
    this.state.arr.splice(index, 1)
     this.setState({
       arr:this.state.arr
     })
    // this.createip()
  }

  //获取类目数据
  onGetCategory() {
    http
      .get(`${BSS_ADMIN_URL}/api/goods/category`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let lists = res.data;
          let lists2 = [];
          lists2 = tools.formatTree(lists);
          this.setState({
            lists2: lists2,
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

  //ip 选择
  selectitem = (value,index) => {
    console.log(value,index)
    let arr=[...this.state.arr]
    arr[index].ipType=value
    this.setState({
      arr:arr
    })
  }
  //生成ip信息弹窗
  IPModalShow(index) {
    console.log(index)
    this.setState({
      ipmodalShow: true,
      nowIndex: index,
    });
  }


  onModalClose = () => {
    this.setState({
      ipmodalShow: false,
    });
  }

  onipOk=(values,index)=>{
     console.log(values,index)
       this.setState({
        IPinfo:values,
        ipmodalShow: false,
       })
       let arr=[...this.state.arr]
       arr[index]=values
      this.setState({
        arr:arr
      })
  }

  changeipAddr=(e,index)=>{
     console.log(e,index)
     let arr=[...this.state.arr]
     arr[index].ipAddr=e
     this.setState({
        arr:arr
     })
  }
  changeavailableSegment=(e,index)=>{
    console.log(e,index)
    let arr=[...this.state.arr]
    arr[index].availableSegment=e
    this.setState({
       arr:arr
    })
 }
 changenetmask=(e,index)=>{
  console.log(e,index)
  let arr=[...this.state.arr]
  arr[index].netmask=e
  this.setState({
     arr:arr
  })
}
changegateway=(e,index)=>{
  console.log(e,index)
  let arr=[...this.state.arr]
  arr[index].gateway=e
  this.setState({
     arr:arr
  })
}
changevlan=(e,index)=>{
  console.log(e,index)
  let arr=[...this.state.arr]
  arr[index].vlan=e
  this.setState({
     arr:arr
  })
}
//机房选择
onlocationChange=(value)=>{
   console.log(value)
   this.setState({
    regionId:value
   })
}
//业务类型选择
onCategoryChange=(value)=>{
  console.log(value)
  let categoryId=value[value.length-1]
  let regionId=this.state.regionId
  http
      // .get(`http://10.3.9.24:8080/api/goods/bandwidth-type/getBandwidthType?regionId=${regionId}&categoryId=${categoryId}`)
      .get(`${BSS_ADMIN_URL}/api/goods/bandwidth-type/getBandwidthType?regionId=${regionId}&categoryId=${categoryId}`)
      .then((res) => {
        res = res.data;
        console.log(res)
        if (tools.hasStatusOk(res)) {
            this.setState({
              bandwidthType:res.data
            })
        } else {
          tools.dealFail(res);
        }
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
}

  render() {
    const { vareaList } = this.props.areaResouse;
    const {ip_source, ip_customer_type, show_type, ip_type2, boolean } = SYS_DICT_IP;
    const {  lists2, ipmodalShow ,bandwidthType} = this.state;
    const defaultData = {
      ...this.props.defaultData,
      purchasingTime: this.props.defaultData.purchasingTime == null ? null : moment(this.props.defaultData.purchasingTime),
      storagetime: this.props.defaultData.storagetime == null ? null : moment(this.props.defaultData.storagetime),
    };
    return (
      <React.Fragment>
        <Form name="form_in_modal"
          ref={this.formRefEdit}
          className="g-modal-field"
          onFinish={(values) => { this.onFinish(values); }}>
          <Row>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem name="fullLocationName" label="机房/区域"
                rules={[{ required: true, message: '请选择机房' }]}
                {...formItemLayout}>
                <Select
                  showSearch
                  filterOption={tools.filterOption}
                  allowClear
                  onChange={this.onlocationChange}
                >
                  {vareaList.map((item) => (
                    <Option value={item.regionId} key={item.regionId}>
                      {item.fullLocationName}
                    </Option>
                  ))}
                </Select>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem name="businessType" rules={[{ required: true, message: '请选择所属业务' }]} label="所属业务"
                {...formItemLayout}>
                <Cascader options={lists2}  fieldNames={{ label: 'name', value: 'id', children: 'children' }} onChange={this.onCategoryChange} />
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem name="bandwidthType" rules={[{ required: true, message: '请选择带宽类型' }]} label="带宽类型"
                {...formItemLayout}>
                <Select >
                  {
                    _.map(bandwidthType, (item, key) => <Option value={item.id} key={key} > {item.bandwidthName} </Option>)
                  }
                </Select>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem name="source" rules={[{ required: true, message: '请选择ip来源' }]} label="IP来源"
                {...formItemLayout}>
                <Select>
                  {
                    _.map(ip_source, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </FormItem>
            </Col>

            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <Form.Item name="appropriateTypes" rules={[{ required: true, message: '请选择适用客户类型' }]} {...formItemLayout} label="适用客户类型">
                <Select>
                  {
                    _.map(ip_customer_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <Form.Item name="showType" rules={[{ required: true, message: '请选择显示方式' }]} {...formItemLayout} label="显示方式">
                <Select
                  placeholder=" " allowClear
                >
                  {
                    _.map(show_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <Form.Item name="isWall" rules={[{ required: true, message: '请选择是否过墙' }]} {...formItemLayout} label="是否过墙">
                <Select
                  placeholder=" " allowClear
                >
                  {
                    _.map(boolean, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <Form.Item name="isLock" rules={[{ required: true, message: '请选择是否锁定' }]} {...formItemLayout} label="是否锁定">
                <Select
                  allowClear
                >
                  {
                    _.map(boolean, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem name="isShare" rules={[{ required: true, message: '请选择是否共享' }]} label="是否共享"
                {...formItemLayout}>
                <Select
                  allowClear placeholder=" "
                >
                  {_.map(boolean, (value, key) => <Option value={parseInt(key)} key={key}>{value}</Option>)}
                </Select>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem name="purchasingTime" rules={[{ required: true, message: '请选择采购时间' }]} {...formItemLayout} label="采购时间">
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder=" "
                />
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem name="storagetime" rules={[{ required: true, message: '请选择入库时间' }]} {...formItemLayout} label="入库时间">
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder=" "
                />
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <FormItem  className="ipType" label={<span className="required"> ip信息</span>}  rules={[{ required: true}]}
                {...formItemLayout2}>
                {this.state.arr.map((item, index) =>
                  <div className="ipmsg" key={index} ref="ipmsg">
                    <Form.Item >
                    <Select defaultValue={item.ipType}
                      allowClear
                      style={{ width: 80 }}
                      onChange={(value)=>this.selectitem(value,index)}>
                      {_.map(ip_type2, (value, key) => <Option value={parseInt(key)} key={key}>{value}</Option>)}
                    </Select>
                    </Form.Item>
                    <Form.Item>
                    <Input
                      placeholder="请输入IP地址"
                      disabled={item.ipType==2}
                      type="text"
                      value={item.ipAddr}
                      onChange={(e)=>{this.changeipAddr(e.target.value,index)}}
                    />
                    </Form.Item>
                    <Form.Item>
                    <Input
                      placeholder="请输入可用IP"
                      type="text"
                      value={item.availableSegment}
                      onChange={(e)=>{this.changeavailableSegment(e.target.value,index)}}
                    />
                    </Form.Item>
                    <Form.Item>
                    <Input
                      placeholder="请输入掩码"
                      type="text"
                      value={item.netmask}
                      onChange={(e)=>{this.changenetmask(e.target.value,index)}}
                    />
                    </Form.Item>
                    <Form.Item>
                    <Input
                      placeholder="请输入网关"
                      type="text"
                      value={item.gateway}
                      onChange={(e)=>{this.changegateway(e.target.value,index)}}
                    />
                    </Form.Item>

                    <Form.Item>
                    <Input
                      placeholder="请输入vlan"
                      type="text"
                      value={item.vlan }
                      onChange={(e)=>{this.changevlan(e.target.value,index)}}
                    />
                    </Form.Item>

                    {item.ipType ==2 && <Button size="middle" className="ip_btn" onClick={() => this.IPModalShow(index)}>生成IP信息</Button>}
                    {index == 0 && <Tooltip placement="top" title="添加">
                      <PlusCircleOutlined className="ip_iconadd" onClick={() => { this.createip(index) }} />
                    </Tooltip>}
                    {index > 0 && <Tooltip placement="top" title="删除">
                      <MinusCircleOutlined className="ip_iconremove" key={index} onClick={() => { this.deleteip(index) }} />
                    </Tooltip>}
                  </div>
                )}
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <FormItem label="ip资源备注" name="remark"
                {...formItemLayout2}>
                <TextArea
                  autoSize={{ minRows: 5 }}
                  placeholder="请输入"
                  maxLength="240"
                />
              </FormItem>
            </Col>
          </Row>
          <div className="actions-btn">
            <Button htmlType="submit" className="action-btn ok">确认提交</Button>
            <Button onClick={this.onResetSearch} className="action-btn ok">重置</Button>
            <Button onClick={this.onClose} className="action-btn ok">取消</Button>
          </div>
        </Form>

        <Modal
          title='生成IP段信息'
          maskClosable={false}
          width="50%"
          destroyOnClose
          footer={false}
          onCancel={this.onModalClose}
          visible={ipmodalShow}
        >
          <Creat
           onClose={this.onModalClose} 
           onOk={this.onipOk}
           index={this.state.nowIndex}
           ></Creat>
        </Modal>
        <span onClick={() => { this.modalShow(); }}>
          {this.props.children}
        </span>
      </React.Fragment>
    );
  }
}
export default Warehousing;
