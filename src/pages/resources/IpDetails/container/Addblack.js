
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
  Row,
  Col,
  Select,
} from 'antd';
import { inject, observer } from 'mobx-react';
import { formItemLayout2} from '@src/config/commvar'; // 全局通用变量
import { SYS_DICT_IP } from '@src/config/sysDict'; // ip资源字典

// ==================
// Definition
// ==================
const { TextArea } = Input;
const { Option } = Select;

@inject('root')
@inject("ipresourceDict")
@observer
class Addblack extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    root: P.any, // 全局资源
    that: P.any, // 父组件对象
    children: P.any,
    areaResouse: P.any, // 区域字典
    ipresourceDict: P.any, // ip资源字典
    powers: P.array, // 当前登录用户权限
    onClose: P.func, // 关闭编辑弹窗
    onOK: P.func, // 添加成功后的回调
    deviceId: P.string, // ip id
    defaultData: P.any, // ip基础信息
    id: P.any, // 当前id
    ipid: P.any, // 选择的id
    iparr: P.any, // 选择的id名称
    onSubmit: P.any // 确认提交回调
  };
  formRefCheck = React.createRef();
  constructor (props) {
    super(props);
    console.log(props);
    this.ports = [];
    this.state = {
      showModal: false,
      modalLoading: false,
      devideDetail: {
        devicePortList: []
      },
      uw: null,
      ubitInfo: {},
      regionInfo: {},
      cabinetInfo: {},
      lists: [{ id: "0" }, { id: '1' }, { id: '3' }, { id: '4' }, { id: '5' }, { id: '6' }, { id: '7' }, { id: '8' }, { id: '9' }],
      loading: false, // 表格数据是否正在加载中
      page: 1, // 当前第几页
      pageSize: 10, // 每页多少条
      total: 10, // 数据库总共多少条数据
      ipstr: ''
    };
  }
  componentDidMount () {
    let arr = this.props.iparr;
    let str = arr.join(",");
    this.formRefCheck.current.setFieldsValue({
      ipname: str
    });

    if (Object.keys(this.props.ipresourceDict.specialStatus).length <= 0) {
      this.props.ipresourceDict.fetchspecialStatus();
    }
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.props.onClose();
  };

  // 验证通过
  onFinish (values) {
    const value = {
      // eslint-disable-next-line react/prop-types
      id: this.props.ipId,
      ...values
    };
    this.props.onSubmit(value);
  }

  render () {
    const { blank_status } = SYS_DICT_IP;

    return (
      <React.Fragment>
        <Form name="form_in_modal"
          ref={this.formRefCheck}
          className="g-modal-field"
          onFinish={(values) => {this.onFinish(values);}}>
          <Row>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Form.Item name="ipname" label="ip名称"
                rules={[{ required: true }]}
                {...formItemLayout2}>
                <Input disabled
                  type="text"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Form.Item name="specialStatus" rules={[{ required: true, message: '请选择特殊状态' }]} label="特殊状态"
                {...formItemLayout2}>
                <Select placeholder="请选择特殊状态" >
                  {
                    _.map(blank_status, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <Form.Item label="黑名单备注" name="remark" rules={[{ required: true, message: '请输入备注' }]}
                {...formItemLayout2}>
                <TextArea
                  maxLength="240"
                  autoSize={{ minRows: 5 }}
                  placeholder="请输入"
                />
              </Form.Item>
            </Col>
          </Row>
          <div className="actions-btn">
            <Button htmlType="submit" className="action-btn ok">确认提交</Button>
            <Button onClick={this.onClose} className="action-btn ok">取消</Button>
          </div>
        </Form>
      </React.Fragment>
    );
  }
}
export default Addblack;
