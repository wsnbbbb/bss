
/** 资源管理/地区管理增 修 **/

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
} from 'antd';
import { inject, observer} from 'mobx-react';
import {formItemLayout2} from '@src/config/commvar'; // 工具

// 普通组件
import AreaSelect from '@src/pages/resources/container/AreaSelect';

const FormItem = Form.Item;
const { TextArea } = Input;

@inject('root')
@observer
class AreaContainer extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    root: P.any,
    operateType: P.string,
    powers: P.array, // 当前登录用户权限
    data: P.any,  // 当前选中的信息
    visible: P.bool,
    modalLoading: P.bool, // 添加/修改/查看 是否正在请求中
    onOk: P.func,
    onClose: P.func,
  };
  constructor (props) {
    super(props);
    this.formRef = React.createRef();
    this.parId = undefined; // value 在state中更新不及时，所以传递数据的上级接口存到parId
    this.state = {
      modalLoading: false,
      modalShowRegion: false,
    };
  }

  componentDidMount () {
  }
  componentWillReceiveProps (nextProps) {
    if (nextProps.operateType == 'add') {
      this.parId = 0;
    } else {
      this.parId = nextProps.data.parId;
    }
  }

  // 验证通过
  onFinish (values) {
    const { operateType } = this.props;
    let params = {
      ...values,
      parId: this.parId || 0,
    };
    if (operateType === 'see') {
      // 是查看
      this.props.onClose();
      return;
    }
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

  render () {
    const {operateType, data, modalLoading, visible} = this.props;
    return (
      <div>
        <Modal
          title={
            { add: '新增', addchild: '添加下级地区', up: '修改', see: '查看' }[operateType]
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
              <FormItem label="上级地区"
                {...formItemLayout2}>
                <AreaSelect
                  disabled={operateType === 'see'}
                  districtId={data.parId}
                  placeholder={'请选择上级地区'}
                  onSelect={(value) => {this.onSelectRegion(value);}}
                />
              </FormItem>
              <FormItem label="地区名称" name="name"
                rules={[{ required: true, message: '请输入地区名称'},
                  { max: 15, message: "最多输入15个字符" }
                ]}
                {...formItemLayout2}>
                <Input
                  type="text"
                  placeholder="请输入"
                  disabled={operateType == 'see' || operateType == 'up'}
                />
              </FormItem>
              <FormItem label="地区编码" name="code"
                rules={[{ required: true, message: '请输入地区编码'}, { max: 10, message: "最多输入10个字符" }]}
                {...formItemLayout2}>
                <Input
                  placeholder="例如：重庆编码为CQ"
                  disabled={operateType == 'see' || operateType == 'up'}
                />
              </FormItem>
              <FormItem label="备注" name="remark"
                rules={[{ max: 250, message: "最多输入250个字符" }]}
                {...formItemLayout2}>
                <TextArea
                  placeholder="请输入备注"
                  disabled={operateType === 'see'}
                />
              </FormItem>
              {(operateType !== 'see') && <div className="actions-btn">
                <Button htmlType="submit" className="action-btn ok">确认提交</Button>
                <Button onClick={this.onClose} className="action-btn ok">取消</Button>
              </div>}
            </Form>
          </Spin>
        </Modal>
      </div>
    );
  }
}
export default AreaContainer;
