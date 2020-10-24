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
  Table,
  Modal
} from 'antd';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';
import tools from '@src/util/tools'; // 工具

@withRouter
@inject('root')
@inject('cabinetDict')
@inject("serverPartDict")
@observer
class SleMod extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    root: P.any,
    cabinetDict: P.any,
    powers: P.array, // 当前登录用户权限
    defaultData: P.any,  // 当前选中的信息
    onOk: P.func, // 弹框确认
    onClose: P.func, // 只关闭弹窗
  };

  constructor (props) {
    super(props);
    this.selectedRows = []; // 选中行数据
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
    };
  }
  componentDidMount () {
    this.onGetMListData(this.state.pageNum, this.state.page_size);

  }

  // 内存型号列表
  onGetMListData (param = {}) {
    let params = _.assign({}, this.searchCondition, param);
    this.setState({ loading: true });
    http.get(`${BSS_ADMIN_URL}/api/product/raidmodel`, {params: tools.clearNull(params)})
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

  /**
   * 重置搜索条件
   */
  onReset = () => {
    this.searchFormRef.current.resetFields();
  };
  modalShow () {
    this.setState({
      showModal: true
    });
  }
  // 验证通过
  onSearch (values) {
    this.searchCondition = values;
    this.onGetMListData(values);
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.setState({showModal: false});
  };
  selectedRow =(selectedRowKeys, selectedRows) => {

    this.props.onSelect(selectedRows);
    this.setState({
      showModal: false
    });
  }
  // 构建字段 机房
  makeColumns () {
    const columns = [
      {
        title: 'raid型号',
        dataIndex: 'raidModel',
        key: 'raidModel',
      },
      {
        title: 'raid卡品牌',
        dataIndex: 'raidBrand',
        key: 'raidBrand',
      },
      {
        title: 'raid类型',
        dataIndex: 'raidType',
        key: 'raidType',
        render: (text, record) => this.props.raid_type[text]
      },

    ];
    return columns;
  }
  render () {
    const {lists, showModal, loading, total, page_size, pageNum } = this.state;
    let {operateType, } = this.props;
    const pagination = {
      current: pageNum,
      total: total,
      defaultPageSize: page_size,
      onChange: (current) => this.onGetMListData({page: current})
    };
    return (
      <main className="mian">
        <Modal
          title={this.props.title || '选择'}
          maskClosable={false}
          width="55%"
          destroyOnClose
          footer={null}
          onCancel={this.onClose}
          visible={showModal}
        >
          {/* 搜索 */}
          <div className="g-search">
            <Form ref={this.searchFormRef} name="horizontal_login" layout="inline"
              onFinish={(values) => {this.onSearch(values);}}>
              <Form.Item name="raidModel">
                <Input  allowClear placeholder="请输入raid型号">
                </Input>
              </Form.Item>
              <Form.Item shouldUpdate>
                <Button type="primary" htmlType="submit" >搜索</Button>
              </Form.Item>
              <Form.Item shouldUpdate>
                <Button type="primary" htmlType="reset" onClick={this.onReset}>重置</Button>
              </Form.Item>
              <Form.Item shouldUpdate>
                <Button type="primary" htmlType="submit" onClick={() => this.onGetMListData}>刷新</Button>
              </Form.Item>
            </Form>
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
              rowSelection={{
                type: 'radio',
                onChange: (selectedRowKeys, selectedRows) => {this.selectedRow(selectedRowKeys, selectedRows);},
              }}
            />
          </div>
        </Modal>
        <span onClick={() => {this.modalShow();}} style={operateType === 'see' ? {display: 'none'} : {display: 'flex'}}>
          {this.props.children}
        </span>
      </main>
    );
  }
}
export default SleMod;


