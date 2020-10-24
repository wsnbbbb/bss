
/** 后台用户管理中心 代理等级设置 **/

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
  Row,
  Col,
  Select,
  InputNumber,
  Radio
} from 'antd';
import { inject, observer } from 'mobx-react';
import { formItemLayout3,timeUnit } from '@src/config/commvar'; // 工具


// ==================
// Definition
// ==================
const FormItem = Form.Item;

@inject('root')
@observer
class TradingModel extends React.Component {
  static propTypes = {
    root: P.any, // 全局状态
    operateType: P.string, // 操作类型
    powers: P.array, // 当前登录用户权限
    data: P.any,  // 当前选中的信息
    visible: P.bool, // 是否开启弹窗
    modalLoading: P.bool, // 添加/修改/查看 是否正在请求中
    onClose: P.func, // 关闭弹窗回调
  };
  constructor(props) {
    super(props);
    console.log(this.props);
    this.formRef = React.createRef();
    this.parId = undefined; // value 在state中更新不及时，所以传递数据的上级接口存到parId
    this.state = {
      modalLoading: false,
      modalShowRegion: false,
    };
  }

  componentWillReceiveProps(props){
    console.log(props)
    this.setState({
       orderPayCycle:props.data.orderPayCycle,
       orderMaxNoPay:props.data.orderMaxNoPay,
       billingCycle:props.data.billingCycle,
       billPayCycle:props.data.billPayCycle
    })
  }

  // 验证通过
  onFinish=(values)=> {
    console.log(values)
    const { operateType, data } = this.props;
    if (operateType === 'add') {
      if(values.modeType==1){
        let params={
          modeName:values.modeName,
          modeType:values.modeType==1?'0301':'0302',
          modeParameter:{
            orderPayCycle:this.state.orderPayCycle+values.unit1,
            orderMaxNoPay:this.state.orderMaxNoPay,
            // billingCycle:"",
            // billPayCycle:"",
          },
          notifyUrl:values.notifyUrl,
          product:values.product
        }
        console.log(params);
        this.props.onOk(params);

      }else{
        let params={
          modeName:values.modeName,
          modeType:values.modeType==1?'0301':'0302',
          modeParameter:{
            // orderPayCycle:"",
            // orderMaxNoPay:"",
            billingCycle:this.state.billingCycle+values.unit2,
            billPayCycle:this.state.billPayCycle+values.unit3,
          },
          notifyUrl:values.notifyUrl,
          product:values.product
        }
        console.log(params);
        this.props.onOk(params);

      }
    } else {
      if(values.modeType==1){
        let params={
          modeName:values.modeName,
          id:data.id,
          // modeType:values.modeType==1?'0301':'0302',
          modeParameter:{
            orderPayCycle:this.state.orderPayCycle+values.unit1,
            orderMaxNoPay:this.state.orderMaxNoPay,
            // billingCycle:"",
            // billPayCycle:"",
          },
          notifyUrl:values.notifyUrl,
          // product:values.product
        }
        console.log(params);
        this.props.onOk(params);
      }else
      if(values.modeType==2){
        let params={
          modeName:values.modeName,
          id:data.id,
          // modeType:values.modeType==1?'0301':'0302',
          modeParameter:{
            // orderPayCycle:"",
            // orderMaxNoPay:"",
            billingCycle:this.state.billingCycle+values.unit2,
            billPayCycle:this.state.billPayCycle+values.unit3,
          },
          notifyUrl:values.notifyUrl,
          // product:values.product
        }
        console.log(params);
        this.props.onOk(params);
      }
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
    this.parId = -1;
    this.props.onClose();
  };


  /**
   * 确定选择指定地区
   * @param {string} id
   */
  onSelectRegion = (id) => {
    this.parId = id;
  }

  inputnum() {
    // console.log(event.target.value);
    if (event.target.value < 0 || event.target.value > 100) {
      Modal.warning({
        title: "警告",
        content: "请输入0-100的值",
        destroyOnClose: true,
      });
      this.formRef.current.setFieldsValue({
        discount: null,
        warning: null,
        audit: null,
      });
      return true;
    } else {
      return true;
    }
  }

  onChange = e => {
    console.log(e.target.value);
    if (e.target.value == 1) {
      this.refs.Prepayment.style.display = 'block'
      this.refs.postpaid.style.display = 'none'
    } else if (e.target.value == 2) {
      this.refs.Prepayment.style.display = 'none'
      this.refs.postpaid.style.display = 'block'
    }
  };

  changnum1 =(e)=>{
    console.log(e);
    this.setState({
      orderPayCycle:e
    })
  } 
  changnum2 =(e)=>{
    console.log(e);
    this.setState({
      orderMaxNoPay:e
    })
  } 
  changnum3 =(e)=>{
    console.log(e);
    this.setState({
      billingCycle:e
    })
  } 
  changnum4 =(e)=>{
    console.log(e);
    this.setState({
      billPayCycle:e
    })
  } 

  render() {
    const { operateType, data, modalLoading, visible,productList} = this.props;

    if(data.modeType=="0301"){
        data.modeType=1
    }else{
      data.modeType=2
    }

    const orderPayCycle=this.props.data.orderPayCycle;
    const orderMaxNoPay=this.props.data.orderMaxNoPay
    const billingCycle=this.props.data.billingCycle;
    const billPayCycle=this.props.data.billPayCycle

    const style_Prepayment=this.props.data.style_Prepayment;
    const style_postpaid=this.props.data.style_postpaid
    return (
      <div>
        <Modal
          title={
            { up: '交易模式修改', see: '交易模式查看', add: '自定义交易模式' }[operateType]
          }
          maskClosable={false}
          width="50%"
          destroyOnClose
          footer={null}
          onCancel={this.props.onClose}
          visible={visible}
        >
          <Spin tip="Loading..." spinning={modalLoading}>
            <Form name="form_in_modal"
              ref={this.formRef}
              className="g-modal-field"
              onFinish={(values) => { this.onFinish(values); }}
              initialValues={data}>
              <Row>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem name="modeType" label="模式类型"
                    rules={[{ required: true, message: '请选择模式类型' }]}
                    {...formItemLayout3}>
                    <Radio.Group onChange={this.onChange} disabled={operateType === 'up'}>
                      <Radio value={1}>预付费模式</Radio>
                      <Radio value={2}>后付费模式</Radio>
                    </Radio.Group>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem name="id" label="模式ID"
                    rules={[{ required: true, message: '请输入模式ID' }]}
                    {...formItemLayout3}>
                    <Input
                      type="text"
                      disabled={operateType === 'see'}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem name="modeName" label="模式名"
                    rules={[{ required: true, message: '请输入模式名' }]}
                    {...formItemLayout3}>
                    <Input
                      type="text"
                      disabled={operateType === 'see'}
                    // onBlur={() => {this.inputnum();}}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem name="notifyUrl" label="回调地址"
                    rules={[{ required: true, message: '请输入支付成功后通知业务回调的地址' }]}
                    {...formItemLayout3}>
                    <Input
                      type="text"
                      disabled={operateType === 'see'}
                    // onBlur={() => {this.inputnum();}}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem name="product" label="使用的产品/业务"
                    rules={[{ required: true, message: '请选择使用的产品/业务' }]}
                    {...formItemLayout3}>
                    <Select disabled={operateType === 'up'}>
                      {
                        _.map(productList, (item, key) => <Option value={item.id} key={key}> {item.name} </Option>)
                      }
                    </Select>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem label="参数配置"
                    {...formItemLayout3}> 
                    <div ref="Prepayment" style={{ display: style_Prepayment }}>
                      <Form.Item noStyle name='orderPayCycle'>
                        订单支付周期：<InputNumber min={1} defaultValue={orderPayCycle}  style={{ width: 120 }} onChange={this.changnum1}/>
                      </Form.Item>
                      <Form.Item name="unit1" noStyle>
                        <Select
                          allowClear
                          style={{ width: 80 }}>
                          {_.map(timeUnit, (value, key) => <Option value={key} key={key}>{value}</Option>)}
                        </Select>
                      </Form.Item><br></br><br></br>
                      <Form.Item noStyle name='orderMaxNoPay'>
                        未支付订单数量：<InputNumber min={1} defaultValue={orderMaxNoPay} onChange={this.changnum2} style={{ width: 180 }} />
                      </Form.Item>
                    </div>
                    <div ref="postpaid" style={{ display: style_postpaid }}>
                      <Form.Item noStyle name='billingCycle'>
                        计费周期：<InputNumber min={1}  defaultValue={billingCycle} onChange={this.changnum3} style={{ width: 120 }}/>
                      </Form.Item>
                      <Form.Item name="unit2" noStyle >
                        <Select
                          allowClear
                          style={{ width: 80 }}>
                          {_.map(timeUnit, (value, key) => <Option value={key} key={key}>{value}</Option>)}
                        </Select>
                      </Form.Item><br></br><br></br>
                      <Form.Item noStyle name='billPayCycle'>
                        账单支付周期：<InputNumber min={1}  defaultValue={billPayCycle} onChange={this.changnum4} style={{ width: 120 }} />
                      </Form.Item>
                      <Form.Item name="unit3" noStyle>
                        <Select
                          allowClear 
                          style={{ width: 80 }}>
                          {_.map(timeUnit, (value, key) => <Option value={key} key={key}>{value}</Option>)}
                        </Select>
                      </Form.Item>
                    </div>
                  </FormItem>
                </Col>
              </Row>
              <div className="actions-btn">
                <Button htmlType="submit" className="action-btn ok">确认</Button>
                <Button onClick={this.onClose} className="action-btn ok">取消</Button>
              </div>
            </Form>
          </Spin>
        </Modal>
      </div>
    );
  }
}
export default TradingModel;
