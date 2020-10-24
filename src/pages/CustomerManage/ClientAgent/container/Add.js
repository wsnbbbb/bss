
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
} from 'antd';
import { inject, observer } from 'mobx-react';
import { formItemLayout2 } from '@src/config/commvar'; // 工具


// ==================
// Definition
// ==================
const FormItem = Form.Item;

@inject('root')
@observer
class ClientAgent extends React.Component {
  static propTypes = {
    root: P.any, // 全局状态
    operateType: P.string, // 操作类型
    powers: P.array, // 当前登录用户权限
    data: P.any,  // 当前选中的信息
    visible: P.bool, // 是否开启弹窗
    modalLoading: P.bool, // 添加/修改/查看 是否正在请求中
    onClose: P.func, // 关闭弹窗回调
  };
  constructor (props) {
    super(props);
    console.log(this.props);
    this.formRef = React.createRef();
    this.parId = undefined; // value 在state中更新不及时，所以传递数据的上级接口存到parId
    this.state = {
      modalLoading: false,
      modalShowRegion: false,
    };
  }


  // 验证通过
  onFinish (values) {
    const { operateType, data } = this.props;
    if (operateType === 'add') {
      let params = {
        ...values,
        discount: values.discount / 100,
        warning: values.warning / 100,
        audit: values.audit / 100,
        agencyLevel: values.agencyLevel.replace(/\s*/g, "")
      };
      // eslint-disable-next-line react/prop-types
      this.props.onOk(params);
    } else {
      console.log(values);
      let params = {
        ...values,
        id: data.id,
        discount: values.discount / 100,
        warning: values.warning / 100,
        audit: values.audit / 100,
        agencyLevel: values.agencyLevel.replace(/\s*/g, "")
      };
      console.log(params);
      // eslint-disable-next-line react/prop-types
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

  inputnum () {
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

  render () {
    const { operateType, data, modalLoading, visible } = this.props;
    return (
      <div>
        <Modal
          title={
            { add: '代理等级添加', up: '代理等级编辑', see: '代理等级查看' }[operateType]
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
              onFinish={(values) => {this.onFinish(values);}}
              initialValues={data}>
              <Row>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem name="agencyLevel" label="代理等级"
                    rules={[{ required: true, message: '请输入代理等级' }]}
                    {...formItemLayout2}>
                    <Input
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
export default ClientAgent;
