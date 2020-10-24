
/** 后台用户管理中心 销售和销售支持 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';

import {
  Form,
  Button,
  Spin,
  Modal,
  Select,
  Row,
  Col,
  Input
} from 'antd';
import { inject, observer } from 'mobx-react';
import tools from '@src/util/tools'; // 工具
import { formItemLayout2 } from '@src/config/commvar'; // 工具
import { orderType , orderStatus } from '@src/config/commvar'; // 工具
import { SYS_DICT_CUSTOMER } from '@src/config/sysDict';// 后台用户管理中心字典


// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { Option } = Select;

@inject('root')
@observer
class OrderList extends React.Component {
  static propTypes = {
    root: P.any, // 全局状态
    operateType: P.string, // 操作类型
    data: P.any,  // 当前选中的信息
    Userdata: P.any,  // 员工数据
    visible: P.bool,
    modalLoading: P.bool, // 添加/修改/查看 是否正在请求中
    onOk: P.func, // 确认提交回调
    onClose: P.func, // 关闭弹窗回调
  };
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.parId = undefined; // value 在state中更新不及时，所以传递数据的上级接口存到parId
    this.state = {
      modalLoading: false,
      modalShowRegion: false,
    };
  }


  // 验证通过
  onFinish(values) {
    let params = {
      id: values.id,
      adjustAmount: parseInt(values.adjustAmount)
    }
    console.log(params)
    this.props.onOk(params)
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

  render() {
    // eslint-disable-next-line react/prop-types
    const { operateType, data, modalLoading, visible, UserData } = this.props;
    const { customer_sale_type } = SYS_DICT_CUSTOMER;
    console.log(this.props);
    return (
      <div>
        <Modal
          title={
            { add: '', up: '调整金额', see: '' }[operateType]
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
                  <FormItem name="id" label={<span className="required">订单号</span>}
                    {...formItemLayout2}>
                    <Input disabled
                      type="text"
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem name="productName" label={<span className="required">产品</span>}
                    {...formItemLayout2}
                  >
                    <Input disabled
                      type="text"
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem name="createTime" label={<span className="required">订单创建时间</span>}
                    {...formItemLayout2}
                  >
                    <Input disabled
                      type="text"
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem name="orderType" label={<span className="required">订单类型</span>}
                    {...formItemLayout2}
                  >
                    <Select allowClear disabled
                    >
                      {_.map(orderType, (value, key) => <Option value={key} key={key}>{value}</Option>)}
                    </Select>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem name="orderStatus" label={<span className="required">状态</span>}
                    {...formItemLayout2}
                  >
                    <Select allowClear disabled
                     >
                      {_.map(orderStatus, (value, key) => <Option value={key} key={key}>{value}</Option>)}
                    </Select>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem name="orderAmount" label={<span className="required">订单金额</span>}
                    {...formItemLayout2}
                  >
                    <Input disabled
                      type="text"
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem name="adjustAmount" label="调整金额"
                    rules={[{ required: true, message: '请输入调整金额' }]}
                    {...formItemLayout2}
                  >
                    <Input
                      type="text"
                    />
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
export default OrderList;
