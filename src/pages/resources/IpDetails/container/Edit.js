
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
  Cascader,
  Modal
} from 'antd';
import { inject, observer} from 'mobx-react';
import {formItemLayout, formItemLayout2, apex } from '@src/config/commvar'; // 全局通用变量
import {SYS_DICT_IP} from '@src/config/sysDict';// ip资源字典

// ==================
// Definition
// ==================
const { TextArea } = Input;
const { Option } = Select;

@inject('root')
@inject("areaResouse")
@inject("CategoryProduct")
@inject("ipresourceDict")
@observer
class Edit extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    root: P.any, // 全局资源
    that: P.any, // 父组件对象
    children: P.any,
    areaResouse: P.any, // 区域字典
    ipresourceDict: P.any, // ip资源字典
    CategoryProduct: P.any, // 业务
    powers: P.array, // 当前登录用户权限
    onClose: P.func, // 关闭编辑弹窗
    onOK: P.func, // 添加成功后的回调
    deviceId: P.string, // ip id
    defaultData: P.any, // ip基础信息
    id: P.any, // 当前id
  };
  constructor (props) {
    super(props);
    console.log(props);
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
    this.getIP(this.props.id);
  }

  getIP (id) {
    this.setState({
      modalLoading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/product/ipAddr?id=${id}&valueType=update`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let data = res.data.records[0];
          this.setState({
            modalLoading: false,
            devideDetail: data,
            defenseValues: data.defenseValues,
            regionId: data.regionId,
          });
          let businessType = tools.getCascaderValues(this.props.CategoryProduct.categoryList, data.businessType, []);
          businessType = businessType.length > 0 ? _.reverse(businessType) : [];
          // 带入值
          this.formRefEdit.current.setFieldsValue({
            fullLocationName: data.fullLocationName,
            ipAddr: data.ipAddr,
            ipSegment: data.ipSegment,
            ipType: data.ipType,
            masterProduct: data.masterProduct,
            businessType: businessType,
            isDefense: data.isDefense,
            defenseType: data.defenseType,
            defenseLine: data.defenseLine,
            isShare: data.isShare,
            bandwidthType: data.bandwidthType,
            source: data.source,
            isLock: data.isLock,
            // resStatus: data.resStatus,
            specialStatus: data.specialStatus,
            ipSegmentRemark: data.ipSegmentRemark,
            remark: data.remark,
            // eslint-disable-next-line no-dupe-keys
            ipSegmentRemark: data.ipSegmentRemark,
            showType: data.showType,
            appropriateTypes: data.appropriateTypes,
            isWall: data.isWall,
            // eslint-disable-next-line no-dupe-keys
          });
        } else if (res.code == 20010) {
          this.props.onClose();
          Modal.error({
            title: '操作失败',
            content: res.message,
          });
          this.setState({
            modalLoading: false,
          });
        }
      })
      .catch(() => {
        this.setState({
          modalLoading: false,
        });
      });
  }

  // 验证通过
  onFinish (values) {
    const param = {
      regionId: this.state.regionId,
      ...values,
      businessType: _.last(values.businessType),
      bandwidthType: values.bdtype,
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
    if (this.props.areaResouse.vareaList.length <= 0) {
      this.props.areaResouse.fetchVarea();
    }
    // 防御线路
    if (Object.keys(this.props.ipresourceDict.defenseline).length <= 0) {
      this.props.ipresourceDict.fetchdefenseline();
    }
    // 带宽类型
    if (Object.keys(this.props.ipresourceDict.bandwidthType).length <= 0) {
      this.props.ipresourceDict.fetchbandwidthType();
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


  // 修改峰值
  onChange (value) {
    // console.log('changed', value);
  }

// 机房选择
onlocationChange=(value) => {
  console.log(value);
  this.setState({
    regionId: value
  });
}
// 业务类型选择
onCategoryChange=(value) => {
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
  const {vareaList} = this.props.areaResouse;
  const {bandwidthType, businessTypeName, bandwidthTypeName} = this.state;
  const { ip_source, ip_customer_type, show_type, ip_type, ip_res_statusSlect2, boolean} = SYS_DICT_IP;
  let businessType = tools.getCascaderValues(this.props.CategoryProduct.categoryList, this.props.defaultData.businessType, []);
  const defaultData = {
    ...this.props.defaultData,
    purchasingTime: this.props.defaultData.purchasingTime == null ? null : moment(this.props.defaultData.purchasingTime),
    storageTime: this.props.defaultData.storageTime == null ? null : moment(this.props.defaultData.storageTime),
    businessType: businessType.length > 0 ? _.reverse(businessType) : []
  };
  return (
    <React.Fragment>
      <Form name="form_in_modal"
        ref={this.formRefEdit}
        className="g-modal-field"
        initialValues={defaultData}
        onFinish={(values) => {this.onFinish(values);}}>
        <Row>
          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <Form.Item  name="fullLocationName" label="机房/区域" placeholder="请选择机房"
              rules={[{required: true, message: '请选择机房'}]}
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
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <Form.Item  label="所属业务"
              rules={[{required: true, message: '请选择所属业务'}]}
              name="businessType"
              {...formItemLayout}>
              <Cascader options={this.props.CategoryProduct.categoryTreeList} placeholder="请选择所属业务" fieldNames={{ label: 'name', value: 'id', children: 'children' }}  onChange={this.onCategoryChange}/>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <Form.Item name="bdtype" label={<span className="required"> 带宽类型</span>}
              {...formItemLayout}>
              <Select defaultValue={bandwidthTypeName}>
                {
                  _.map(bandwidthType, (item, key) => <Option value={item.id} key={key} > {item.bandwidthName} </Option>)
                }
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <Form.Item name="source" label={<span className="required"> ip来源</span>}
              {...formItemLayout}>
              <Select disabled   >
                {
                  _.map(ip_source, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                }
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <Form.Item name="ipAddr" label={<span className="required"> ip名称</span>}
              {...formItemLayout}>
              <Input
                type="text"
                disabled
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <Form.Item name="ipSegment" label={<span className="required"> ip段信息</span>}
              {...formItemLayout}>
              <Input
                type="text"
                disabled
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <Form.Item name="ipType" label={<span className="required"> ip分类</span>}
              {...formItemLayout}>
              <Select  disabled>
                {
                  _.map(ip_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                }
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <Form.Item name="appropriateTypes" rules={[{ required: true, message: '请选择客户类型'}]} {...formItemLayout} label="适用客户类型">
              <Select
                placeholder=" " allowClear
              >
                {_.map(ip_customer_type, (value, key) => <Option value={parseInt(key)} key={key}>{value}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <Form.Item name="showType" rules={[{ required: true, message: '请选择显示方式'}]} {...formItemLayout} label="显示方式">
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
            <Form.Item name="isWall" rules={[{ required: true, message: '请选择是否过墙'}]} {...formItemLayout} label="是否过墙">
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
            <Form.Item name="isLock"  {...formItemLayout} label={<span className="required"> 是否锁定</span>}>
              <Select
                allowClear defaultValue="否" disabled
              >
                {
                  _.map(boolean, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                }
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <Form.Item name="isShare" label={<span className="required"> 是否共享</span>}
              {...formItemLayout}>
              <Select
                allowClear placeholder=" "
              >
                {_.map(boolean, (value, key) => <Option value={parseInt(key)} key={key}>{value}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <Form.Item name="purchasingTime" label={<span className="required"> 采购时间</span>}
              {...formItemLayout}>
              <DatePicker placeholder=" "
                style={{width: "100%"}}
                disabled
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <Form.Item name="storageTime" label={<span className="required"> 入库时间</span>}
              {...formItemLayout}>
              <DatePicker placeholder=" "
                style={{width: "100%"}}
                disabled
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <Form.Item name="resStatus" {...formItemLayout} rules={[{ required: true, message: '请选择资源状态'}]} {...formItemLayout} label="资源状态">
              <Select
                allowClear placeholder=" " disabled
              >
                {
                  _.map(ip_res_statusSlect2, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                }
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Form.Item label="ip资源备注" name="ipSegmentRemark"
              {...formItemLayout2}>
              <TextArea
                disabled
                autoSize={{ minRows: 5}}
                placeholder=" "
                maxLength="240"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={24} lg={24} xl={24}>
            <Form.Item label="ip备注" name="remark"
              {...formItemLayout2}>
              <TextArea
                maxLength="240"
                autoSize={{ minRows: 5}}
                placeholder="请输入"
              />
            </Form.Item>
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
