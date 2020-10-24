/* eslint-disable react/prop-types */
/** 后台用户管理中心 客户信息管理 **/

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
} from 'antd';
import {
  EyeOutlined,
  FormOutlined,
  DeleteOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import { inject, observer } from 'mobx-react';
import http from '@src/util/http';
import tools from '@src/util/tools'; // 工具
import { User } from '@src/util/user.js';
import { SYS_DICT_CUSTOMER } from '@src/config/sysDict';// 后台用户管理中心字典


// ==================
// 所需的所有组件
// ==================
import Add from './container/Add';
import Changepassword from './container/Changepassword';


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

  constructor (props) {
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
      nowData: {}, // 当前选中ip的信息，用于查看详情、修改
      modalShow: false,   // ip增 修 查 状态模的显示
      selectedRowKeys: [], // 选中的行
      regionInfo: {},
    };
  }

  componentDidMount () {
    this.onGetListData();
    // 客户来源
    if (Object.keys(this.props.customerDict.customersource).length <= 0) {
      this.props.customerDict.fetchCustomerSource();
    }
    // 客户行业
    if (Object.keys(this.props.customerDict.customerindustry).length <= 0) {
      this.props.customerDict.fetchCustomerIndustry();
    }
    // 代理等级
    if (Object.keys(this.props.customerDict.agencyLevel).length <= 0) {
      this.props.customerDict.fetchagencyLevel();
    }
    // 员工列表
    if (Object.keys(this.props.customerDict.userlist).length <= 0) {
      this.props.customerDict.fetchUserList();
    }
    // 销售人员列表
    if (Object.keys(this.props.customerDict.saleslist).length <= 0) {
      this.props.customerDict.fetchsalePersonnel();
    }
    // 销售支持人员列表
    if (Object.keys(this.props.customerDict.saleSupportlist).length <= 0) {
      this.props.customerDict.fetchsaleSupport();
    }
    // 支付主体
    if (Object.keys(this.props.customerDict.payCompany).length <= 0) {
      this.props.customerDict.fetchpayCompany();
    }
  }


  // 查询当前页面所需列表数据
  onGetListData (values) {
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
    http.get(`${BSS_ADMIN_URL}/api/customer/customerInfo`, {params: params})
    // http.get(`http://10.3.9.29:8080/api/customer/customerInfo`, {params: params})

      .then((res) => {
        res = res.data;
        console.log(res);
        if (tools.hasStatusOk(res)) {
          this.setState({
            lists: res.data.records,
            total: res.data.total,
            page: res.data.current,
            selectedRowKeys: [],
            selectedRows: [],
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
  onPageChange (page, pageSize) {
    this.setState({
      page: page,
    });
    this.onGetListData({
      page: page,
      pageSize: pageSize
    });
  }

  // 表单页码长度改变
  onPageSizeChange (page, pageSize) {
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
  onSearchfrom (values) {
    console.log(values)
    this.searchParam = values;
    this.setState({ searchValue: values });
    this.onGetListData(values);
  }

  // 查看、修改、添加弹窗
  onModalShow (type, data) {
    this.setState({
      modalShow: true,
      nowData: data,
      operateType: type
    });
  }

  changePassword (data) {
    this.setState({
      changemodalShow: true,
      nowData: data,
    });
  }

  onModalClose = () => {
    this.setState({
      modalShow: false,
      changemodalShow: false
    });
  }

  // 添加、修改用户信息
  onModalOk (customerInfo) {
    if (this.state.operateType == 'add') {
      console.log(customerInfo);
      let param = tools.clearNull(customerInfo);
      http.post(`${BSS_ADMIN_URL}/api/customer/customerInfo/addCustomerInfo`, param)
      // http.post(`http://10.3.9.29:8080/api/customer/customerInfo/addCustomerInfo`, param)
        .then((res) => {
          res = res.data;
          console.log(res);
          if (tools.hasStatusOk(res)) {
            this.setState({
              modalLoading: false,
              modalShow: false,
            });
            this.onGetListData();
            tools.auto_close_result('ok', '操作成功');
          } else {
            tools.dealFail(res);
          }
          this.setState({ modalLoading: false });
        })
        .catch(() => {
          this.setState({ modalLoading: false });
        });
    } else {
      console.log(customerInfo);
      this.setState({
        loading: true,
        modalLoading: true,
      });
      http.put(`${BSS_ADMIN_URL}/api/customer/customerInfo/${customerInfo.id}/updateCustomerInfo`, customerInfo)
      // http.put(`http://10.3.9.29:8080/api/customer/customerInfo/${customerInfo.id}/updateCustomerInfo`, customerInfo)

        .then((res) => {
          console.log(res);
          res = res.data;
          if (tools.hasStatusOk(res)) {
            tools.auto_close_result('ok', '操作成功');
            this.setState({
              page: 1,
              modalLoading: false,
              modalShow: false,

            });
            this.onGetListData({ page: 1 });
          } else {
            tools.dealFail(res);
          }
          this.setState({ modalLoading: false, loading: false });
        })
        .catch(() => {
          this.setState({ modalLoading: false, loading: false });
        });
    }
  }

  onChangepassWord (obj) {
    this.setState({
      loading: true,
      modalLoading: true,
    });
    http.put(`${BSS_ADMIN_URL}/api/customer/customerInfo/updatePwd`, obj)
      .then((res) => {
        console.log(res);
        res = res.data;
        if (tools.hasStatusOk(res)) {
          tools.auto_close_result('ok', '操作成功');
          this.setState({
            page: 1,
            modalLoading: false,
            modalShow: false,
            changemodalShow: false
          });
          this.onGetListData({ page: 1 });
        } else {
          tools.dealFail(res);
        }
        this.setState({ modalLoading: false, loading: false });
      })
      .catch(() => {
        this.setState({ modalLoading: false, loading: false });
      });
  }

  onDel (id) {
    console.log(id);
    this.setState({
      loading: true,
      modalLoading: true,
    });
    http
      .put(`${BSS_ADMIN_URL}/api/customer/customerInfo/${id}/delCustomerInfo`)
      .then((res) => {
        res = res.data;
        console.log(res);
        if (res.code === 20000) {
          this.setState({
            // page: 1,
            loading: false,
            modalLoading: false,
          });
          this.onGetListData();
          tools.auto_close_result('ok', '操作成功');
        } else {
          tools.dealFail(res);
          this.setState({ loading: false, modalLoading: false});
        }
      })
      .catch(() => {
        this.setState({ loading: false, modalLoading: false });
      });
  }
  // 构建字段
  makeColumns () {
    const { customer_account_status, auth_status2,customer_lable_type } = SYS_DICT_CUSTOMER;
    const { payCompany } = this.props.customerDict;
    const columns = [
      {
        title: '姓名',
        dataIndex: 'realName',
        key: 'realName',
      },
      {
        title: '用户名',
        dataIndex: 'loginName',
        key: 'loginName',
      },
      {
        title: '用户邮箱',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: '代理等级',
        dataIndex: 'agencyLevelName',
        key: 'agencyLevelName',
      },
      {
        title: '销售支持',
        dataIndex: 'salesSupportName',
        key: 'salesSupportName',
      },
      {
        title: '销售',
        dataIndex: 'salesName',
        key: 'salesName',
      },
      // {
      //   title: '状态',
      //   dataIndex: 'status',
      //   key: 'status',
      //   render: (text, record) => customer_account_status[text]
      // },
      {
        title: '用户标签',
        dataIndex: 'label',
        key: 'label',
        render: (text, record) => customer_lable_type[text]
      },
      {
        title: '用户状态',
        dataIndex: 'status',
        key: 'status',
        render: (text, record) => customer_account_status[text]
      },
      {
        title: '支付主体',
        dataIndex: 'payCompanyId',
        key: 'payCompanyId',
        render: (text, record) => payCompany[text]
      },
      {
        title: '认证状态',
        dataIndex: 'authStatus',
        key: 'authStatus',
        render: (text, record) => auth_status2[text]

      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 240,
        render: (text, record) => {
          const controls = [];
          controls.push(
            <span
              key="0"
              className="control-btn green"
              onClick={() => this.onModalShow("see", record)}
            >
              {User.hasPermission('customerInfo-view') &&
              <Tooltip placement="top" title="查看">
                <EyeOutlined></EyeOutlined>
              </Tooltip>}
            </span>
          );
          controls.push(
            <span
              key="1"
              className="control-btn blue"
              onClick={() => this.onModalShow("up", record)}
            >
              {User.hasPermission('customerInfo-edit') &&
              <Tooltip placement="top" title="修改">
                <FormOutlined></FormOutlined>
              </Tooltip>}
            </span>
          );
          controls.push(
            <span
              key="2"
              className="control-btn blue"
              onClick={() => this.changePassword(record)}
            >
              {User.hasPermission('updatePwd-edit') &&
              <Tooltip placement="top" title="更改密码">
                <UnlockOutlined />
              </Tooltip>}
            </span>
          );
          controls.push(
            <Popconfirm
              key="3"
              title="确定删除吗?"
              onConfirm={() => this.onDel(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <span className="control-btn red">
                {User.hasPermission('customerInfo-del') &&
                <Tooltip placement="top" title="删除">
                  <DeleteOutlined></DeleteOutlined>
                </Tooltip>}
              </span>
            </Popconfirm>
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

  render () {
    const { lists, loading, page, pageSize, total } = this.state;
    const { agencyLevel, saleslist, saleSupportlist,payCompany} = this.props.customerDict;
    const { customer_account_status, auth_status2,customer_lable_type } = SYS_DICT_CUSTOMER;
    return (
      <main className="mian">
        <div className="g-search">
          <Form ref={this.searchFormRef} name="searchbox" layout="inline" onFinish={(values) => {this.onSearchfrom(values);}}>
            <Form.Item name="loginName" >
              <Input placeholder="请输入用户名" maxLength="30" allowClear />
            </Form.Item>
            <Form.Item name="email" >
              <Input placeholder="请输入用户邮箱" maxLength="30" allowClear />
            </Form.Item>
            <Form.Item name="agencyLevelName">
              <Select
                placeholder="请选择代理等级" allowClear
                style={{ width: 170 }}>
                {
                  _.map(agencyLevel, (item, key) => <Option value={key} key={key}> {item} </Option>)
                }
              </Select>
            </Form.Item>

            <Form.Item name="salesSupportName">
              <Select
                placeholder="请选择销售支持" allowClear
                style={{ width: 170 }}
                showSearch
                filterOption={tools.filterOption}>
                {_.map(saleSupportlist, (item, key) => <Option value={key} key={key}> {item} </Option>)}
              </Select>
            </Form.Item>

            <Form.Item name="salesName">
              <Select
                placeholder="请选择销售" allowClear
                style={{ width: 170 }}
                showSearch
                filterOption={tools.filterOption}>
                {_.map(saleslist, (item, key) => <Option value={key} key={key}> {item} </Option>)}
              </Select>
            </Form.Item>
            
            <Form.Item name="payCompanyId">
              <Select
                placeholder="请选择支付主体" allowClear
                style={{ width: 170 }}
                showSearch
                filterOption={tools.filterOption}>
                {_.map(payCompany, (item, key) => <Option value={parseInt(key)} key={key}> {item} </Option>)}
              </Select>
            </Form.Item>

            <Form.Item name="label">
              <Select
                placeholder="请选择用户标签" allowClear
                style={{ width: 170 }}
                showSearch
                filterOption={tools.filterOption}>
                {_.map(customer_lable_type, (item, key) => <Option value={key} key={key}> {item} </Option>)}
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
          {User.hasPermission('customerInfo-add') && <Button size="middle" className="actions-btn" onClick={() => this.onModalShow("add")}>添加用户</Button>}
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
              onChange={(current, size) => {this.onPageChange(current, size);}}
              onShowSizeChange={(current, size) => {this.onPageSizeChange(current, size);}} />
          </div>
        </div>
        {/* 新增&修改&查看 模态框 */}
        <Add
          visible={this.state.modalShow}
          modalLoading={this.state.modalLoading}
          data={this.state.nowData}
          operateType={this.state.operateType}
          onOk={(v) => this.onModalOk(v)}
          onClose={() => this.onModalClose()}
        />
        <Changepassword
          visible={this.state.changemodalShow}
          modalLoading={this.state.modalLoading}
          data={this.state.nowData}
          onOk={(v) => this.onChangepassWord(v)}
          onClose={() => this.onModalClose()}
        />
      </main>
    );
  }
}
