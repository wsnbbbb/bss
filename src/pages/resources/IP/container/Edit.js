
/** ip资源管理 修 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import http from '@src/util/http';
import tools from '@src/util/tools';
import {
  Form,
  Button,
  Input,
  DatePicker,
  Row,
  Col,
  Select,
  Cascader
} from 'antd';
import { inject, observer } from 'mobx-react';
import { formItemLayout, formItemLayout2, apex } from '@src/config/commvar'; // 全局通用变量
import { SYS_DICT_IP } from '@src/config/sysDict';// ip资源字典
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;

@inject('root')
@inject("areaResouse")
@inject("CategoryProduct")
@inject("ipresourceDict")
@observer
class Edit extends React.Component {
  static propTypes = {
    location: P.any, // 当前位置
    areaResouse: P.any, // 区域字典
    CategoryProduct: P.any, // 业务
    id: P.string, // 当前修改的ID
    ipresourceDict: P.any, // ip资源字典
    that: P.any, // 父组件对象
    root: P.any, // 全局状态
    onClose: P.func, // 关闭编辑弹窗
    onOK: P.func, // 修改成功后的回调
    defaultData: P.any, // ip基础信息
  };
  constructor (props) {
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
      regionId: this.props.defaultData.regionId,
      businessTypeName: [this.props.defaultData.businessTypeName],
      bandwidthTypeName: this.props.defaultData.bandwidthTypeName,
      businessType: this.props.defaultData.businessType,
      bandwidthType: this.props.defaultData.bandwidthType,
    };
  }
  componentDidMount () {
    this.props.areaResouse.fetchVarea();
    this.onlocationChange(this.state.regionId)
  }

  // 验证通过
  onFinish (values) {
    const param = {
      regionId: this.state.regionId,
      bandwidthType: values.bdtype,
      ...values,
      businessType: _.last(values.businessType) || '',
    };
    console.log(param);
    // eslint-disable-next-line react/prop-types
    this.props.onOk(param);
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
    
    this.setState({
      showModal: true
    });
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.props.onClose();
  };
  onShowPortModal = () => {
    this.setState({
      showPortModal: true,
    });
  }
  onClosePort = () => {
    this.setState({
      showPortModal: false,
    });
  }


  // 机房选择
  onlocationChange = (value) => {
    console.log(this.state.businessType);
    let categoryId = this.state.businessType;
    this.setState({
      regionId:value
    })
    http
      // .get(`http://10.3.9.24:8080/api/goods/bandwidth-type/getBandwidthType?regionId=${value}&categoryId=${categoryId}`)
      .get(`${BSS_ADMIN_URL}/api/goods/bandwidth-type/getBandwidthType?regionId=${value}&categoryId=${categoryId}`)
      .then((res) => {
        res = res.data;
        console.log(res);
        if (tools.hasStatusOk(res)) {
          this.setState({
            bandwidthType: res.data
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
  // 业务类型选择
  onCategoryChange = (value) => {
    console.log(value);
    let categoryId = value[value.length - 1];
    this.setState({
      businessType: categoryId
    });
    let regionId = this.state.regionId;
    http
      // .get(`http://10.3.9.24:8080/api/goods/bandwidth-type/getBandwidthType?regionId=${regionId}&categoryId=${categoryId}`)
      .get(`${BSS_ADMIN_URL}/api/goods/bandwidth-type/getBandwidthType?regionId=${regionId}&categoryId=${categoryId}`)
      .then((res) => {
        res = res.data;
        console.log(res);
        if (tools.hasStatusOk(res)) {
          this.setState({
            bandwidthType: res.data
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
  render () {
    const { vareaList } = this.props.areaResouse;
    const { ip_source, ip_customer_type, show_type, ip_type, boolean } = SYS_DICT_IP;
    const { ipAddr, availableSegment, netmask, gateway, vlan, ipType } = this.props.defaultData;
    const { bandwidthType, businessTypeName, bandwidthTypeName } = this.state;
    let businessType = tools.getCascaderValues(this.props.CategoryProduct.categoryList, this.props.defaultData.businessType, []);
    businessType = businessType.length > 0 ? _.reverse(businessType) : [];
    const defaultData = {
      ...this.props.defaultData,
      purchasingTime: this.props.defaultData.purchasingTime == null ? null : moment(this.props.defaultData.purchasingTime),
      storagetime: this.props.defaultData.storagetime == null ? null : moment(this.props.defaultData.storagetime),
      businessType: businessType
    };
    let test = tools.getCascaderValues(this.props.CategoryProduct.categoryList, this.props.defaultData.businessType, []);
    return (
      <React.Fragment>
        <Form name="form_in_modal"
          ref={this.formRefEdit}
          className="g-modal-field"
          initialValues={defaultData}
          onFinish={(values) => {this.onFinish(values);}}>
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
              <FormItem label="所属业务"
                rules={[{required: true, message: '请选择所属业务'}]}
                name="businessType"
                {...formItemLayout}>
                <Cascader options={this.props.CategoryProduct.categoryTreeList} placeholder="请选择所属业务" fieldNames={{ label: 'name', value: 'id', children: 'children' }} onChange={this.onCategoryChange} />
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem name="bdtype" label={<span className="required"> 带宽类型</span>}
                {...formItemLayout}>
                <Select defaultValue={bandwidthTypeName}>
                  {
                    _.map(bandwidthType, (item, key) => <Option value={item.id} key={key} > {item.bandwidthName} </Option>)
                  }
                </Select>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem name="source" label={<span className="required"> ip来源</span>}
                {...formItemLayout}>
                <Select disabled>
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
                  allowClear defaultValue="否"
                >
                  {
                    _.map(boolean, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem name="isShare" label={<span className="required"> 是否共享</span>}
                {...formItemLayout}>
                <Select
                  allowClear placeholder=" "
                >
                  {_.map(boolean, (value, key) => <Option value={parseInt(key)} key={key}>{value}</Option>)}
                </Select>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem name="purchasingTime" {...formItemLayout} label={<span className="required"> 采购时间</span>}>
                <DatePicker disabled
                  style={{ width: "100%" }}
                  placeholder=" "
                />
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
              <FormItem name="storagetime"  {...formItemLayout} label={<span className="required"> 入库时间</span>}>
                <DatePicker disabled
                  style={{ width: "100%" }}
                  placeholder=" "
                />
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <FormItem name="ipType" label={<span className="required"> ip信息</span>}
                {...formItemLayout2}>
                <div className="ipmsg">
                  <Select value={ipType}
                    allowClear disabled
                    style={{ width: 80 }}>
                    {_.map(ip_type, (value, key) => <Option value={parseInt(key)} key={key}>{value}</Option>)}
                  </Select>
                  <Input
                    placeholder=" "
                    type="text"
                    disabled
                    value={ipAddr}
                  />
                  <Input
                    placeholder=" "
                    type="text"
                    disabled
                    value={availableSegment}
                  />
                  <Input
                    placeholder=" "
                    type="text"
                    disabled
                    value={netmask}
                  />
                  <Input
                    placeholder=" "
                    type="text"
                    disabled
                    value={gateway}
                  />
                  <Input
                    placeholder=" "
                    type="text"
                    disabled
                    value={vlan}
                  />
                </div>

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
      </React.Fragment>
    );
  }
}
export default Edit;
