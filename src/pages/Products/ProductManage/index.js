/* eslint-disable react/prop-types */
import React from "react";
import P, { string } from "prop-types";
import {
  Form,
  Button,
  Pagination,
  Input,
  Table,
  message,
  Popconfirm,
  Modal,
  Tooltip,
  Divider,
  Select,
  Tag,
  Cascader,
  Statistic
} from "antd";
import {
  EyeOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { inject, observer } from "mobx-react";
import "./index.less";
import tools from "@src/util/tools"; // 工具
import qs from "qs";
import _ from "lodash";
import http from "@src/util/http";
import {User} from "@src/util/user";
import {SYS_DICT_PRODUCT} from '@src/config/sysDict'; // 系统字典
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import Detail from './container/Detail';
import ResEdit from '../Creation/Resource/Edit';
import Preview from './container/Preview';
import Log from './container/Log';
import { parsePath } from "history";
import { length } from "file-loader";
const { Option } = Select;
const FormItem = Form.Item;
const { confirm } = Modal;
function setParams ({ query = "" }) {
  const searchParams = new URLSearchParams();
  searchParams.set("query", query);
  return searchParams.toString();
}

@inject("areaResouse")
@inject("authManage")
@inject("pageUserstore")
@inject("serverPartDict")
@observer
export default class RoleAdminContainer extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    userinfo: P.any,
    powers: P.array,
    areaResouse: P.any,
  };

  constructor (props) {
    super(props);
    this.searchFormRef = React.createRef();
    (this.searchCondition = {}), // 顶部搜索条件
    (this.state = {
      lists: [], // 当前页面列表数据
      loading: false, // 表格数据是否正在加载中
      modalShow: false, // 添加/修改/查看 模态框是否显示
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      nowData: {}, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      pageNum: 1, // 当前第几页
      page_size: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      pages: 0,
      statusNum: {
        "total": undefined,
        "pullOffShelves": undefined, // 下架
        "noAudit": undefined, // 待审核
        "spendingAudit": undefined, // 挂起
        "putOnHelves": undefined // 在售
      },
      version: 0, // 初始版本号
      lists2: [], // 业务类型数据
    });
  }
  componentDidMount () {
    this.props.areaResouse.fetchArea();
    this.onGetListData({ page: this.state.pageNum, size: this.state.page_size });
    this.onGetCategory();
    this.getStatusNum();
  }
  onGetListData (param = {}) {
    let params = _.assign({}, this.searchCondition, param);
    this.setState({ loading: true });
    http
      .get(`${BSS_ADMIN_URL}/api/goods/product-master`, {
        params: tools.clearEmpty(params),
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
  getStatusNum () {
    http
      .get(`${BSS_ADMIN_URL}/api/goods/product-master/queryCount`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            statusNum: res.data
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
  onGetCategory () {
    http.get(`${BSS_ADMIN_URL}/api/goods/category`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let lists = res.data;
          let lists2 = [];
          lists2 = tools.formatTree(lists);
          this.setState({
            lists2: lists2,
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
  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: "产品名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "所属业务",
        dataIndex: "categoryName",
        key: "categoryName",
      },
      {
        title: "销售区域",
        dataIndex: "areaName",
        key: "areaName",
      },
      {
        title: "基本价格",
        dataIndex: "minPrice",
        key: "minPrice",
        render: (text, record) => `${record.minPrice}~${record.maxPrice}`
      },
      {
        title: "低价",
        dataIndex: "prices",
        key: "prices",
      },
      {
        title: "运营成本",
        dataIndex: "operatingCosts",
        key: "operatingCosts",
      },
      {
        title: "毛利率",
        dataIndex: "grossProfit",
        key: "grossProfit",
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        render: (text, record) => SYS_DICT_PRODUCT.product_master_status[text]
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 500,
        render: (text, record) => {
          const controls = [];
          controls.push(
            <Detail id={record.id}>
              <Button
                key="0"
                size="small"
                className="actions-btn"
                style={{marginRight: '8px'}}
              >
              查看详情
              </Button>
            </Detail>
          );
          controls.push(
            <Button
              key="1"
              size="small"
              className="actions-btn"
              style={{marginRight: '8px'}}
              onClick={() => {this.showEdit(record.id);}}
            >
               编辑
            </Button>
          );
          controls.push(
            <Preview id={record.id}>
              <Button
                key="2"
                size="small"
                className="actions-btn"
                style={{marginRight: '8px'}}
              >
               预览
              </Button>
            </Preview>
          );
          (record.status === 0 || record.status === 3 || record.status === 4 || record.status === 6) &&
          controls.push(
            <Popconfirm placement="top" title="你确定要提交审核吗？" onConfirm={() => this.setStatus(record, 'audit')} okText="确定" cancelText="取消">
              <Button
                key="3"
                size="small"
                className="actions-btn"
                style={{marginRight: '8px'}}
              >
               审核
              </Button>
            </Popconfirm>
          );
          record.status === 2 &&
          controls.push(
            <Popconfirm placement="top" title="你确定要上架吗？" onConfirm={() => this.setStatus(record, 'putOnHelves')} okText="确定" cancelText="取消">
              <Button
                key="3"
                size="small"
                className="actions-btn"
                style={{marginRight: '8px'}}
              >
               上架
              </Button>
            </Popconfirm>
          );
          record.status === 5 &&
          controls.push(
            <Popconfirm placement="top" title="你确定要下架吗？" onConfirm={() => this.setStatus(record, 'pullOffShelves')} okText="确定" cancelText="取消">
              <Button
                key="3"
                size="small"
                className="actions-btn"
                style={{marginRight: '8px'}}
              >
               下架
              </Button>
            </Popconfirm>
          );
          // 有设置权限的才有这个按钮
          record.status === 5 &&
          controls.push(
            <Popconfirm placement="top" title="你确定要设置该产品为主产品吗？" onConfirm={() => this.setStatus(record, 'default')} okText="确定" cancelText="取消">
              <Button
                key="3"
                size="small"
                className="actions-btn"
                style={{marginRight: '8px'}}>
               设置主产品
              </Button>
            </Popconfirm>
          );
          // record.status === 1 &&
          // controls.push(
          //   <Popconfirm placement="top" title='你确定要审核未通过吗？' onConfirm={()=>this.confirm3(record)} okText="确定" cancelText="取消">
          //   <Button
          //       key="3"
          //       size="small"
          //       className="actions-btn"
          //       style={{marginRight: '8px'}}
          //     >
          //      未通过
          //     </Button>
          //    </Popconfirm>
          // );
          // record.status === 1 &&
          // controls.push(
          //   <Popconfirm placement="top" title='你确定要审核通过吗？' onConfirm={()=>this.confirm3(record)} okText="确定" cancelText="取消">
          //   <Button
          //       key="3"
          //       size="small"
          //       className="actions-btn"
          //       style={{marginRight: '8px'}}
          //     >
          //      通过
          //     </Button>
          //    </Popconfirm>
          // );
          // record.status === 1 &&
          // controls.push(
          //   <Popconfirm placement="top" title='你确定要挂起吗？' onConfirm={()=>this.confirm3(record)} okText="确定" cancelText="取消">
          //   <Button
          //       key="3"
          //       size="small"
          //       className="actions-btn"
          //       style={{marginRight: '8px'}}
          //     >
          //      挂起
          //     </Button>
          //    </Popconfirm>
          // );
          controls.push(
            <Log id={record.id}>
              <Button
                key="4"
                size="small"
                className="actions-btn"
                style={{marginRight: '8px'}}
              >
               查看日志
              </Button>
            </Log>
          );
          const result = [];
          controls.forEach((item, index) => {
            if (index) {
              result.push(<Divider key={`line${index}`} type="vertical" />);
            }
            result.push(item);
          });
          return controls;
        },
      },
    ];
    return columns;
  }

  /**
   * 0: "待审核",
    1: "审核中",
    2: "审核完成",
    3: "审核挂起",
    4: "审核未通过",
    5: "上架",
    6: "下架",
   * @param {*} record 当前数据
   * @param {*} part_url 修改状态url的一部分：
   * audit:审核 | putOnHelves： 上架 |pullOffShelves 下架
   * 修改审核状态 和设置主产品
   */
  setStatus = (record, part_url) => {
    let url = `${BSS_ADMIN_URL}/api/goods/product-master/${part_url}`;
    this.setState({loading: true});
    http.post(url, {
      id: record.id,
      version: record.version,
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          tools.auto_close_result('ok', '操作成功');
          this.onGetListData({ page: this.state.pageNum, size: this.state.page_size });
          this.getStatusNum();
        } else {
          tools.dealFail(res);
        }
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }
  confirm3 = (record) => {
    message.success('操作成功');
  }

  // 编辑页面
  showEdit = (id) => {
    this.setState({ loading: true });
    http.get(`${BSS_ADMIN_URL}/api/goods/product-master/${id}`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            nowData: res.data,
            modalShow: true,
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

  onClose = () => {
    this.setState({
      modalShow: false
    });
  }

  /**
   * 搜索
   * @param {obj} values 搜索条件
   */
  onSearch (values) {
    if (values.categoryId) {
      values.categoryId = values.categoryId[values.categoryId.length - 1];
    }
    this.searchCondition = values;
    this.onGetListData({ page: this.state.pageNum, size: this.state.page_size });
  }

  /**
   * 重置搜索条件
   */
  onReset = () => {
    this.searchFormRef.current.resetFields();
  };

  // 表单页码改变
  onPageChange (page, pageSize) {
    this.onGetListData({ page: page, size: pageSize },);
  }

  // 表单页码长度改变
  onPageSizeChange (page, pageSize) {
    this.onGetListData({ page: page, size: pageSize },);
  }
  showTotal = (total) => `一共${total}条数据`;
  render () {
    const {
      loading,
      lists,
      pageNum,
      page_size,
      total,
      statusNum,
      lists2,
      modalShow,
      nowData
    } = this.state;
    const {rootAreaList } = this.props.areaResouse;
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
            <FormItem name="categoryId">
              <Cascader options={lists2}  placeholder="请选择所属业务类型" fieldNames={{ label: 'name', value: 'id', children: 'children' }} style={{width: 300}} />
            </FormItem>
            <Form.Item name="salesRegionIds">
              <Select
                allowClear placeholder="选择销售区域"
                style={{width: 300}}
                showSearch
                filterOption={tools.filterOption}>
                {rootAreaList.map((item) => (
                  <Option value={item.id} key={item.id}>
                    {item.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="status">
              <Select
                style={{ width: 240 }}
                allowClear
                placeholder="请选择状态">
                {
                  _.map(SYS_DICT_PRODUCT.product_master_status, (value, key) =>
                    <Option value={parseInt(key)} key={key}>{value}</Option>
                  )
                }
              </Select>
            </Form.Item>
            <Form.Item name="name">
              <Input
                placeholder="请输入产品名称"
                allowClear
              />
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
        {/* 数据展示 */}
        <div className="statistical">
          <p>产品总数：<Tag color="#2db7f5">{statusNum.total}</Tag></p>
          <p>待审核：<Tag color="#108ee9">{statusNum.noAudit}</Tag></p>
          <p>在售：<Tag color="#87d068">{statusNum.putOnHelves}</Tag></p>
          <p>挂起：<Tag color="#108ee9">{statusNum.spendingAudit}</Tag></p>
          <p>下架：<Tag color="#f50">{statusNum.pullOffShelves}</Tag></p>
        </div>
        <div className="g-table" >
          <Table
            scroll={{x: 1900}}
            columns={this.makeColumns()}
            rowKey={(record) => record.id}
            loading={loading}
            dataSource={lists}
            pagination={false}
            size="small"
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
            showTotal={this.showTotal}
            defaultPageSize={page_size}
            onChange={(current, pageSize) => {
              this.onPageChange(current, pageSize);
            }}
            onShowSizeChange={(current, size) => {
              this.onPageSizeChange(current, size);
            }}
          />
        </div>
        <Modal
          title="编辑"
          maskClosable={false}
          width="50%"
          destroyOnClose
          footer={null}
          onCancel={this.onClose}
          visible={modalShow}
        >
          <ResEdit defaultValue={nowData}></ResEdit>
        </Modal>
      </main>
    );
  }
}
