
/** 后台用户管理中心 客户信息管理**/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import {
  Form,
  Button,
  Input,
  Spin,
  Modal,
  Select,
  Row,
  Col,
} from 'antd';
import { inject, observer } from 'mobx-react';
import { formItemLayout } from '@src/config/commvar'; // 工具
import tools from '@src/util/tools'; // 工具
import { SYS_DICT_CUSTOMER, SYS_DICT_IP } from '@src/config/sysDict';// 后台用户管理中心字典


// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { Option } = Select;

@inject('root')
@inject('customerDict')

@observer
class Customer extends React.Component {
  static propTypes = {
    root: P.any, // 全局状态
    operateType: P.string, // 操作类型
    powers: P.array, // 当前登录用户权限
    data: P.any,  // 当前选中的信息
    visible: P.bool, // 是否开启弹窗
    modalLoading: P.bool, // 添加/修改/查看 是否正在请求中
    onOk: P.func, // 确认提交回调
    onClose: P.func, // 关闭弹窗回调
    customerDict: P.any, // 客户字典
  };
  constructor (props) {
    super(props);
    this.formRef = React.createRef();
    this.parId = undefined; // value 在state中更新不及时，所以传递数据的上级接口存到parId
    this.state = {
      modalLoading: false,
      modalShowRegion: false,
    };
    this.props.customerDict.fetchpayCompany();
  }

  // 验证通过
  onFinish (values) {
    const { operateType, data } = this.props;
    if (operateType === 'add') {
      let params = {
        ...values,
        salesId: values.salesName,
        salesSupportId: values.salesSupportName,
        agencyLevel: values.agencyLevelName,
      };
      this.props.onOk(params);
    } else {
      let params = {
        ...values,
        id: data.id,
        salesId: values.salesName,
        salesSupportId: values.salesSupportName,
        agencyLevel: values.agencyLevelName,
      };
      this.props.onOk(params);
    }
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.formRef.current.resetFields();
  };

  /** 点击关闭时触发 **/
  onClose = () => {
    this.props.onClose();
  };


  render () {
    const { operateType, data, modalLoading, visible } = this.props;
    const { customer_account_status, customer_pay_type, customer_ip_source, customer_add_status,customer_lable_type } = SYS_DICT_CUSTOMER;
    const { ip_customer_type } = SYS_DICT_IP;
    // eslint-disable-next-line react/prop-types
    const { customersource, customerindustry, agencyLevel, saleslist, saleSupportlist ,payCompany} = this.props.customerDict;
    console.log(this.props);
    return (
      <div>
        <Modal
          title={
            { add: '客户信息添加', up: '客户信息修改', see: '客户信息查看' }[operateType]
          }
          maskClosable={false}
          width="60%"
          destroyOnClose
          footer={null}
          onCancel={this.props.onClose}
          visible={visible}
        >
          <Spin tip="Loading..." spinning={modalLoading}>
            <Form name="form_in_modal"
              ref={this.formRef}
              className="g-modal-field"
              onFinish={(values) => {this.onFinish(values);}}
              initialValues={data}>
              <Row>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="email" label="用户邮箱"
                    rules={[{required: true, message: '请输入用户邮箱'}]}
                    {...formItemLayout}>
                    <Input
                      // placeholder="自动生成"
                      type="text"
                      disabled={operateType === 'see'}
                      maxLength={30}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="loginName" label="用户名"
                    rules={[{ required: true, message: '请输入用户名'}]}
                    {...formItemLayout}>
                    <Input
                      // placeholder="自动生成"
                      type="text"
                      disabled={operateType === 'see'}
                      maxLength={30}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item name="salesName" {...formItemLayout} label="销售"
                    rules={[{ required: true, message: '请选择销售'}]}>
                    <Select disabled={operateType === 'see'}
                      showSearch
                      filterOption={tools.filterOption}>
                      {
                        _.map(saleslist, (item, key) => <Option value={key} key={key}> {item} </Option>)
                      }
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item name="salesSupportName"  {...formItemLayout} label="销售支持"
                    rules={[{ required: true, message: '请选择销售支持'}]}>
                    <Select disabled={operateType === 'see'}
                      showSearch
                      filterOption={tools.filterOption}>
                      {_.map(saleSupportlist, (item, key) => <Option value={key} key={key}> {item} </Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item name="agencyLevelName"  {...formItemLayout} label="代理等级"
                    rules={[{ required: true, message: '请选择代理等级'}]}>
                    <Select disabled={operateType === 'see'}>
                      {
                        _.map(agencyLevel, (item, key) => <Option value={key} key={key}> {item} </Option>)
                      }
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item name="payType" rules={[{ required: true, message: '请选择付费类型' }]} {...formItemLayout} label="付费类型"
                  >
                    <Select disabled={operateType === 'see'}>
                      {
                        _.map(customer_pay_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="label" label="用户标签"
                    rules={[{ required: true, message: '请选择用户标签' }]}
                    {...formItemLayout}>
                    <Select disabled={operateType === 'see'}>
                      {
                        _.map(customer_lable_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="status" label="用户状态"
                    rules={[{ required: true, message: '请选择用户状态' }]}
                    {...formItemLayout}>
                    <Select disabled={operateType === 'see'}>
                      {
                        _.map(customer_account_status, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="payCompanyId" label="支付主体"
                    rules={[{ required: true, message: '请选择支付主体' }]}
                    {...formItemLayout}>
                    <Select disabled={operateType === 'see'}>
                      {
                        _.map(payCompany, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="attribution" label="客户归属地"
                    rules={[{ required: true, message: '请选择客户归属地' }]}
                    {...formItemLayout}>
                    <Select disabled={operateType === 'see'}>
                      {
                        _.map(customer_ip_source, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="realName" label="客户姓名"
                    // rules={[{ required: true, message: '请输入用户姓名'  }]}
                    {...formItemLayout}>
                    <Input
                      // placeholder="自动生成"
                      type="text"
                      disabled={operateType === 'see'}
                      maxLength={30}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item name="type" {...formItemLayout} label="客户类型">
                    <Select disabled={operateType === 'see'}>
                      {
                        _.map(ip_customer_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item name="source" {...formItemLayout} label="客户来源">
                    <Select disabled={operateType === 'see'}>
                      {
                        _.map(customersource, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <Form.Item name="industry"  {...formItemLayout} label="客户行业">
                    <Select disabled={operateType === 'see'}>
                      {
                        _.map(customerindustry, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="qq" label="QQ号"
                    // rules={[{ required: true, message: '请输入QQ号' }]}
                    {...formItemLayout}>
                    <Input
                      // placeholder="自动生成"
                      type="text"
                      disabled={operateType === 'see'}
                      maxLength={30}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem name="address" label="通讯地址"
                    // rules={[{ required: true, message: '请输入通讯地址' }]}
                    {...formItemLayout}>
                    <Input
                      // placeholder="自动生成"
                      type="text"
                      disabled={operateType === 'see'}
                      maxLength={150}
                    />
                  </FormItem>
                </Col>
              </Row>
              <div className="actions-btn">
                {(operateType !== 'see') && <Button htmlType="submit" className="action-btn ok">确认</Button>}
                <Button onClick={this.onClose} className="action-btn ok">取消</Button>
              </div>
            </Form>
          </Spin>
        </Modal>
      </div>
    );
  }
}
export default Customer;
