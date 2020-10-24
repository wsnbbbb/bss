import React from 'react';
import P from 'prop-types';
import {
  Form,
  Select,
  InputNumber,
  Switch,
  Radio,
  DatePicker,
  Button,
  Upload,
  Modal,
  Checkbox,
  Row,
  Col,
  Input,
} from 'antd';
import {formItemLayout, formItemLayout2} from '@src/config/commvar'; // 全局通用变量
import {SYS_DICT_PRODUCT, SYS_DICT_COMMON} from '@src/config/sysDict'; // 系统字典
import { User } from '@src/util/user';
const { Option } = Select;
class Transaction extends React.Component {
  static propTypes = {
    saveContent: P.func, // 保存配置
    defaultValue: P.any, // 默认值（点击保存后的值）
  }
  constructor (props) {
    super(props);
    this.state = {
      payModel: undefined, // 交易模式
      editable: false,
    };
  }

  onFinish = (values) => {
    console.log(values);
    this.props.saveContent(values);
    this.setState({
      editable: true,
    });
  };
  // 修改交易模式
  onChangePayModel = (e) => {
    this.setState({
      payModel: e.target.value
    });
  };

  // 修改编辑状态
 editChange = (editable) => {
   this.setState({ editable });
 };

 render () {
   const { payModel, editable } = this.state;
   const radioStyle = {
     display: 'block',
     height: '30px',
     lineHeight: '30px',
   };
   return (
     <div style={{maxWidth: 800}}>
       <Form
         name="validate_other"
         onFinish={this.onFinish}
         initialValues={this.props.defaultValue}
         className="g-modal-field"
       >
         <Form.Item
           name="tradingMode"
           label="设置交易模式"
           rules={[{ required: true, message: '请选择' }]}
           {...formItemLayout}
         >
           <Select placeholder="设置交易模式" disabled={editable}>
             {
               _.map(SYS_DICT_PRODUCT.customer_pay_type, (value, key) => <Select.Option value={parseInt(key)} key={key}>{value}</Select.Option>)
             }
           </Select>
         </Form.Item>

         <Form.Item label={<span className="required">设置计费模式</span>}
           {...formItemLayout}>
           <Form.Item name="chargingMode"
             rules={[{ required: true, message: '请选择' }]}>
             <Radio.Group onChange={this.onChangePayModel} value={payModel} disabled={editable}>
               {
                 _.map(SYS_DICT_PRODUCT.pay_model, (value, key) => <Radio style={radioStyle} value={parseInt(key)} key={key}>{value}</Radio>)
               }
             </Radio.Group>
           </Form.Item>

           {payModel == 3 && <div style={{marginLeft: 30}}>
             <Form.Item name="way" label="统计方式"
               rules={[{ required: payModel == 3, message: '请选择' }]}>
               <Select placeholder="统计方式" disabled={editable}>
                 <Option value="red">test数据</Option>
               </Select>
             </Form.Item>
             <Form.Item name="period" label="计费周期"
               rules={[{ required: payModel == 3, message: '请选择' }]}>
               <Select placeholder="计费周期" disabled={editable}>
                 <Option value="test">test</Option>
                 <Option value="red">日</Option>
                 <Option value="green">周</Option>
                 <Option value="blue">月</Option>
                 <Option value="blue">年</Option>
               </Select>
             </Form.Item>
           </div>}
         </Form.Item>
         <Form.Item label={<span className="required">设置运营成本</span>}
           {...formItemLayout}>
           <Form.Item name="operatingCosts"
             rules={[{ required: true, message: '请输入', type: "number" }]}
             style={{display: "inline-block", width: 200}}
             {...formItemLayout}>
             <InputNumber disabled={editable} />
           </Form.Item>
           <Form.Item name="currency"
             style={{display: "inline-block", width: 200}}
             rules={[{ required: true, message: '请输入' }]}
             {...formItemLayout}>
             <Select disabled>
               {
                 _.map(SYS_DICT_COMMON.currency, (value, key) => <Select.Option value={parseInt(key)} key={key}>{value}</Select.Option>)
               }
             </Select>
           </Form.Item>
         </Form.Item>
         <Form.Item name="grossProfit" label="设置毛利率"
           rules={[{ required: true, message: '请输入' }]}
           {...formItemLayout}>
           <InputNumber
             min={0}
             disabled={editable}
             formatter={(value) => `${value}%`}
             parser={(value) => value.replace('%', '')}
           />
         </Form.Item>
         <div className="actions-btn" style={{textAlign: "center"}}>
           {!editable && <Button htmlType="submit" className="action-btn ok">保存</Button>}
           {editable && <Button className="action-btn ok" onClick={() => {this.editChange(false);}}>编辑</Button>}
         </div>
       </Form>
     </div>
   );
 }

};

export default Transaction;
