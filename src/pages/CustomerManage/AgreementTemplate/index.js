/* eslint-disable react/prop-types */
/** 后台用户管理中心 协议模板管理 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import {
  Button,
  Table,
  Pagination,
  Modal
} from 'antd';
import { inject, observer } from 'mobx-react';
import http from '@src/util/http';
import tools from '@src/util/tools'; // 工具
import { User } from '@src/util/user.js';
import { SYS_DICT_CUSTOMER } from '@src/config/sysDict';// 后台用户管理中心字典


// ==================
// 所需的所有组件
// ==================
import Edit from './container/Edit';

@inject('root')
@observer
export default class list extends React.Component {
  static propTypes = {
    location: P.any, // 当前位置
    history: P.any,
    root: P.any, // 全局状态
    match: P.any, // 路径
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
      nowData: {}, // 当前选中数据
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
    http.get(`${BSS_ADMIN_URL}/api/customer/protocolTemplate`, {params: params})
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

  // 保存编辑内容
  onModalOk (obj) {
    console.log(obj);
    // eslint-disable-next-line consistent-this
    let that = this.that;
    that.setState({
      loading: true,
      modalLoading: true,
    });
    let param = tools.clearNull({
      ...obj
    });
    http.put(`${BSS_ADMIN_URL}/api/customer/protocolTemplate/${this.id}/update`, param)
      .then((res) => {
        res = res.data;
        console.log(res);
        if (tools.hasStatusOk(res)) {
          tools.auto_close_result('ok', '操作成功');
          that.setState({
            page: 1,
            modalLoading: false,
            modalShow: false,
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

  // 编辑弹窗
  onModalShow = (record) => {
    this.searchParam = {};
    console.log(record);
    this.setState({
      modalShow: true,
      nowId: record.id,
      nowData: record
    });
  }

  release = (id) => {
    this.setState({
      loading: true,
      modalLoading: true,
    });
    http.put(`${BSS_ADMIN_URL}/api/customer/protocolTemplate/${id}/release`)
      .then((res) => {
        res = res.data;
        console.log(res);
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

  onModalClose = () => {
    this.setState({
      modalShow: false,
    });
  }
  // 构建字段
  makeColumns () {
    const { protocol_type } = SYS_DICT_CUSTOMER;
    const columns = [
      {
        title: '模板类型',
        dataIndex: 'templateType',
        key: 'templateType',
        render: (text, record) => protocol_type[text]
      },
      {
        title: '中文简体名称',
        dataIndex: 'simplifiedName',
        key: 'simplifiedName',
      },
      {
        title: '中文繁体名称',
        dataIndex: 'traditionalName',
        key: 'traditionalName',
      },
      {
        title: 'English Name',
        dataIndex: 'englishName',
        key: 'englishName',
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
          {User.hasPermission('protocol-edit') && controls.push(
            <Button
              key="0"
              size="small"
              style={{ marginRight: '8px' }}
              className="actions-btn"
              onClick={() => {this.onModalShow(record);}}
            >
              编辑
            </Button>
          );};
          {User.hasPermission('protocol-release') && controls.push(
            <Button
              key="1"
              size="small"
              onClick={() => {this.release(record.id);}}
              style={{ marginRight: '8px' }}
              className="actions-btn"
            >
              发布
            </Button>
          );}
          return controls;
        }
      }
    ];
    return columns;
  }

  render () {
    const { lists, loading, page, pageSize, total, nowId, modalShow, nowData } = this.state;
    return (
      <main className="mian">
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
          title="协议管理编辑"
          maskClosable={false}
          width="80%"
          destroyOnClose
          footer={null}
          onCancel={this.onModalClose}
          visible={modalShow}>
          <Edit
            that={this}
            onOk={this.onModalOk}
            onClose={this.onModalClose}
            defaultData={nowData}
            id={nowId}></Edit>
        </Modal>
      </main>
    );
  }
}
