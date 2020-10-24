
/** 资源管理/区域管理增 修 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import http from '@src/util/http';
import tools from '@src/util/tools';
import {
  Button,
  Table,
  Modal,
  Pagination
} from 'antd';
import { inject, observer } from 'mobx-react';

@inject('root')
@observer
class Record extends React.Component {
  static propTypes = {
    data: P.any,  // 当前选中的信息
    visible: P.bool, // 弹框是否显示
    modalLoading: P.bool, // 添加/修改/查看 是否正在请求中
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
  };
  formRefCheck = React.createRef();
  constructor (props) {
    super(props);
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
      lists: [],
      loading: false, // 表格数据是否正在加载中
      page: 1, // 当前第几页
      pageSize: 10, // 每页多少条
    };
  }


  /**
   * 获取设备详细）
   * @param {*} id 设备id
   */
  getDetail (values) {
    const id = this.props.deviceId;
    const params = _.assign({}, {
      page: this.state.page,
      pageSize: this.state.pageSize,
    }, this.searchParam, {
      ...values
    });
    this.setState({
      loading: true,
    });
    this.setState({
      modalLoading: true,
    });

    http.get(`${BSS_ADMIN_URL}/api/product/ipUseRecord/${id}`, {
      params: params
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let data = res.data;
          this.setState({
            lists: res.data.records,
            total: res.data.total,
          });
        } else {
          tools.dealFail(res);
          this.setState({
            modalLoading: false,
            loading: false
          });
        }
        this.setState({ modalLoading: false, loading: false });
      })
      .catch(() => {
        this.setState({
          modalLoading: false,
          loading: false
        });
      });
  }

  onModalShow = () => {
    this.getDetail();
    this.setState({
      showModal: true,
    });
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.setState({ showModal: false });
  };

  // 表单页码改变
  onPageChange (page, pageSize) {
    this.setState({
      page: page,
    });
    this.getDetail({
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
    this.getDetail({
      page: page,
      pageSize: pageSize
    });
  }

  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: 'ip名称',
        dataIndex: 'ipAddr',
        key: 'ipAddr',
      },
      {
        title: '服务器',
        dataIndex: 'serverManageIp',
        key: 'serverManageIp'
      },
      {
        title: '使用周期',
        dataIndex: 'startEnd',
        key: 'startEnd'
      },
      {
        title: '客户',
        dataIndex: 'customerName',
        key: 'customerName'
      }
    ];
    return columns;
  }

  render () {
    const { showModal, loading, lists, page, pageSize, total } = this.state;
    return (
      <React.Fragment>
        <Modal
          title="使用记录"
          maskClosable={false}
          width="80%"
          destroyOnClose
          footer={null}
          onCancel={this.onClose}
          visible={showModal}
        >
          <div className="g-table">
            <Table
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
                onChange={(current, pageSize) => {this.onPageChange(current, pageSize);}}
                onShowSizeChange={(current, pageSize) => {this.onPageSizeChange(current, pageSize);}} />
            </div>
          </div>
          <div className="actions-btn">
            <Button onClick={this.onClose} className="action-btn ok">关闭</Button>
          </div>
        </Modal>
        <span onClick={this.onModalShow}>
          {this.props.children}
        </span>
      </React.Fragment>
    );
  }
}
export default Record;
