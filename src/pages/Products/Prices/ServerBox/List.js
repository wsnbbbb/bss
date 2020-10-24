/* eslint-disable react/prop-types */

import React from 'react';
import P from 'prop-types';
import {
  Form, Button, Input, Select, Radio, Pagination, Modal, Tabs, message
} from 'antd';

import { inject, observer } from 'mobx-react';
import http from '@src/util/http';
import tools from '@src/util/tools'; // 工具
import { SYS_DICT_PRODUCT, SYS_DICT_SERVER, SYS_DICT_COMMON } from '@src/config/sysDict'; // 全局变量
import { formItemLayout2 } from '@src/config/commvar'; // 全局变量
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
// ==================
// 所需的所有组件
// ==================
import EditTable2 from './Table';
import {
  ExclamationCircleOutlined
} from "@ant-design/icons";
const FormItem = Form.Item;
const { confirm } = Modal;
const { Option } = Select;
const { TabPane } = Tabs;
@inject('nodeMasterDict')
@inject("areaResouse")
@observer
// @DropTarget(type, spec, collect)
export default class List extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    userinfo: P.any,
  };
  AddformRef = React.createRef();
  constructor (props) {
    super(props);
    this.searchParam = {}, // 存储查询条件（顶部查询条件）
    this.key = 1;
    this.state = {
      lists: [],
      loading: false,
      page: 1, // 当前第几页
      pageSize: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      modalShow: false,   // 机房增 修 查 状态模的显示
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      copyedHouseId: '',  // 复制的机房
      lists4: {}
    };
  }
  componentDidMount () {
    this.onGetListData(1);
    if (this.props.areaResouse.houseList.length <= 0) {
      this.props.areaResouse.fetchHouse();
    }
  }

  // 查询当前页面所需列表数据
  onGetListData (key = 1) {
    this.setState({
      loading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/goods/crate-price?houseId=${this.props.houseId}&type=${key}`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            lists: res.data,
            total: res.data.total,
          });
        } else {
          tools.dealFail(res);
        }
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }
  // 设置选中tab
  setActiveKey = (key) => {
    this.key = parseInt(key);
    this.onGetListData(parseInt(key));
  }
  reset = () => {
    this.formRef.current.resetFields();
  };
  updata = (key) => {
    this.onGetListData(key);
  }
  onAdd = (value) => {
    value.nowHouseId = this.props.houseId;
    value.type = this.key;
    let _that = this;
    confirm({
      title: `你确定要从  ${this.text}  复制价格吗？`,
      icon: <ExclamationCircleOutlined />,
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk () {
        _that.onCopy(value);
      },
      onCancel () {
      },
    });
  }
  onCopy=(value) => {
    console.log(value);
    http
      .post(`${BSS_ADMIN_URL}/api/goods/crate-price/exist-copy`, tools.clearEmpty(value))
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.onGetListData(this.key);
          message.success("复制成功");
        } else {
          tools.dealFail(res);
        }
      })
      .catch(() => {
      });
  }
  onChange=(val, option) => {
    this.text = option.children;
  }
  render () {
    const { houseList } = this.props.areaResouse;
    const { lists, loading} = this.state;
    return (
      <main className="mian">
        <div className="c-search">
          <Form
            ref={this.AddFormRef}
            name="horizontal_login"
            layout="inline"
            onFinish={(values) => {
              this.onAdd(values);
            }}
          >
            <Form.Item name="optionHouseId" label="从现有机房复制价格">
              <Select
                style={{ width: 300 }}
                allowClear
                placeholder="请选择已配置的机房"
                onChange={this.onChange}
              >
                {houseList.map((item) => (
                  <Option value={item.id} key={item.id}>
                    {item.fullName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item shouldUpdate>
              <Button type="primary" htmlType="submit">
                复制
              </Button>
            </Form.Item>
          </Form>
        </div>
        <div className="g-operate">
          <Button className="actions-btn" size="middle" onClick={() => {this.onGetListData(this.key);}}>刷新</Button>
        </div>
        <Tabs tabPosition="left" defaultActiveKey="1" onChange={this.setActiveKey} >
          {
            _.map(SYS_DICT_PRODUCT.product_crate_price_type, (value, key) =>
              <TabPane tab={value} key={key}>
                <EditTable2 data={lists} type={this.key} updata={(val) => this.updata(val)} loading={loading}></EditTable2>
              </TabPane>
            )
          }
        </Tabs>
      </main>
    );
  }
}
