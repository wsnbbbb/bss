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
  Input,
  Table,
  Modal,
  Select,
  TreeSelect
} from 'antd';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router';
import tools from '@src/util/tools'; // 工具

// ==================
// Definition
// ==================

const { Option } = Select;

@withRouter
@inject('root')
@inject('cabinetDict')
@inject('serverDict')
@inject('deviceDict')
@observer
class BlackLog extends React.Component {
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
    // formRefAdd = React.createRef();
    constructor (props) {
      super(props);
      console.log(props);
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
    }
    // 日志列表
    onGetMListData (param = {}) {
      let params = _.assign({}, this.searchCondition, {ipBlacklisId: this.props.record.id}, param);
      console.log(params);
      this.setState({ loading: true });
      http.get(`${BSS_ADMIN_URL}/api/product/ipBlacklistHisLog`, { params: tools.clearNull(params) })
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
      this.onGetMListData();
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
      this.setState({ showModal: false });
    };
    // 构建字段 机房
    makeColumns () {
      const columns = [
        {
          title: "机房/区域",
          dataIndex: "fullLocationName",
          key: "fullLocationName",
        },
        {
          title: "ip名称",
          dataIndex: "ipAddr",
          key: "ipAddr",
        },
        {
          title: "操作时间",
          dataIndex: "operTime",
          key: "operTime",
          render: (text, record) => tools.getTime(text)
        },
        {
          title: "资源状态",
          dataIndex: "resStatus",
          key: "resStatus",
          render: (text, record) => this.props.resStatus[text]
        },
        {
          title: "ip特殊状态",
          dataIndex: "specialStatus",
          key: "specialStatus",
          render: (text, record) => this.props.specialStatus[text]
        },
        {
          title: "处理内容",
          dataIndex: "content",
          key: "content",
        },
        {
          title: "客户",
          dataIndex: "customerName",
          key: "customerName",
        },
        {
          title: "处理人",
          dataIndex: "disposeName",
          key: "disposeName",
        },
      ];
      return columns;
    }
    render () {
      const { lists, showModal, loading, total, page_size, pageNum } = this.state;
      let {   data } = this.props;
      const pagination = {
        current: pageNum,
        total: total,
        size: page_size,
        defaultPageSize: page_size,
        onChange: (current, size) => this.onGetMListData({  page: current, pageSize: size }),
        onShowSizeChange: (current, size) =>  this.onGetMListData({  page: current, pageSize: size }),
        showTotal: (total) => `一共${total}条数据`
      };
      // console.log(data);
      return (
        <main>
          <Modal
            title="查看日志"
            maskClosable={false}
            width="80%"
            destroyOnClose
            footer={null}
            onCancel={this.onClose}
            visible={showModal}
          >
            {/* 搜索 */}
            <div className="g-search">
              <Form ref={this.searchFormRef} name="horizontal_login" layout="inline"
                onFinish={(values) => {this.onSearch(values);}}
              >
                <Form.Item name="regionId">
                  <Select
                    style={{ width: 300 }}
                    allowClear
                    placeholder="请选择机房区域"
                  >
                    {
                      data.map((item) =>
                        <Option key={item.fullLocationId} value={item.regionId}>{item.fullLocationName}</Option>
                      )
                    }
                  </Select>
                </Form.Item>
                <Form.Item name="ipAddr" rules={[
                  { whiteSpace: true, message: "不能输入空格" },
                  // { pattern: regExpConfig.float, message: "请输入正确查询" },
                ]}>
                  <Input allowClear placeholder="请输入ip名称">
                  </Input>
                </Form.Item>
                <Form.Item shouldUpdate>
                  <Button type="primary" htmlType="submit" >搜索</Button>
                </Form.Item>
                <Form.Item shouldUpdate>
                  <Button type="primary" htmlType="reset" onClick={this.onReset}>重置</Button>
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
export default BlackLog;


