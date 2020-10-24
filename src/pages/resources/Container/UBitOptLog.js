/* eslint-disable react/prop-types */

/** U位操作记录 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import http from '@src/util/http';
import {
  Form,
  Input,
  Tag,
  Table,
  Pagination,
  Modal,
  Tooltip,
  Select,
  TreeSelect
} from 'antd';
import { EyeOutlined} from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';
import tools from '@src/util/tools'; // 工具
import {SYS_DICT_NET_DEVICE} from '@src/config/sysDict'; // 系统字典

@withRouter
@observer
class UBitOptLog extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    root: P.any,
    powers: P.array, // 当前登录用户权限
    data: P.any,  // 当前选中的信息
    uLocationId: P.string
  };
  constructor (props) {
    super(props);
    this.selectAreaNode = {}; // 选中的地区节点信息
    this.state = {
      lists: [],
      loading: false,
      modalShow: false, //
      page: 1, // 当前第几页
      pageSize: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
    };
  }
  componentDidMount () {
  }
  componentWillReceiveProps (nextProps) {
  }

  /**
   * 获取机柜详情信息
   * @param {*} id 机柜id
   * @param {*} operateType 'up'|'see'
   */
  getLog (value) {
    this.setState({
      loading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/product/usagerecord`, {
      params: {uLocationId: this.props.uLocationId}
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            loading: false,
            lists: res.data.records
          });
        } else {
          tools.dealFail(res);
          this.setState({
            loading: false,
          });
        }
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
      });
  }

  // 表单页码改变
  onPageChange (page, pageSize) {
    this.getLog(page, pageSize);
  }

  // 表单页码长度改变
  onPageSizeChange (page, pageSize) {
    this.getLog(page, pageSize);
  }

  onModalShow () {
    this.setState({
      modalShow: true,
    });
    this.getLog();

  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.setState({
      modalShow: false,
    });
  };

  // 构建字段 机房
  makeColumns () {
    const columns = [
      {
        title: '管理ip',
        dataIndex: 'managementIp',
        key: 'managementIp'
      },
      {
        title: '设备',
        dataIndex: 'deviceName',
        key: 'deviceName'
      },
      {
        title: '设备类型',
        dataIndex: 'type',
        key: 'type',
        render: (text, record) => SYS_DICT_NET_DEVICE.uw_facility[text]
      },
      {
        title: '出库时间',
        dataIndex: 'outboundTime',
        key: 'outboundTime',
        render: (text, record) => tools.getTime(text),
      }
    ];
    return columns;
  }

  render () {
    const {lists, modalShow, loading, page, total} = this.state;
    return (<React.Fragment>
      <main className="mian">
        <Modal
          title="出库记录"
          maskClosable={false}
          width="80%"
          destroyOnClose
          onCancel={this.onClose}
          footer={null}
          visible={modalShow}
        >
          {/* 数据展示 */}
          <div className="g-table">
            <Table
              columns={this.makeColumns()}
              rowKey={(record) => record.id}
              loading={loading}
              dataSource={lists}
            />
            <Pagination size="small" current={page} total={total} showSizeChanger
              onChange={(current, size) => {this.onPageChange(current, size);}}
              onShowSizeChange={(current, size) => {this.onPageSizeChange(current, size);}}
            />
          </div>
        </Modal>
      </main>
      <span
        className="control-btn green"
        onClick={() => this.onModalShow()}
      >
        <Tooltip placement="top" title="出库记录">
          <EyeOutlined></EyeOutlined>
        </Tooltip>
      </span>
    </React.Fragment>
    );
  }
}
export default UBitOptLog;


