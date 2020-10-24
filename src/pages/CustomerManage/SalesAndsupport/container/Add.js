
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
} from 'antd';
import { inject, observer } from 'mobx-react';
import tools from '@src/util/tools'; // 工具
import { formItemLayout2 } from '@src/config/commvar'; // 工具
import { SYS_DICT_CUSTOMER } from '@src/config/sysDict';// 后台用户管理中心字典


// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { Option } = Select;

@inject('root')
@observer
class Sales extends React.Component {
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
  constructor (props) {
    super(props);
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
      };
      this.props.onOk(params);
    } else {
      let params = {
        ...values,
        id: data.id
      };
      console.log(params);
      this.props.onOk(params);
    }
    console.log(values);
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
    // eslint-disable-next-line react/prop-types
    const { operateType, data, modalLoading, visible, UserData } = this.props;
    const { customer_sale_type } = SYS_DICT_CUSTOMER;
    console.log(this.props);
    return (
      <div>
        <Modal
          title={
            { add: '销售和销售支持添加', up: '销售和销售支持修改', see: '销售和销售支持信息查看' }[operateType]
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
                  <FormItem name="saleType" label="销售类型"
                    rules={[{ required: true,  message: '请选择销售类型' }]}
                    {...formItemLayout2}>
                    <Select disabled={operateType === 'see'}>
                      {
                        _.map(customer_sale_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                      }
                    </Select>
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                  <FormItem name="salesName" label="人员"
                    rules={[{ required: true, message: '请选择销售人员'}]}
                    {...formItemLayout2}
                    // eslint-disable-next-line react/no-string-refs
                  >
                    <Select disabled={operateType === 'see'}
                      showSearch
                      filterOption={tools.filterOption}
                      // eslint-disable-next-line react/no-string-refs
                    >
                      {
                        // eslint-disable-next-line react/jsx-no-duplicate-props
                        _.map(UserData, (item, key) => <Option value={key} key={key}> {item} </Option>)
                      }
                    </Select>
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
export default Sales;
