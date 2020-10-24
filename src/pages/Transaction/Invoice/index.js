/* eslint-disable react/prop-types */
/** 后台用户管理中心 销售和销售支持 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import {
  Form,
  Button,
  Input,
  Table,
  Popconfirm,
  Pagination,
  Tooltip,
  Divider,
  Select,
  Tag
} from 'antd';
import {
  EyeOutlined,
  FormOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import "./index.less";
import { inject, observer } from 'mobx-react';
import http from '@src/util/http';
import tools from '@src/util/tools'; // 工具
import { User } from '@src/util/user.js';
import { SYS_DICT_CUSTOMER } from '@src/config/sysDict';// 后台用户管理中心字典
import { orderType, orderStatus } from '@src/config/commvar'; // 工具
import Axios from 'axios';


// ==================
// 所需的所有组件
// ==================
// import Add from './container/Add';


const { Option } = Select;

@inject('root')
@inject('customerDict')

@observer
export default class list extends React.Component {
  static propTypes = {
    location: P.any, // 当前位置
    history: P.any,
    root: P.any, // 全局状态
    match: P.any, // 路径
    customerDict: P.any, // 客户字典
  };

  searchFormRef = React.createRef();

  constructor(props) {
    super(props);
    console.log(this.props),
      this.selectedRow = {
        length: 0,
        keys: [],
        rows: [],
      }; // 选中数据
    this.hardSearch = {}; // 存储比较顽固的查询条件（顶部查询条件）
    this.searchParam = {}; // 搜索条件，因为不需要条件更新来及时的重新渲染组件，所以不放在state中
    this.locationId = undefined;
    this.state = {
      searchParam: {}, // 搜索条件
      lists: [], // 当前表格全部数据有层级关系 用于排序操作
      loading: false, // 表格数据是否正在加载中
      page: 1, // 当前第几页
      pageSize: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      nowData: {}, // 当前选中的信息，用于查看详情、修改
      modalShow: false,   // 增 修 查 状态模的显示
      selectedRowKeys: [], // 选中的行
      regionInfo: {},
      productList:[]
    };
  }

  componentDidMount() {
    this.getProductList()
    this.onGetListData();
  }


  //获取产品类型
  getProductList() {
    Axios({
      method: 'get',
      // url: 'http://10.2.5.226:7007/admin/mode/products',
      url: `${TRADING_API}/admin/mode/products`,
      headers: {
        'Authorization': 'token ' + User.getToken(),
      },
    })
      .then((res) => {
        // console.log(res)
        res = res.data;
        console.log(res);
        if (tools.hasStatusOk(res)) {
          this.setState({
            productList: res.data
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

  // 查询当前页面所需列表数据
  onGetListData(values) {
    // 区域的数据
    values = values || this.state.regionInfo;
    const params = _.assign({}, {
      page: 1,
    }, this.searchParam, {
      ...values
    });
    this.setState({
      loading: true,
    });
    Axios({
      method: 'get',
      // url: 'http://10.2.5.226:7007/admin/order/page',
      url: `${TRADING_API}/admin/order/page`,
      headers: {
        'Authorization': 'token ' + User.getToken(),
      },
      params: params
    })
      .then((res) => {
        // console.log(res)
        res = res.data;
        console.log(res);
        if (tools.hasStatusOk(res)) {
          this.setState({
            lists: res.data.records,
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

  // 表单页码改变
  onPageChange(page, pageSize) {
    this.setState({
      page: page,
    });
    this.onGetListData({
      page: page,
      pageSize: pageSize
    });
  }

  // 表单页码长度改变
  onPageSizeChange(page, pageSize) {
    this.setState({
      page: page,
      pageSize: pageSize
    });
    this.onGetListData({
      page: page,
      pageSize: pageSize
    });
  }

  // 重置搜索条件
  onResetSearch = () => {
    this.searchFormRef.current.resetFields();
  };

  /**
* 搜索
* @param {obj} values 搜索条件
*/
  onSearchfrom(values) {
    console.log(values)
    this.searchParam = values;
    this.setState({ searchValue: values });
    this.onGetListData(values);
  }

  // 查看、修改、添加弹窗
  onModalShow(type, data) {
    this.setState({
      modalShow: true,
      nowData: data,
      operateType: type
    });
  }


  onModalClose = () => {
    this.setState({
      modalShow: false,
      changemodalShow: false
    });
  }


  // 构建字段
  makeColumns() {
    const {productList} = this.state;
    const columns = [
      {
        title: '订单号',
        dataIndex: 'orderNo',
        key: 'orderNo',
      },
      {
        title: '用户',
        dataIndex: 'productName',
        key: 'productName',
      },
      {
        title: '购买产品',
        dataIndex: 'productName',
        key: 'productName',
        // render: (text, record) => (
        //   productList.map((e) => {
        //     if (e.id == text) {
        //       console.log(e.name);
        //       return e.name;
        //     }
        //   }))
      },
      {
        title: '金额',
        dataIndex: 'orderType',
        key: 'orderType',
      },
      {
        title: '申请的发票类型',
        dataIndex: 'orderStatus',
        key: 'orderStatus',
      },
      {
        title: '物流单号',
        dataIndex: 'orderAmount',
        key: 'orderAmount',
      },
      {
        title: '状态',
        dataIndex: 'adjustmentAmount',
        key: 'adjustmentAmount',
      },
      {
        title: '地址信息',
        dataIndex: 'orderActualAmount',
        key: 'orderActualAmount',
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 540,
        render: (text, record) => {
          const controls = [];
          const u = this.props.root.userinfo || {};
          const p = this.props.root.powers;
          controls.push(
            <Button
                key="0"
                size="small"
                className="actions-btn"
                style={{marginRight: '8px'}}
              >
               开始处理
              </Button>
          );
          controls.push(
            <Button
                key="0"
                size="small"
                className="actions-btn"
                style={{marginRight: '8px'}}
              >
               更新物流
              </Button>
          );
          controls.push(
            <Button
                key="0"
                size="small"
                className="actions-btn"
                style={{marginRight: '8px'}}
              >
               异常
              </Button>
          );
          controls.push(
            <Button
                key="0"
                size="small"
                className="actions-btn"
                style={{marginRight: '8px'}}
              >
               完成
              </Button>
          );
          const result = [];
          controls.forEach((item, index) => {
            if (index) {
              result.push(<Divider key={`line${index}`} type="vertical" />);
            }
            result.push(item);
          });
          return result;
        },
      },
    ];
    return columns;
  }

  render() {
    const { userlist } = this.props.customerDict;
    const { lists, loading, page, pageSize, total } = this.state;
    const { customer_sale_type } = SYS_DICT_CUSTOMER;
    return (
      <main className="mian">
        <div className="g-search">
          <Form ref={this.searchFormRef} name="searchbox" layout="inline" onFinish={(values) => { this.onSearchfrom(values); }}>
            <Form.Item name="orderNo" >
              <Input placeholder="请输入订单号" maxLength="30" allowClear />
            </Form.Item>
            <Form.Item name="username" >
              <Input placeholder="请输入用户名" maxLength="30" allowClear />
            </Form.Item>
            <Form.Item name="orderType" >
              <Select
                placeholder="请选择发票类型" allowClear
                style={{ width: 170 }}>
                {_.map(orderType, (value, key) => <Option value={key} key={key}>{value}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="orderStatus">
              <Select
                placeholder="请选择发票状态" allowClear
                style={{ width: 170 }}>
                {_.map(orderStatus, (value, key) => <Option value={key} key={key}>{value}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item shouldUpdate>
              <Button type="primary" htmlType="submit" >查询</Button>
            </Form.Item>
            <Form.Item shouldUpdate>
              <Button type="primary" onClick={this.onResetSearch} >重置</Button>
            </Form.Item>
          </Form>
        </div>
        {/* 操作 */}
        <div className="g-operate">
          <Button size="middle"  className="actions-btn" >待处理</Button>
          <Button size="middle"  className="actions-btn" >待邮寄</Button>
          <Button size="middle"  className="actions-btn" >待完成</Button>
        </div>
        {/* 数据展示 */}
        <div className="g-table">
          <Table
            scroll={{ x: 1600 }}
            columns={this.makeColumns()}
            rowKey={(record) => record.id}
            loading={loading}
            dataSource={lists}
            pagination={false}
          />
          <div className="g-pagination">
            <Pagination current={page} total={total} pageSize={pageSize}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `共 ${total} 条`}
              onChange={(current, size) => { this.onPageChange(current, size); }}
              onShowSizeChange={(current, size) => { this.onPageSizeChange(current, size); }} />
          </div>
        </div>
      </main>
    );
  }
}
