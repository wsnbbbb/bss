/* eslint-disable no-duplicate-imports */
/* eslint-disable react/prop-types */

/** 资源管理/机柜U位管理 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import http from '@src/util/http';
import {
  Form,
  Button,
  Table,
} from 'antd';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router';
import tools from '@src/util/tools'; // 工具
import {SYS_DICT_NET_DEVICE} from "@src/config/sysDict";
@withRouter
@observer
class Device extends React.Component {
    static propTypes = {
      location: P.any,
      history: P.any,
      match: P.any,
      defaultData: P.any,  // 当前选中的信息
      onOk: P.func, // 弹框确认
      onClose: P.func, // 只关闭弹窗
    };
    // formRefAdd = React.createRef();
    constructor (props) {
      super(props);
      this.selectedRowKeys = [];// 选中的key
      this.searchFormRef = React.createRef();
      this.searchCondition = {};
      this.state = {
        lists: [],
        loading: false,
        showModal: false,
        pageNum: 1, // 当前第几页
        page_size: 20, // 每页多少条
        total: 0, // 数据库总共多少条数据
        pages: 0,
        selectedRowKeys: []
      };
    }
    componentDidMount () {
      this.onGetMListData();
    }
    // 网络设备列表
    onGetMListData (param = {}) {
      let params = _.assign({}, this.searchCondition, {cabinetId: this.props.record.id, deviceType: 0}, param);
      this.setState({ loading: true });
      http.get(`${BSS_ADMIN_URL}/api/product/network/devices`, { params: tools.clearNull(params) })
        .then((res) => {
          res = res.data;
          if (tools.hasStatusOk(res)) {
            let lists = res.data.records;
            this.setState({
              lists: lists,
              total: res.data.total,
              pages: res.data.pages,
              pageNum: res.data.current
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
    // 构建字段 机房
    makeColumns () {
      const columns = [
        {
          title: '设备名称',
          dataIndex: 'deviceName',
          key: 'deviceName'
        },
        {
          title: '区域',
          dataIndex: 'fullLocationName',
          key: 'fullLocationName'
        },
        {
          title: '机柜',
          dataIndex: 'cabinetName',
          key: 'cabinetName'
        },
        {
          title: '物理位置码',
          dataIndex: 'locationCode',
          key: 'PhyLocationCode'
        },
        {
          title: '管理IP',
          dataIndex: 'ip',
          key: 'ip'
        },
        {
          title: '起始U位',
          dataIndex: 'startubat',
          key: 'startubat'
        },
        {
          title: '占用U位',
          dataIndex: 'uw',
          key: 'uw'
        },
        {
          title: '端口数量',
          dataIndex: 'num',
          key: 'num'
        },
        {
          title: '设备类型',
          dataIndex: 'deviceType',
          key: 'deviceType',
          render: (text, record) => SYS_DICT_NET_DEVICE.re_facility[text]
        },
      ];
      return columns;
    }
    render () {
      const { lists, loading, total, page_size, pageNum } = this.state;
      const pagination = {
        current: pageNum,
        total: total,
        size: page_size,
        defaultPageSize: page_size,
        onChange: (current, size) => this.onGetMListData({  page: current, pageSize: size }),
        onShowSizeChange: (current, size) => this.onGetMListData({  page: current, pageSize: size }),
        showTotal: (total) => `共${total}条`
      };
      return (
        <main>
          <div className="c-operate" >
            <Button size="middle" onClick={() => this.onGetMListData()} className="actions-btn">刷新</Button>
          </div>
          {/* 数据展示 */}
          <div className="g-table">
            <Table
              columns={this.makeColumns()}
              rowKey={(record) => record.id}
              loading={loading}
              dataSource={lists}
              pagination={pagination}
              size="small"
            />
          </div>
        </main>
      );
    }
}
export default Device;


