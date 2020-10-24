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
  Input,
  Tag,
  InputNumber,
  Table,
  Pagination,
  message,
  Popconfirm,
  Spin,
  Modal,
  Tooltip,
  Divider,
  Select
} from 'antd';
import { ExclamationCircleOutlined, FormOutlined, DeleteOutlined} from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';
import {observable} from "mobx";
import {formItemLayout, houseAttribute, UBitStatus} from '@src/config/commvar'; // 全局通用变量
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import {SYS_DICT_SERVERPART} from '@src/config/sysDict'; // 系统字典
import HardDiskRadio from '@src/pages/resources/Container/HardDiskRadio';
import HardDiskModelRadio from '@src/pages/resources/Container/HardDiskModelRadio';

// ==================
// Definition
// ==================
@withRouter
@inject('root')
@inject('deviceDict')
@observer
class List extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    root: P.any,
    powers: P.array, // 当前登录用户权限
    Serverinfo: P.any, // 服务器信息
    canOpt: P.bool, // 是否可以执行操作（例如：已售服务器不允许操作）
  };
  constructor (props) {
    super(props);
    this.formRefAdd =  React.createRef();
    this.searchFormRef =  React.createRef();
    this.flag_updateList = false; // 标识是否需要更新服务器列表（修改成功的移除成功后）
    this.state = {
      nowData: {}, //
      lists: [], // table数据
      page: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      modalShow: false,
      modalLoading: false,
    };
  }
  componentDidMount () {
  }
  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextState.someData !== this.state.someData;
  // }
  // componentWillReceiveProps (nextProps) {
  //   console.log(nextProps, this.props);
  // }

  // 查询当前页面所需列表数据
  onGetListData (values) {
    // const p = this.props.root.powers;
    // if (!p.includes('user:query')) {
    //   return;
    // };
    this.setState({
      loading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/product/server/disk?ServerId=${this.props.Serverinfo.id}`, {params: values})
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

  // 移除硬盘条
  onDel (id) {
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      content: `确认要移除这个硬盘条吗？`,
      onOk: () => {
        this.setState({ loading: true });
        http.delete(`${BSS_ADMIN_URL}/api/product/server/disk/${id}/delete`)
          .then((res) => {
            res = res.data;
            if (tools.hasStatusOk(res)) {
              tools.auto_close_result('ok', '操作成功');
              this.onGetListData();
              this.flag_updateList = true;
            } else {
              tools.dealFail(res);
              this.setState({ loading: false });
            }
          })
          .catch(() => {
            this.setState({ loading: false });
          });
      },
      onCancel () {
        console.log('Cancel');
      },
    });
  }

  // 显示服务器硬盘
  onModalShow (type, data) {
    if (this.props.Serverinfo.id == undefined) {
      Modal.error({
        title: "这条服务器没有id"
      });
      return false;
    }
    this.onGetListData();
    this.setState({
      modalShow: true,
    });
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    if (this.flag_updateList) {
      this.props.updateList();
    }
    this.setState({modalShow: false});
  };

  // 修改硬盘 (版本号控制机制：不用服务器的版本号而是使用硬盘的版本号，因为每次修改硬盘，要刷新服务器列表获取新的版本号，用户体验不好；)
  onEditHardDisk (record, ramid, rams) {
    this.setState({
      modalLoading: true,
    });
    http.put(`${BSS_ADMIN_URL}/api/product/server/disk/${record.id}/edit`, {diskReplaceId: rams.id, version: record.version, workOrder: 0})
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            modalLoading: false,
          });
          tools.auto_close_result('ok', '操作成功');
          this.flag_updateList = true;
          this.onGetListData();
        } else {
          this.setState({ modalLoading: false });
          tools.dealFail(res);
        }
      })
      .catch(() => {
        this.setState({ modalLoading: false });
      });
  }

  // 添加硬盘
  onAddHardDisk (record, ramid, rams) {
    http.post(`${BSS_ADMIN_URL}/api/product/server/disk/add`, {
      serverId: record.serverId,
      diskModelId: rams.id,
      diskSlot: record.diskSlot,
      isInit: 1,
      workOrder: 0
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            modalLoading: false,
          });
          tools.auto_close_result('ok', '操作成功');
          this.flag_updateList = true;
          this.onGetListData();
        } else {
          tools.dealFail(res);
        }
        this.setState({ modalLoading: false });
      })
      .catch(() => {
        this.setState({ modalLoading: false });
      });
  }

  // 构建字段 机房
  makeColumns () {
    const columns = [
      {
        title: '卡槽',
        dataIndex: 'diskSlot',
        width: 150,
        key: 'diskSlot',
      },
      {
        title: '硬盘大小',
        dataIndex: 'diskSize',
        width: 150,
        key: 'diskSize',
        render: (text, record) => {
          // diskModelId 可能为null
          // diskModelId可能是空字符串
          if (!record.diskModelId || !record.diskModelId.trim()) {
            return '';
          }
          return text;
        }
      },
      {
        title: '硬盘型号名称',
        dataIndex: 'diskName',
        width: 150,
        key: 'diskName',
      },
      {
        title: '资源状态',
        dataIndex: 'diskStatus',
        width: 150,
        key: 'diskStatus',
        render: (text, record) => {
          if (!record.diskModelId || !record.diskModelId.trim()) { // 为空
            return '';
          }
          if (text) {
            text =  parseInt(text);
            return tools.renderStatus(SYS_DICT_SERVERPART.parts_res_status, text);
          }
          return '';

        }
      },

    ];
    if (this.props.canOpt) {
      columns.push({
        title: '操作',
        key: 'control',
        fixed: 'right',
        width: 160,
        render: (text, record) => {
          const controls = [];
          const u = this.props.root.userinfo || {};
          const p = this.props.root.powers;
          let hasdisk = !(!record.diskModelId || !record.diskModelId.trim());
          // p.includes('user:query') &&
          hasdisk && controls.push(
            <HardDiskModelRadio
              fetchPath={`${BSS_ADMIN_URL}/api/product/diskmodel`}
              title={'选择硬盘型号'}
              onSelect={(ramid, rams) => {this.onEditHardDisk(record, ramid, rams);}}>
              <Tooltip placement="top" title="修改">
                <FormOutlined></FormOutlined>
              </Tooltip>
            </HardDiskModelRadio>
            // <HardDiskRadio
            //   disabled={!this.props.Serverinfo.houseId} // 父组件 来控制子组件是否可用 比如：前置条件机房已经有了 就让使用子组件
            //   disabledTip="机房信息缺失" // 不能使用子组件原因
            //   fetchPath={`${BSS_ADMIN_URL}/api/product/diskdetail?saleStatus=0&houseId=${this.props.Serverinfo.houseId}`} // 服务器所在机房下可用的硬盘
            //   title={'选择硬盘'}
            //   onSelect={(ramid, rams) => {this.onEditHardDisk(record, ramid, rams);}}
            // ><Tooltip placement="top" title="修改">
            //     <FormOutlined></FormOutlined>
            //   </Tooltip></HardDiskRadio>
          );
          // p.includes('user:query') &&
          !hasdisk && controls.push(
            <HardDiskModelRadio
              fetchPath={`${BSS_ADMIN_URL}/api/product/diskmodel`}
              title={'选择硬盘型号'}
              onSelect={(ramid, rams) => {this.onAddHardDisk(record, ramid, rams);}}>
              <Tooltip placement="top" title="添加">
                <FormOutlined></FormOutlined>
              </Tooltip>
            </HardDiskModelRadio>
            // <HardDiskRadio
            //   disabled={!this.props.Serverinfo.houseId} // 父组件 来控制子组件是否可用 比如：前置条件机房已经有了 就让使用子组件
            //   disabledTip="机房信息缺失" // 不能使用子组件原因
            //   fetchPath={`${BSS_ADMIN_URL}/api/product/diskdetail?saleStatus=0&houseId=${this.props.Serverinfo.houseId}`} // 服务器所在机房下可用的硬盘
            //   title={'选择硬盘'}
            //   onSelect={(ramid, rams) => {this.onAddHardDisk(record, ramid, rams);}}
            // ><Tooltip placement="top" title="添加">
            //     <FormOutlined></FormOutlined>
            //   </Tooltip></HardDiskRadio>
          );
          // p.includes('user:up') &&
          hasdisk && controls.push(
            <span
              key="1"
              className="control-btn red"
              onClick={() => this.onDel(record.id)}
            >
              <Tooltip placement="top" title="移除">
                <DeleteOutlined></DeleteOutlined>
              </Tooltip>
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
        }
      });
    }
    return columns;
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

  render () {
    const {lists, loading, page, pageSize, total, modalLoading, modalShow, operateType, nowData} = this.state;
    return (
      <React.Fragment>
        <Modal
          title={this.props.title || '硬盘卡'}
          maskClosable={false}
          width="90%"
          destroyOnClose
          footer={false}
          onCancel={this.onClose}
          visible={modalShow}
        >
          {/* 数据展示 */}
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
                showTotal={(total) => `共 ${total} 条`}
                onChange={(current, size) => {this.onPageChange(current, size);}}
                onShowSizeChange={(current, size) => {this.onPageSizeChange(current, size);}}/>
            </div>
          </div>
        </Modal>
        <span onClick={() => {this.onModalShow();}}>{this.props.children}</span>
      </React.Fragment>
    );
  }
}
export default List;


