/** User 系统管理/角色管理 **/

// ==================
// 所需的各种插件
// ==================

import React from "react";
import P from "prop-types";
import {
  Form,
  Button,
  Pagination,
  Input,
  Table,
  Modal,
  Divider,
  Select,
} from "antd";
import { inject, observer } from "mobx-react";
import tools from "@src/util/tools"; // 工具
import regExpConfig from "@src/config/regExp"; // 正则表达式
import _ from "lodash";
import http from "@src/util/http";
// ==================
// 所需的所有组件
import BlackLog from './container/BlackLog';
import Manage from './container/Manage';
import {User} from '@src/util/user.js';
const { Option } = Select;

function setParams ({ query = "" }) {
  const searchParams = new URLSearchParams();
  searchParams.set("query", query);
  return searchParams.toString();
}

@inject("root")
@inject("serverPartDict")
@inject("ipresourceDict")
@inject('areaResouse')
@observer
export default class RoleAdminContainer extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    userinfo: P.any,
    powers: P.array,
    areaResouse: P.any, // 区域字典
    ipresourceDict: P.any, // ip资源字典
    match: P.any,
    root: P.any, // 全局资源
    serverPartDict: P.any, // 服务器字典
  };

  /**
   * 查询条件分三类
   * filter：表格上方的查询条件
   * page:分页及页码
   * sort:排序
   * 附加条件：例如机构号
   */
  constructor (props) {
    super(props);
    console.log(props);
    this.searchFormRef = React.createRef();
    (this.searchCondition = {}), // 顶部搜索条件
    (this.state = {
      lists: [], // 当前页面列表数据
      loading: false, // 表格数据是否正在加载中
      pageNum: 1, // 当前第几页
      page_size: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      selectedRowKeys: [], // 选中的key
      manageShow: false, // 处理的弹窗
      selectedRows: [], // 当前的行数据
    });
  }
  componentDidMount () {
    this.onGetListData(this.state.pageNum, this.state.page_size);
    this.props.ipresourceDict.fetchresStatus();
    this.props.ipresourceDict.fetchspecialStatus();
    this.props.areaResouse.fetchVarea();
  }

  // 更新url触发
  updateURL = () => {
    const url = setParams({ query: this.state.inputValue });
    this.props.history.push(`?${url}`);
  };

  // 获取所有的权限

  /**
   *修改当前机构
   * @param {string} key 机构id
   * @param {treenode} node
   */
  componentWillReceiveProps () {}

  /**
   * 查询当前页面所需列表数据
   * @param {number} pageNum
   * @param {number} pageSize
   */
  onGetListData (param = {}) {
    let params = _.assign({}, this.searchCondition, param);
    this.setState({ loading: true });
    http
      .get(`${BSS_ADMIN_URL}/api/product/ipBlackList`, {
        params: tools.clearNull(params),
      })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let lists = res.data.records;
          this.setState({
            lists: lists,
            total: res.data.total,
            pages: res.data.pages,
            pageNum: res.data.current,
            selectedRows: [],
            selectedRowKeys: [],
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
  showDeleteConfirm = () => {
    let selectedRowKeys = this.state.selectedRowKeys;
    let len = selectedRowKeys.length;
    if (len < 1) {
      Modal.warning({
        title: "提示",
        content: "请选择至少一条数据！",
        destroyOnClose: true,
      });
      return false;
    }
    this.setState({
      manageShow: true
    });
  };
  onSelectChange = (selectedRowKeys, selectedRows) => {

    this.setState({ selectedRowKeys, selectedRows });
    let str = '';
    selectedRows.forEach((item) => {
      str += `${item.ipAddr}、`;
    });
    this.obj = {ipAddr: str};
  };
  // 构建字段
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
        render: (text, record) => tools.getTime(text),
      },
      {
        title: "资源状态",
        dataIndex: "resStatus",
        key: "resStatus",
        render: (text, record) => this.props.ipresourceDict.resStatus[text]
      },
      {
        title: "ip特殊状态",
        dataIndex: "specialStatus",
        key: "specialStatus",
        render: (text, record) => this.props.ipresourceDict.specialStatus[text]
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
      {
        title: "备注",
        dataIndex: "remark",
        key: "remark",
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        render: (text, record) => {
          const controls = [];
          let {resStatus, specialStatus} = this.props.ipresourceDict;
          const data = this.props.areaResouse.vareaList;
          User.hasPermission('ipBlackLog-view') &&
          controls.push(
            <BlackLog record={record} resStatus={resStatus} specialStatus={specialStatus} data={data}>
              <Button
                key="0"
                size="small"
                className="actions-btn"
              >
               黑名单日志
              </Button>
            </BlackLog>
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

  /**
   * 搜索
   * @param {obj} values 搜索条件
   */
  onSearch (values) {
    this.searchCondition = values;
    console.log(values);
    this.onGetListData(values);
  }

  /**
   * 重置搜索条件
   */
  onReset = () => {
    console.log("onrest");
    this.searchFormRef.current.resetFields();
  };

  // 表单页码改变
  onPageChange (page, pageSize) {
    this.onGetListData({ page: page, pageSize: pageSize });
  }

  // 表单页码长度改变
  onPageSizeChange (page, pageSize) {
    this.onGetListData({ page: page, pageSize: pageSize });
  }
  handleCancel=() => {
    this.setState({
      manageShow: false
    });
  }
  handleOk=(values) => {
    let id = this.state.selectedRowKeys;
    values.id = id.join(',');
    console.log(values);
    values.ipAddr = '';
    this.setState({loading: true});
    http
      .put(`${BSS_ADMIN_URL}/api/product/ipBlackList/disposeBlack`,
        values,
      )
      .then((res) => {
        res = res.data;
        console.log(res);
        if (res.code === 20000) {
          this.onGetListData({ page: 1 });
          tools.auto_close_result('ok', '操作成功');
          this.setState({
            manageShow: false
          });
        } else {
          tools.dealFail(res);
          this.setState({ loading: false });
          this.setState({
            manageShow: false
          });
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }
  render () {
    const p = this.props.root.powers;
    const {
      loading,
      lists,
      pageNum,
      page_size,
      total,
      selectedRowKeys,
      selectedRows
    } = this.state;
    let {resStatus, specialStatus} = this.props.ipresourceDict;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    console.log(selectedRows);

    return (
      <main className="mian">
        {/* 搜索 */}
        <div className="c-search">
          <Form
            ref={this.searchFormRef}
            name="horizontal_login"
            layout="inline"
            onFinish={(values) => {
              this.onSearch(values);
            }}
          >
            <Form.Item name="ipAddr"
            // rules={[
            //   { whiteSpace: true, message: "不能输入空格" },
            //   { pattern: regExpConfig.isNumAlphaUline, message: "请输入正确ip查询" },
            // ]}
            >
              <Input placeholder="请输入IP名称" allowClear />
            </Form.Item>
            <Form.Item name="resStatus">
              <Select
                style={{ width: 240 }}
                allowClear
                placeholder="请选择资源状态"
              >
                {_.map(resStatus, (value, key) => (
                  <Option value={key} key={key}>
                    {value}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="specialStatus">
              <Select
                style={{ width: 240 }}
                allowClear
                placeholder="请选择特殊状态"
              >
                {_.map(specialStatus, (value, key) => (
                  <Option value={key} key={key} style={key === '0' || key === '9' ? {display: 'none'} : {display: 'block'}}>
                    {value}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item shouldUpdate>
              <Button type="primary" htmlType="submit">
                搜索
              </Button>
            </Form.Item>
            <Form.Item shouldUpdate>
              <Button type="primary" htmlType="reset" onClick={this.onReset}>
                重置
              </Button>
            </Form.Item>
          </Form>
        </div>
        {/* 操作 */}
        <div className="c-operate">
          {User.hasPermission('ipBlackList-dispose') && <Button size="middle" onClick={this.showDeleteConfirm}  className="actions-btn">
            批量处理
          </Button>}
        </div>
        <div className="g-table">
          <Table
            columns={this.makeColumns()}
            rowKey={(record) => record.id}
            loading={loading}
            dataSource={lists}
            pagination={false}
            size="small"
            rowSelection={rowSelection}
          />
        </div>
        <div className="pagination">
          <Pagination
            className="g-pagination"
            size="middle"
            current={pageNum}
            total={total}
            showSizeChanger
            showQuickJumper
            defaultPageSize={page_size}
            showTotal={(total) => `一共${total}条数据`}
            onChange={(current, pageSize) => {
              this.onPageChange(current, pageSize);
            }}
            onShowSizeChange={(current, size) => {
              this.onPageSizeChange(current, size);
            }}
          />
        </div>
        <Manage
          visible={this.state.manageShow}
          text={"黑名单处理"}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          specialStatus={specialStatus}
          obj={this.obj}
        />
      </main>
    );
  }
}
