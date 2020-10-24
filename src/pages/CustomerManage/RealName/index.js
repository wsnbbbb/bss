/* eslint-disable react/prop-types */
/** 后台用户管理中心 实名认证列表 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import {
  Form,
  Button,
  Table,
  Pagination,
  Select,
  Divider,
  Modal
} from 'antd';
import { inject, observer } from 'mobx-react';
import './index.less';
import http from '@src/util/http';
import tools from '@src/util/tools'; // 工具
import { User } from '@src/util/user.js';
import { SYS_DICT_CUSTOMER } from '@src/config/sysDict';// 后台用户管理中心字典


// ==================
// 所需的所有组件
// ==================
import Check from './container/Check';
import Personal from './container/Personal';
import Enterprise from './container/Enterprise';


const { Option } = Select;

@inject('root')
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
    http.get(`${BSS_ADMIN_URL}/api/customer/customerAuth`, {
      params: params
    })
      .then((res) => {
        console.log(res);
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
    this.searchParam = values;
    this.setState({ searchValue: values });
    this.onGetListData(values);
  }

  // 审核弹窗
  onModalShow = (record) => {
    this.searchParam = {};
    console.log(record);
    if (record.authType === 5) {
      this.setState({
        enterprisemodalShow: true,
        nowId: record.id,
        nowData: record
      });
    } else {
      this.setState({
        modalShow: true,
        nowId: record.id,
        nowData: record
      });
    }
  }

  onModalClose = () => {
    this.setState({
      modalShow: false,
      enterprisemodalShow: false
    });
  }

  // 保存编辑内容
  onModalOk () {
    // eslint-disable-next-line consistent-this
    let that = this.that;
    that.setState({
      loading: true,
      modalLoading: true,
    });
    let id = this.id;
    console.log(id);
    http.put(`${BSS_ADMIN_URL}/api/customer/customerAuth/${id}/auditOK`)
      .then((res) => {
        res = res.data;
        console.log(res);
        if (tools.hasStatusOk(res)) {
          tools.auto_close_result('ok', '操作成功');
          that.setState({
            page: 1,
            modalLoading: false,
            modalShow: false,
            enterprisemodalShow: false
          });
          that.onGetListData({ page: 1 });
        } else {
          tools.dealFail(res);
        }
        that.setState({ modalLoading: false, loading: false });
      })
      .catch(() => {
        that.setState({ modalLoading: false, loading: false });
      });
  }

  onModalFail () {
    // eslint-disable-next-line consistent-this
    let that = this.that;
    that.setState({
      loading: true,
      modalLoading: true,
    });
    let id = this.id;
    console.log(id);
    http.put(`${BSS_ADMIN_URL}/api/customer/customerAuth/${id}/auditError`)
      .then((res) => {
        res = res.data;
        console.log(res);
        if (tools.hasStatusOk(res)) {
          tools.auto_close_result('ok', '操作成功');
          that.setState({
            page: 1,
            modalLoading: false,
            modalShow: false,
            enterprisemodalShow: false
          });
          that.onGetListData({ page: 1 });
        } else {
          tools.dealFail(res);
        }
        that.setState({ modalLoading: false, loading: false });
      })
      .catch(() => {
        that.setState({ modalLoading: false, loading: false });
      });
  }

  // 个人信息ocr审核
  onOCRperson (obj) {
    // eslint-disable-next-line consistent-this
    let that = this.that;
    that.setState({
      loading: true,
      modalLoading: true,
    });
    let id = this.id;
    console.log(id);
    http.post(`${BSS_ADMIN_URL}/api/customer/customerAuth/idcard`, obj)
      .then((res) => {
        res = res.data;
        console.log(res);
        if (res.code == 20000) {
          Modal.success({
            content: "姓名和身份证号匹配成功",
            destroyOnClose: true,
          });
          that.setState({
            page: 1,
            modalLoading: false,
          });
        } else {
          tools.dealFail(res);
        }
        that.setState({ modalLoading: false, loading: false });
      })
      .catch(() => {
        that.setState({ modalLoading: false, loading: false });
      });
  }

  // 企业信息ocr审核
  onOCRbusiness (obj) {
    console.log(obj);
    // eslint-disable-next-line consistent-this
    let that = this.that;
    that.setState({
      loading: true,
      modalLoading: true,
    });
    let id = this.id;
    console.log(id);
    http.post(`${BSS_ADMIN_URL}/api/customer/customerAuth/businessLicense`, obj)
      .then((res) => {
        res = res.data;
        console.log(res);
        if (res.code == 20000) {
          Modal.success({
            content: "统一社会信用代码/注册号/组织机构代码和企业名称匹配成功",
            destroyOnClose: true,
          });
          that.setState({
            page: 1,
            modalLoading: false,
          });
        } else {
          tools.dealFail(res);
        }
        that.setState({ modalLoading: false, loading: false });
      })
      .catch(() => {
        that.setState({ modalLoading: false, loading: false });
      });
  }

  // 构建字段
  makeColumns () {
    const { auth_status, auth_type, auth_way } = SYS_DICT_CUSTOMER;
    const columns = [
      {
        title: '用户邮箱',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: '真实姓名',
        dataIndex: 'cardName',
        key: 'cardName',
      },
      {
        title: '认证类型',
        dataIndex: 'authType',
        key: 'authType',
        render: (text, record) => auth_type[text]
      },
      {
        title: '认证方式',
        dataIndex: 'authWay',
        key: 'authWay',
        render: (text, record) => auth_way[text]
      },
      {
        title: '认证状态',
        dataIndex: 'authStatus',
        key: 'authStatus',
        render: (text, record) => auth_status[text]
      },
      {
        title: '操作',
        key: 'control',
        fixed: 'right',
        width: 300,
        render: (text, record) => {
          const controls = [];
          const u = this.props.root.userinfo || {};
          const p = this.props.root.powers;
          {User.hasPermission('customerAuth-view') &&
         (record.authStatus === 3 &&
            controls.push(
              <Button
                key="1"
                size="small"
                onClick={() => {this.onModalShow(record);}}
                style={{ marginRight: '8px' }}
                className="actions-btn"
              >
                审核
              </Button>
            ));}
          {User.hasPermission('customerAuth-view') &&
          (record.authStatus !== 3 &&
            controls.push(
              <Check record={record}>
                <Button
                  key="2"
                  size="small"
                  // onClick={() => {console.log(record);}}
                  style={{ marginRight: '8px' }}
                  className="actions-btn"
                >
                  详情
                </Button>
              </Check>
            ));}
          const result = [];
          controls.forEach((item, index) => {
            if (index) {
              result.push(<Divider key={`line${index}`} type="vertical" />);
            }
            result.push(item);
          });
          return result;
        }
      }
    ];
    return columns;
  }

  render () {
    const { lists, loading, page, pageSize, total, nowId, modalShow, enterprisemodalShow, nowData } = this.state;
    const { auth_type, auth_status, auth_way } = SYS_DICT_CUSTOMER;
    return (
      <main className="mian">
        <div className="g-search">
          <Form ref={this.searchFormRef} name="searchbox" layout="inline" onFinish={(values) => {this.onSearchfrom(values);}}>
            <Form.Item name="authType">
              <Select
                placeholder="请选择认证类型" allowClear
                style={{ width: 170 }}>
                {_.map(auth_type, (value, key) => <Option value={parseInt(key)} key={key}>{value}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="authWay">
              <Select
                placeholder="请选择认证方式" allowClear
                style={{ width: 170 }}>
                {_.map(auth_way, (value, key) => <Option value={parseInt(key)} key={key}>{value}</Option>)}
              </Select>
            </Form.Item>
            <Form.Item name="authStatus">
              <Select
                placeholder="请选择认证状态" allowClear
                style={{ width: 170 }}>
                {_.map(auth_status, (value, key) => <Option value={parseInt(key)} key={key}>{value}</Option>)}
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
        <Modal
          title="个人信息审核"
          maskClosable={false}
          width="80%"
          destroyOnClose
          footer={null}
          onCancel={this.onModalClose}
          visible={modalShow}>
          <Personal
            that={this}
            onOk={this.onModalOk}
            onFail={this.onModalFail}
            onClose={this.onModalClose}
            onOCR={this.onOCRperson}
            defaultData={nowData}
            id={nowId}></Personal>
        </Modal>
        <Modal
          title="企业信息审核"
          maskClosable={false}
          width="80%"
          destroyOnClose
          footer={null}
          onCancel={this.onModalClose}
          visible={enterprisemodalShow}>
          <Enterprise
            that={this}
            onOk={this.onModalOk}
            onFail={this.onModalFail}
            onClose={this.onModalClose}
            onOCR={this.onOCRbusiness}
            defaultData={nowData}
            id={nowId}></Enterprise>
        </Modal>
      </main>
    );
  }
}
