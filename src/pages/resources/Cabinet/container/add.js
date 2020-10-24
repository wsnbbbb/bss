
/** 资源管理/区域管理增 修 **/

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
  DatePicker
} from 'antd';
import { observer } from 'mobx-react';
import { formItemLayout2 } from '@src/config/commvar'; // 全局通用变量
import { SYS_DICT_CABINET } from '@src/config/sysDict'; // 全局系统字典
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import moment from "moment";
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
    };
  }
  componentDidMount () {
  }
  componentWillReceiveProps (nextProps) {
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
    const { localInfo, ...rest } = values;
    let params = {
      ...rest,
      districtId: this.selectAreaNode.id,
    };
    if (operateType === 'up') {
      params = {
        ...params,
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
    this.props.onClose();
  };

  render () {
    const { operateType, modalLoading, data, visible } = this.props;
    if ((operateType === 'see') || (operateType === 'up')) {
      data.beginDate? data.beginDate= moment(data.beginDate):data.beginDate=null;
      data.endDate? data.endDate = moment(data.endDate):data.endDate=null;
    }
    
    const validateMessages = {
      required: "'${name}' 是必选字段",
    };
    return (
      <div>
        <Modal
          title={
            { add: '新增机柜', up: '修改机柜', see: '查看机柜' }[operateType]
          }
          maskClosable={false}
          width="60%"
          destroyOnClose
          footer={null}
          onCancel={this.props.onClose}
          visible={visible}
          zIndex={1032}
        >
          <Spin tip="Loading..." spinning={modalLoading}>
            <Form name="form_in_modal"
              ref={this.formRefAdd}
              className="g-modal-field"
              onFinish={(values) => {this.onFinish(values);}}
              validateMessages={validateMessages}
              initialValues={data}>
              <FormItem label="机柜名称" name="name"
                rules={[{ required: true, message: '请输入' }, { max: 15, message: "最多输入15个字符" }]}
                {...formItemLayout2}>
                <Input
                  type="text"
                  placeholder="请输入"
                  disabled={operateType === 'see'}
                />
              </FormItem>
              {(operateType != 'add') && <FormItem label="物理位置码" name="physicsLocationCode"
                {...formItemLayout2}>
                <Input
                  type="text"
                  disabled
                />
              </FormItem>}
              <FormItem label="行列"
                {...formItemLayout2}>
                <FormItem name="row"
                  rules={[{
                    required: true,
                    pattern: regExpConfig.num,
                    message: '请输入整数'
                  }]}
                  style={{ display: 'inline-block', width: 150 }}>
                  <Input prefix="行:"
                    disabled />
                </FormItem>
                <FormItem name="coulmn"
                  rules={[{
                    required: true,
                    pattern: regExpConfig.num,
                    message: '请输入整数'
                  }]}
                  style={{ display: 'inline-block', width: 150 }}>
                  <Input
                    disabled
                    prefix="列:" />
                </FormItem>
              </FormItem>
              <FormItem label="规格"
                {...formItemLayout2}>
                <FormItem name="spec"
                  rules={[{
                    required: true,
                    message: '请输入'
                  }, { max: 14, message: "最多输入14个字符" }]}>
                  <Input
                    placeholder="示例：600*800"
                    disabled={operateType === 'see'} />
                </FormItem>
              </FormItem>

              <FormItem label="机柜属性" name="attribute"
                rules={[{ required: true, message: "请输入" }]}
                {...formItemLayout2}>
                <Select
                  disabled={operateType === 'see'}>
                  {
                    _.map(SYS_DICT_CABINET.cabinet_attribute, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </FormItem>
              <FormItem label="承重" name="bearing"
                rules={[{
                  required: true,
                  message: '请输入'
                }, { max: 10, message: "最多输入10个字符" }]}
                {...formItemLayout2}>
                <Input
                  suffix="kg"
                  disabled={operateType === 'see'}
                />
              </FormItem>
              <FormItem label="总U位数" name="us"
                rules={[{
                  required: true,
                  pattern: regExpConfig.num,
                  message: '请输入数字'
                }]}
                {...formItemLayout2}>
                <Input
                  disabled={operateType === 'see' || operateType === 'up'}
                />
              </FormItem>
              <FormItem label={<span className="required">默认电力</span>}
                {...formItemLayout2}
                rules={[{ required: true, message: '请输入' }, { max: 10, message: "最多输入10个字符" }, { pattern: regExpConfig.float, message: "请输入数字"}]}
              >
                <FormItem name="amp"
                  style={{ display: 'inline-block', width: 200}}
                  rules={[{ required: true, message: '请输入' }, { max: 10, message: "最多输入10个字符" }, { pattern: regExpConfig.float, message: "请输入数字"}]}
                >
                  <Input
                    style={{width: 190}}
                    disabled={operateType === 'see'}
                  />
                </FormItem>
                <FormItem name="voltageUnit"
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
              <FormItem label="电压" name="voltage"
                {...formItemLayout2}
                rules={[{ required: true, message: '请输入' }, { max: 10, message: "最多输入10个字符" }]}
              >
                <Input
                  suffix="V"
                  disabled={operateType === 'see'}
                />
              </FormItem>
              <FormItem label="机柜PDU情况" name="pdu"
                {...formItemLayout2}
                rules={[{ required: true, message: '请输入' }, { max: 50, message: "最多输入50个字符" }]}
              >
                <Input
                  disabled={operateType === 'see'}
                />
              </FormItem>
              <FormItem label="开始计费时间" name="beginDate"
                {...formItemLayout2}>
                <DatePicker
                  style={{ width: "100%" }}
                  disabled={operateType === 'see'}
                />
              </FormItem>
              <FormItem label="合同到期时间" name="endDate"
                {...formItemLayout2}>
                <DatePicker
                  style={{ width: "100%" }}
                  disabled={operateType === 'see'}
                />
              </FormItem>
              <FormItem label="备注" name="remark"
                {...formItemLayout2}
                rules={[{ max: 250, message: "最多输入250个字符" }]}
              >
                <TextArea
                  autoSize={{ minRows: 5 }}
                  placeholder="请输入"
                  disabled={operateType === 'see'}
                />
              </FormItem>
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
