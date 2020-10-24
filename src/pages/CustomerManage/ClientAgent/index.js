/* eslint-disable react/prop-types */
/** 后台用户管理中心 代理等级设置 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import {
  Button,
  Table,
  Pagination,
  Tooltip,
  Divider,
} from 'antd';
import {
  FormOutlined,
} from "@ant-design/icons";
import { inject, observer } from 'mobx-react';
import http from '@src/util/http';
import { User } from '@src/util/user.js';
import tools from '@src/util/tools'; // 工具


// ==================
// 所需的所有组件
// ==================
import Add from './container/Add';


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
    this.searchParam = {}; // 搜索条件，因为不需要条件更新来及时的重新渲染组件，所以不放在state中
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
    http.get(`${BSS_ADMIN_URL}/api/customer/agencyLevel`, {
    // http.get(`http://10.3.9.24:8080/api/customer/agencyLevel`, {
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

  // 查看、修改、添加弹窗
  onModalShow (type, data) {
    let datas;
    if (type == 'up') {
      datas = {
        ...data,
        // discount: data.discount * 100,
        // warning: data.warning * 100,
        // audit: data.audit * 100
      };
    }
    this.setState({
      modalShow: true,
      nowData: datas,
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
  onModalOk (customerRelation) {
    if (this.state.operateType == 'add') {
      console.log(customerRelation);
      let param = tools.clearNull(customerRelation);
      http.post(`${BSS_ADMIN_URL}/api/customer/agencyLevel/add`, param)
      // http.post(`http://10.3.9.24:8080/api/customer/agencyLevel/add`, param)
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
      console.log(customerRelation);
      this.setState({
        loading: true,
        modalLoading: true,
      });
      http.put(`${BSS_ADMIN_URL}/api/customer/agencyLevel/${customerRelation.id}/update`, customerRelation)
      // http.put(`http://10.3.9.24:8080/api/customer/agencyLevel/${customerRelation.id}/update`, customerRelation)
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
    console.log(obj);
  }

  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: '代理等级',
        dataIndex: 'agencyLevel',
        key: 'agencyLevel',
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
              key="1"
              className="control-btn blue"
              onClick={() => this.onModalShow("up", record)}
            >
              {User.hasPermission('agencyLevel-update') &&
              <Tooltip placement="top" title="编辑">
                <FormOutlined></FormOutlined>
              </Tooltip>}
            </span>
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
    return (
      <main className="mian">
        {/* 操作 */}
        <div className="g-operate">
          {User.hasPermission('agencyLevel-add') && <Button size="middle" className="actions-btn" onClick={() => this.onModalShow("add")}>添加代理等级</Button>}
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
      </main>
    );
  }
}
