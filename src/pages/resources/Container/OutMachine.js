/* eslint-disable react/prop-types */
/**
 * 外机选择，主要用于服务器入库
 */
// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import http from '@src/util/http';
import {
  Table,
  Modal,
} from 'antd';
import { inject} from 'mobx-react';
import { withRouter } from 'react-router';
import tools from '@src/util/tools'; // 工具

@withRouter
class OutsideMachineRadio extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    children: P.any,
    portDict: P.any,
    disabled: P.bool, // 父组件 来控制子组件是否可用 比如：前置条件机房已经有了 就让使用子组件
    allowClear: P.bool, // 父组件 来控制子组件是否可用 比如：前置条件机房已经有了 就让使用子组件
    disabledTip: P.string, // 不能使用子组件原因
    title: P.string,
    style: P.any, // 样式
    fetchPath: P.string, // 获取数据的查询条件
    defaultData: P.any,  // 当前选中的信息
    onSelect: P.func, // 确认选择
  };
  formRefAdd = React.createRef();
  constructor (props) {
    super(props);
    this.selectAreaNode = {}; // 选中的地区节点信息
    this.selectedRows = []; // 选中行数据
    this.regionId = '';
    this.uw = 0;
    this.state = {
      nwoData: {}, // 获取的机柜数据
      orgionLists: [], // 第一次获取的list数据（原始数据）
      lists: [], // 通过机柜名称查询后的数据
      loading: false,
      showModal: false,
      cabinetName: '',
    };
  }
  componentDidMount () {
    // this.getDetail(this.props.cabinetId);
  }
  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextProps.regionId !== this.props.regionId;
  // }
  componentWillReceiveProps (nextProps) {
  }

  /**
   * 获取节点详情信息
   * @param  查询条件 fileds
   */
  getDetail (fileds = {}) {
    this.setState({
      loading: true,
    });
    http.get(`${this.props.fetchPath}`, {
      params: fileds
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            loading: false,
            lists: res.data,
            orgionLists: res.data,
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

  // 选择选中行
  selectedRow (selectedRowKeys, selectedRows) {
    this.selectedRows = selectedRows;
    this.props.onSelect(selectedRowKeys, selectedRows);
    this.setState({
      showModal: false,
      cabinetName: selectedRows[0].name,
    });
  }

  modalShow () {
    if (this.props.disabled) {
      Modal.warning({
        title: this.props.disabledTip
      });
      return;
    }
    this.getDetail();
    this.setState({
      showModal: true
    });
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.setState({showModal: false});
  };


  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: '外机名称',
        dataIndex: 'nodeServerName',
        key: 'nodeServerName'
      },
      {
        title: '位置码',
        dataIndex: 'physicsLocationCode',
        key: 'physicsLocationCode'
      },
      {
        title: '节点数',
        dataIndex: 'nodeNum',
        key: 'nodeNum'
      },
      {
        title: '剩余节点数',
        dataIndex: 'nodeRemain',
        key: 'nodeRemain'
      },
      {
        title: '总U位数',
        dataIndex: 'us',
        key: 'us'
      },
      {
        title: '资源备注',
        dataIndex: 'remark',
        key: 'remark'
      },
    ];
    return columns;
  }

  render () {
    const {title, uw, regionId} = this.props;
    const {lists, showModal, loading} = this.state;
    return (
      <main className="mian">
        <Modal
          title={this.props.title || '选择外机'}
          maskClosable={false}
          width="90%"
          destroyOnClose
          footer={false}
          onOk={this.onModalOk}
          onCancel={this.onClose}
          visible={showModal}
        >
          {/* 搜索 */}
          {/* <div className="g-search">
            <Form ref={this.searchFormRef} name="searchbox" layout="inline" onFinish={(values) => {this.getDetail(values);}}>
              <Form.Item name="cabinetName">
                <Input placeholder="外机名称" allowClear/>
              </Form.Item>
              <Form.Item shouldUpdate>
                <Button type="primary" htmlType="submit" >搜索</Button>
              </Form.Item>
            </Form>
          </div> */}
          {/* 数据展示 */}
          <div className="g-table">
            <Table
              columns={this.makeColumns()}
              rowKey={(record) => record.id}
              loading={loading}
              dataSource={lists}
              pagination={false}
              rowSelection={{
                type: 'radio',
                onChange: (selectedRowKeys, selectedRows) => {this.selectedRow(selectedRowKeys, selectedRows);}
              }}
            />
          </div>
        </Modal>
        <span onClick={() => {this.modalShow();}}>
          {this.props.children}
        </span>
      </main>
    );
  }
}
export default OutsideMachineRadio;


