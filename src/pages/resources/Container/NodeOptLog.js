/* eslint-disable react/prop-types */

/** 资源管理/外机 出库详细 **/

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
  Table,
  Pagination,
  message,
  Popconfirm,
  Spin,
  Modal,
  Tooltip,
  Divider,
  Select,
  TreeSelect
} from 'antd';
import { EyeOutlined} from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';
import {observable} from "mobx";
import {formItemLayout, houseAttribute} from '@src/config/commvar'; // 全局通用变量
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式;

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const { TreeNode } = TreeSelect;


@withRouter
@inject('root')
@observer
class NodeOptLog extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    root: P.any,
    powers: P.array, // 当前登录用户权限
    nodeMasterId: P.string // 外机节点
  };
  formRefAdd = React.createRef();
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
  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextState.someData !== this.state.someData;
  // }
  componentWillReceiveProps (nextProps) {
    // if (nextProps.data !== this.props.data) {
    //   this.setState({
    //     value: nextProps.data.parId
    //   });
    // }
  }

  /**
   * 节点出库记录
   */
  getLog (value) {
    this.setState({
      loading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/product/nodeserver/outboundrecord`, {
      params: {id: this.props.nodeMasterId}
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

  // 验证通过
  onFinish (values) {
  }


  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.formRefAdd.current.resetFields();
  };

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
    // this.setState({showModal: false});
    this.setState({
      modalShow: false,
    });
  };

  // 构建字段 机房
  makeColumns () {
    const columns = [
      {
        title: '节点位',
        dataIndex: 'node',
        key: 'node',
      },
      {
        title: '服务器IP',
        dataIndex: 'serverIp',
        key: 'serverIp'
      },
      {
        title: '服务器名称',
        dataIndex: 'serverName',
        key: 'serverName'
      },
      {
        title: '出库时间',
        dataIndex: 'serverName',
        key: 'serverName'
      },
      {
        title: '备注',
        dataIndex: 'remark ',
        key: 'remark '
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
          // destroyOnClose
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
            <div className="g-pagination">
              <Pagination size="small" current={page} total={total} showSizeChanger
                onChange={(current, size) => {this.onPageChange(current, size);}}
                onShowSizeChange={(current, size) => {this.onPageSizeChange(current, size);}}
              />
            </div>
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
export default NodeOptLog;


