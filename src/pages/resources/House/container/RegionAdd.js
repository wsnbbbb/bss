
/** 资源管理/区域管理增 修 查 **/

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
  InputNumber,
  Row,
  Col,
  message,
  Spin,
  Modal,
  Select,
} from 'antd';
import { inject, observer} from 'mobx-react';
import {formItemLayout, formItemLayout2} from '@src/config/commvar'; // 工具
import AreaSelect from '@src/pages/resources/container/AreaSelect';
import tools from '@src/util/tools';
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;

@inject('areaResouse')
@observer
class RegionAdd extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    areaResouse: P.any,
    operateType: P.string,
    data: P.any,  // 当前选中的信息
    visible: P.bool,
    modalLoading: P.bool, // 添加/修改/查看 是否正在请求中
    onOk: P.func,
    onClose: P.func,
  };
  formRefAdd = React.createRef();
  constructor (props) {
    super(props);
    this.state = {
      modalLoading: false,
    };
  }
  componentDidMount () {
    // this.props.areaResouse.fetchHouse();
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
    let voltageValue = values.amp + values.voltageUnit;
    delete values['voltageUnit'];
    values['amp'] = voltageValue;
    this.props.onOk(values);
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

  resetPower = () => {
    const amp = this.formRefAdd.current.getFieldValue('amp');
    const voltage = this.formRefAdd.current.getFieldValue('voltage');
    let ampValue = parseFloat(amp);
    let voltageValue = parseFloat(voltage);
    if (ampValue && voltageValue) {
      let power = Math.round(ampValue * voltageValue * 1000000) / 1000000;
      this.formRefAdd.current.setFieldsValue({
        power: power
      });
    }
  }

  // showRegonMap
  showRegonMap = () => {
    const row = this.formRefAdd.current.getFieldValue('row');
    const col = this.formRefAdd.current.getFieldValue('col');
    if (row && col) {
      let url = `${location.origin}${location.pathname}/map?row=${row}&col=${col}`;
      tools.handleOpenWindow(url, '_blank');
    } else {
      message.error('请输入行和列');
    }
  }

  render () {
    const {operateType, data, modalLoading, visible} = this.props;
    // console.log(data);
    return (
      <div>
        <Modal
          title={
            { add: '新增区域', up: '修改区域', see: '查看区域' }[operateType]
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
                  <FormItem label="所属地区"
                    rules={[{ required: true, message: '请输入' }]}
                    {...formItemLayout}>
                    <AreaSelect
                      disabled
                      districtId={this.props.data.districtId}
                      type="house"
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="所属机房" name="houseId"
                    rules={[{ required: true, message: '请输入' }]}
                    {...formItemLayout}>
                    <Select disabled>
                      {_.map(this.props.areaResouse.houseList, (item) => <Option value={item.id} key={item.id}>{item.name}</Option>)}
                    </Select>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="区域名称" name="name"
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
                  <FormItem label="区域编码" name="code"
                    rules={[{ required: true, message: '请输入' }, { max: 10, message: "最多输入10个字符" }]}
                    {...formItemLayout}>
                    <Input
                      type="text"
                      placeholder="请输入"
                      disabled={operateType != 'add'}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="机柜U位" name="cabinetUCount"
                    rules={[{ required: true, message: '请输入' }, { pattern: regExpConfig.isNumAndThanZero, message: "请输入整数"}]}
                    {...formItemLayout}>
                    <InputNumber
                      maxLength="2"
                      // type="text"
                      placeholder="请输入"
                      disabled={operateType === 'see'}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="承重" name="bearing"
                    rules={[{ required: true, message: '请输入' }, { max: 10, message: "最多输入10个字符" }, { pattern: regExpConfig.float, message: "请输入数字"}]}
                    {...formItemLayout}>
                    <Input
                      // style={{width: 100}}
                      suffix="kg"
                      disabled={operateType === 'see'}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="机柜PDU情况" name="pdu"
                    {...formItemLayout}
                    rules={[{ required: true, message: '请输入' }, { max: 50, message: "最多输入50个字符" }]}
                  >
                    <Input
                      disabled={operateType === 'see'}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="行*列"
                    style={{marginBottom: 0}}
                    {...formItemLayout}
                    rules={[{ required: true, message: '请输入' }]}
                  >
                    <FormItem name="row"
                      rules={[{ required: true, message: '请输入行' }, { type: 'number', max: 99, message: "最多输入2位数" }, { pattern: regExpConfig.isNumAndThanZero, message: "请输入整数"}]}
                      style={{ display: 'inline-block', width: 100}}>
                      <InputNumber
                        placeholder="请输入行"
                        disabled={operateType === 'see' || operateType === "up"}/>
                    </FormItem>
                    <FormItem name="col"
                      rules={[{ required: true, message: '请输入列' }, { type: 'number', max: 99, message: "最多输入2位数" }, { pattern: regExpConfig.isNumAndThanZero, message: "请输入整数"}]}
                      style={{ display: 'inline-block', width: 100}}>
                      <InputNumber
                        placeholder="请输入列"
                        disabled={operateType === 'see' || operateType === "up"}
                      />
                    </FormItem>
                    <Button
                      disabled={operateType === 'see' || operateType === "up"}
                      onClick={() => {this.showRegonMap();}} type="primary" style={{width: 100}}>生成区域图</Button>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label={<span className="required">机柜电力</span>}
                    {...formItemLayout}
                    rules={[{ required: true, message: '请输入' }, { max: 10, message: "最多输入10个字符" }, { pattern: regExpConfig.float, message: "请输入数字"}]}
                  >
                    <FormItem name="amp"
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
                  <FormItem label="电压" name="voltage"
                    {...formItemLayout}
                    rules={[{ required: true, message: '请输入' }, { max: 10, message: "最多输入10个字符" }, { pattern: regExpConfig.float, message: "请输入数字"}]}
                  >
                    <Input
                      suffix="V"
                      disabled={operateType === 'see'}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="规格" name="spec"
                    rules={[{ required: true, message: '请输入' }, { max: 14, message: "最多输入14个字符" }]}
                    {...formItemLayout}>
                    <Input
                      min={1}
                      disabled={operateType === 'see'}
                      placeholder="示例：600*800"
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                  <FormItem label="负责人" name="fzr"
                    rules={[{ required: true, message: '请输入' }, { max: 10, message: "最多输入10个字符" }]}
                    {...formItemLayout}>
                    <Input
                      min={1}
                      disabled={operateType === 'see'}
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem label="区域描述" name="description"
                    rules={[{ required: true, message: '请输入' }, { max: 250, message: "最多输入250个字符" }]}
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
                    {...formItemLayout2}
                    rules={[{ max: 250, message: "最多输入250个字符" }]}
                  >
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
export default RegionAdd;
