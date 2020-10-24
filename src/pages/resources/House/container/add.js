
/** 机房 增 修 查 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P, { number } from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import {
  Form,
  Button,
  Input,
  InputNumber,
  DatePicker,
  Row,
  Col,
  Spin,
  Modal,
  Select,
} from 'antd';
import { observer} from 'mobx-react';
import {formItemLayout, formItemLayout2} from '@src/config/commvar'; // 工具
import { SYS_DICT_HOUSE } from '@src/config/sysDict'; // 系统字典
import AreaSelect from '@src/pages/resources/container/AreaSelect';
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;

@observer
class Add extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    operateType: P.string,
    data: P.any,  // 当前选中的信息
    HouseLevel: P.any,  // 机房等级
    visible: P.bool, // 弹框是否显示
    modalLoading: P.bool, // 添加/修改/查看 是否正在请求中
    onOk: P.func, // 弹框确认
    onClose: P.func, // 只关闭弹窗
  };
  formRefAdd = React.createRef();
  constructor (props) {
    super(props);
    this.selectAreaNode = {}; // 选中的地区节点信息
    this.state = {
      modalLoading: false,
      modalShowArea: false,
      districtId: '',
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
    const { operateType } = this.props;
    if (operateType === 'see') {
      // 是查看
      this.props.onClose();
      return;
    }
    if (values.voltageUnit) { // 将电力和单位拼接起来
      let cabinetAmp = values.cabinetAmp + values.voltageUnit;
      delete values['voltageUnit'];
      values['cabinetAmp'] = cabinetAmp;
    }

    let params = {
      ...values,
      districtId: this.state.districtId,
    };
    // console.log(this.state.districtId);
    if (operateType === 'up') {
      params = {
        ...values,
        version: this.props.data.version
      };
    }
    this.props.onOk(params);
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.formRefAdd.current.resetFields();
  };

  /** 点击关闭时触发 **/
  onClose = () => {
    // this.setState({showModal: false});
    this.props.onClose();
  };

  /**
   * 确定选择区域
   * @param {obj{id,name}} val 选中的区域
   */
  onSelectRegion = (val) => {
    this.setState({
      districtId: val
    });
    this.formRefAdd.current.setFieldsValue({
      districtName: '1'
    });
  }
  render () {
    const {operateType, data, modalLoading, visible, HouseLevel } = this.props;
    if (data.houseAddTime && ((operateType === 'see') || (operateType === 'up'))) {
      data.houseAddTime = moment(data.houseAddTime);
    }
    return (
      <div>
        <Modal
          title={
            { add: '新增机房', up: '修改机房', see: '查看机房' }[operateType]
          }
          maskClosable={false}
          width="90%"
          destroyOnClose
          footer={null}
          onCancel={this.props.onClose}
          visible={visible}
        >
          <Spin tip="Loading..." spinning={modalLoading}>
            <Form name="form_in_modal"
              ref={this.formRefAdd}
              className="g-modal-field"
              onFinish={(values) => {this.onFinish(values);}}
              initialValues={data}>
              <Row>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="机房名称" name="name"
                    rules={[{ required: true, message: '请输入' }, { max: 15, message: "最多输入15个字符" }]}
                    {...formItemLayout}>
                    <Input
                      type="text"
                      placeholder="请输入"
                      disabled={operateType != 'add'}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="机房别名" name="alias"
                    rules={[{ required: true, message: '请输入' }, { max: 15, message: "最多输入15个字符" }]}
                    {...formItemLayout}>
                    <Input
                      type="text"
                      placeholder="请输入"
                      disabled={operateType != 'add'}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="机房编码" name="code"
                    rules={[{ required: true, message: '请输入' }, { max: 80, message: "最多输入80个字符" }]}
                    {...formItemLayout}>
                    <Input
                      type="text"
                      placeholder="请输入"
                      disabled={operateType != 'add'}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label={<span className="required"> 地区</span>}
                    style={{marginBottom: 0}}
                    {...formItemLayout}>
                    <FormItem
                      rules={operateType === 'up' || operateType === 'see' ? null : [{ required: true, message: '请输入' }]}
                      name={"districtName"}
                    >
                      <AreaSelect
                        disabled={operateType === 'see' || operateType === 'up'}
                        districtId={this.props.data.districtId}
                        placeholder={'请选择地区'}
                        onSelect={(value) => {this.onSelectRegion(value);}}
                        type="house"
                      />
                    </FormItem>
                  </FormItem>
                </Col>
                {(operateType == 'see') && <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="物理位置码" name="houseLocakCode"
                    {...formItemLayout}>
                    <Input disabled/>
                  </FormItem>
                </Col>}
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="机房属性" name="attribute"
                    rules={[{ required: true, message: '请输入' }]}
                    {...formItemLayout}>
                    <Select
                      disabled={operateType === 'see'}>
                      {_.map(SYS_DICT_HOUSE.house_attr, (value, key) => <Option value={parseInt(key)} key={key}>{value}</Option>)}
                    </Select>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="机房等级" name="houseLevel"
                    rules={[{ required: true, message: '请输入' }]}
                    {...formItemLayout}>
                    <Select
                      disabled={operateType === 'see'}>
                      {_.map(HouseLevel, (value, key) => <Option value={parseInt(key)} key={key}>{value}</Option>)}
                    </Select>
                  </FormItem>
                </Col>
                {/* <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="机柜电力" name="cabinetAmp"
                    rules={[{ required: true, message: '请输入' }, { max: 10, message: "最多输入10个字符" }, { pattern: regExpConfig.float, message: "请输入数字"}]}
                    {...formItemLayout}>
                    <Input
                      suffix="A"
                      disabled={operateType === 'see'}
                    />
                  </FormItem>
                </Col> */}
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label={<span className="required">机柜电力</span>}
                    {...formItemLayout}
                    rules={[{ required: true, message: '请输入' }, { max: 10, message: "最多输入10个字符" }, { pattern: regExpConfig.float, message: "请输入数字"}]}
                  >
                    <FormItem name="cabinetAmp"
                      {...formItemLayout}
                      style={{ display: 'inline-block', width: 200}}
                      rules={[{ required: true, message: '请输入' }, { max: 10, message: "最多输入10个字符" }, { pattern: regExpConfig.float, message: "请输入数字"}]}
                    >
                      <Input
                        style={{width: 190}}
                        disabled={operateType === 'see'}
                      />
                    </FormItem>
                    <FormItem name="voltageUnit"
                      {...formItemLayout}
                      style={{ display: 'inline-block', width: 100}}
                      rules={[{ required: true, message: '请选择' }]}
                    >
                      <Select style={{width: 130}} disabled={operateType === 'see'}>
                        <Option value="A">A</Option>
                        <Option value="KVA">KVA</Option>
                        <Option value="KW">KW</Option>
                      </Select>
                    </FormItem>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="机柜供电电压" name="cabinetVoltage"
                    rules={[{ required: true, message: '请输入' }, { max: 10, message: "最多输入10个字符" }, { pattern: regExpConfig.float, message: "请输入数字"}]}
                    {...formItemLayout}>
                    <Input
                      suffix="V"
                      disabled={operateType === 'see'}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="机柜承重" name="cabinetBearing"
                    rules={[{ required: true, message: '请输入' }, { max: 10, message: "最多输入10个字符" }, { pattern: regExpConfig.float, message: "请输入数字"}]}
                    {...formItemLayout}>
                    <Input
                      suffix="kg"
                      disabled={operateType === 'see'}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="机柜规格" name="cabinetSpec"
                    {...formItemLayout}
                    rules={[{ required: true, message: '请输入' }, { max: 14, message: "最多输入14个字符" }]}>
                    <Input
                      disabled={operateType === 'see'}
                      placeholder="示例：600*800"
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="机柜总U数" name="cabinetUs"
                    {...formItemLayout}
                    rules={[{ required: true, message: '请输入' },
                      { pattern: regExpConfig.num, message: "请输入数字" },
                      { type: 'number', max: 99, message: "最多输入2位数" }]}>
                    <InputNumber
                      disabled={operateType === 'see'}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="机柜PDU情况" name="cabinetPdu"
                    {...formItemLayout}
                    rules={[{ required: true, message: '请输入' }, { max: 200, message: "最多输入200个字符" }]}>
                    <Input
                      disabled={operateType === 'see'}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem label="机房建立时间" name="houseAddTime"
                {...formItemLayout}
                rules={[{ required: true, message: '请输入' }]}
                >
                <DatePicker
                  style={{ width: "100%" }}
                  disabled={operateType === 'see'}
                />
              </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem label="地址" name="addr"
                    rules={[{ required: true, message: '请输入' }, { max: 150, message: "最多输入150个字符" }]}
                    {...formItemLayout2}>
                    <TextArea
                      autoSize={{ minRows: 5}}
                      placeholder="请输入"
                      disabled={operateType === 'see'}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem label="备注" name="remark"
                    rules={[{ max: 250, message: "最多输入250个字符" }]}
                    {...formItemLayout2} >
                    <TextArea
                      autoSize={{ minRows: 5}}
                      placeholder="请输入"
                      disabled={operateType === 'see'}
                    />
                  </FormItem>
                </Col>
              </Row>


              {(operateType !== 'see') && <div className="actions-btn">
                <Button htmlType="submit" className="action-btn ok">确认提交</Button>
                <Button onClick={this.onResetSearch} className="action-btn ok">重置</Button>
                <Button onClick={this.onClose} className="action-btn ok">取消</Button>
              </div>}
            </Form>
          </Spin>
        </Modal>
      </div>
    );
  }
}
export default Add;
