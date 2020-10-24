/* eslint-disable react/prop-types */
/** 资源模块/外机列表页 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import {
  Form, Button, Input, Select, Radio, Pagination, Modal, InputNumber, Spin,
} from 'antd';
import { inject, observer} from 'mobx-react';
import { Link } from 'react-router-dom';
import http from '@src/util/http';
import tools from '@src/util/tools'; // 工具
import { cabinetStatusColor } from '@src/config/commvar'; // 全局变量
import { SYS_DICT_NODEMASTER } from '@src/config/sysDict'; // 全局变量
import { User } from '@src/util/user.js';
import debounce from 'lodash/debounce';
// ==================
// 所需的所有组件
// ==================
import EditTable2 from '@src/pages/Products/container/EditTable2';
import PriceTable from '@src/pages/Products/container/PriceTable';
const { confirm } = Modal;
const { Option } = Select;
@observer
// @DropTarget(type, spec, collect)
export default class List extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    userinfo: P.any,
    activeKey: P.string, // 当前打开的tabkey 即机房id
    houseId: P.string, //
  };
  searchFormRef = React.createRef();
  constructor (props) {
    super(props);
    this.searchParam = {}, // 存储查询条件（顶部查询条件）
    this.state = {
      lists: [], //
      loading: false, // 外机数据正在加载中
      page: 1, // 当前第几页
      pageSize: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      modalShow: false,   // 机房增 修 查 状态模的显示
      modalLoading: false, // 添加/修改/查看 是否正在请求中
    };
  }
  componentDidMount () {
    if (this.props.activeKey && (this.props.activeKey == this.props.houseId)) {
      this.onGetListData();
    }
  }

  // 查询当前页面所需列表数据
  onGetListData = (values) => {
    const params = _.assign({}, {
      page: this.state.page,
      pageSize: this.state.pageSize,
      houseId: this.props.houseId,
    }, this.searchParam, {
      ...values
    });
    this.setState({
      loading: true,
    });

    http.get(`${BSS_ADMIN_URL}/api/goods/cabinetprice`, {
      params: tools.clearEmpty(params)
    })
      .then((res) => {
        res = res.data;
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

  /**
   * 搜索
   * @param {obj} values 搜索条件
   */
  onSearch (values) {
    this.searchParam = values;
    this.setState({
      page: 1,
    });
    this.onGetListData(values);
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.searchFormRef.current.resetFields();
  };

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

  render () {
    const columns = [{
      title: "机柜名称",
      dataIndex: "configName",
      key: "configName",
    },
    {
      title: "基础价(人民币)",
      dataIndex: "price",
      key: "price",
    }];
    const {lists, page, pageSize, total, loading} =  this.state;
    return (
      <main className="mian">
        {/* 搜索 */}
        <div className="g-search">
          <Form ref={this.searchFormRef} name="searchbox" layout="inline" onFinish={(values) => {this.onSearch(values);}}>
            <Form.Item name="configName">
              <Input
                style={{width: 200}}
                placeholder="机柜名称" allowClear />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" >搜索</Button>
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={this.onResetSearch} >重置</Button>
            </Form.Item>
          </Form>
        </div>
        {/* 操作 */}
        <div className="g-operate">
          <Button className="actions-btn" size="middle" onClick={() => {this.onGetListData();}}>刷新列表</Button>
        </div>
        {/* 数据展示 */}
        <div className="g-table">
          <Spin spinning={loading}>
            <PriceTable data={lists} postData={{houseId: this.props.houseId}} postUrl={`${BSS_ADMIN_URL}/api/goods/cabinetprice`} columns={columns}
              updateList={this.onGetListData}  ></PriceTable>
          </Spin>
          <div className="g-pagination">
            <Pagination current={page} total={total} pageSize={pageSize}
              showSizeChanger
              showTotal={(total) => `共 ${total} 条`}
              onChange={(current, size) => {this.onPageChange(current, size);}}
              onShowSizeChange={(current, size) => {this.onPageSizeChange(current, size);}}
            />
          </div>
        </div>
      </main>
    );
  }
}
