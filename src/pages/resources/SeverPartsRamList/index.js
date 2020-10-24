/* eslint-disable react/prop-types */
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
  message,
  Popconfirm,
  Modal,
  Tooltip,
  Divider,
  Select,
  Tag
} from "antd";
import {
  EyeOutlined,
  FormOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { inject, observer } from "mobx-react";
import "./index.less";
import tools from "@src/util/tools"; // 工具
import qs from "qs";
import _ from "lodash";
import http from "@src/util/http";
// ==================
// 所需的所有组件
// ==================

import Add from "./container/add";
import Template from "./container/template";
import moment from "moment";
import {User} from "@src/util/user";
import {SYS_DICT_SERVERPART} from '@src/config/sysDict'; // 系统字典
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
const { Option } = Select;
const FormItem = Form.Item;
const { confirm } = Modal;
function setParams ({ query = "" }) {
  const searchParams = new URLSearchParams();
  searchParams.set("query", query);
  return searchParams.toString();
}

@inject("root")
@inject("serverPartDict")
@inject("authManage")
@inject("pageUserstore")
@inject("areaResouse")
@observer
export default class RoleAdminContainer extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    userinfo: P.any,
    powers: P.array,
    // form: P.any
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
    this.searchFormRef = React.createRef();
    (this.searchCondition = {}), // 顶部搜索条件
    (this.selectedRows = []),
    (this.state = {
      lists: [], // 当前页面列表数据
      operateType: "add", // 操作类型 add新增，up修改, see查看
      loading: false, // 表格数据是否正在加载中
      modalShow: false, // 添加/修改/查看 模态框是否显示
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      nowData: {}, // 当前选中用户的信息，用于查看详情、修改、分配菜单
      pageNum: 1, // 当前第几页
      page_size: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      nowData2: {}, // 模板入库显示的的数据
      selectedRowKeys: [], // 选中的行
      TemplateShow: false, // 模板显示
      id: "", // 模板入库初始内存型号id
      editId: "", // 修改初始内存型号id
      version: 0, // 列表初始版本
      lists4: [], // 容量
    });
  }
  componentDidMount () {
    this.onGetListData(this.state.pageNum, this.state.page_size);
    this.props.areaResouse.fetchHouse();
    this.onGetSize();
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

  /**
   * 查询当前页面所需列表数据
   * @param {number} pageNum
   * @param {number} pageSize
   */
  onGetListData (param = {}) {
    let params = _.assign({}, this.searchCondition, param);
    this.setState({ loading: true });
    http
      .get(`${BSS_ADMIN_URL}/api/product/memorydetail`, {
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
            loading: false,
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
   // 获取容量
   onGetSize () {
    http
      .get(`${BSS_ADMIN_URL}/api/product/memorymodel/memorysize`)
      .then((res) => {
        res = res.data;
        // console.log(res);
        if (res.code === 20000) {
          this.setState({
            lists4: res.data,
          });
        } else {
          tools.dealFail(res);
        }
      })
      .catch(() => {
      });
  }
  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: "内存编号",
        dataIndex: "memCode",
        key: "memCode",
      },
      {
        title: "内存型号名称",
        dataIndex: "memName",
        key: "memName",
        render: (text, record) =>
          (record.memorymodelList[0] && record.memorymodelList[0].memName) ||
          "",
      },
      {
        title: "内存容量(GB)",
        dataIndex: "memSize",
        key: "memSize",
        render: (text, record) => <Tag color="#2db7f5">{(record.memorymodelList[0] && record.memorymodelList[0].memSize) ||
        ""}</Tag>
        ,
      },

      {
        title: "内存类型",
        dataIndex: "memType",
        key: "memType",
        render: (text, record) => {
          let memType =
            (record.memorymodelList[0] && record.memorymodelList[0].memType) ||
            "";
          return SYS_DICT_SERVERPART.memory_type[memType];
        },
      },
      {
        title: "存放机房",
        dataIndex: "houseName",
        key: "houseName",
        render: (text, record) => {
          let id = record.houseId;
          let house = this.props.areaResouse.houseList;
          let name = '';
          house.forEach((item) => {
            if (item.id === id) {
              name = item.fullName;
            }
          });
          return name;
        }
      },
      {
        title: "采购时间",
        dataIndex: "purchasingTime",
        key: "purchasingTime",
        render: (text, record) => tools.getTime(text),
      },
      {
        title: "入库时间",
        dataIndex: "storageTime",
        key: "storageTime",
        render: (text, record) => tools.getTime(text),
      },
      {
        title: "资源归属",
        dataIndex: "resourceAttribution",
        key: "resourceAttribution",
        render: (text, record) => SYS_DICT_SERVERPART.resource_attribution[text],
      },
      {
        title: "归属方",
        dataIndex: "customerName",
        key: "customerName",
      },
      {
        title: "显示类型",
        dataIndex: "showType",
        key: "showType",
        render: (text, record) => SYS_DICT_SERVERPART.show_type[text],
      },
      {
        title: "发布状态",
        dataIndex: "releaseStatus",
        key: "releaseStatus",
        render: (text, record) => SYS_DICT_SERVERPART.releaseStatus[text],
      },
      {
        title: "资源状态",
        dataIndex: "saleStatus",
        key: "saleStatus",
        render: (text, record) => tools.renderStatus(SYS_DICT_SERVERPART.parts_res_status, text)
      },
      {
        title: "使用服务器",
        dataIndex: "serverManagerIp",
        key: "serverManagerIp",
      },
      {
        title: "来源",
        dataIndex: "source",
        key: "source",
        render: (text, record) => SYS_DICT_SERVERPART.source[text],
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
        width: 100,
        render: (text, record) => {
          const controls = [];
          const u = User.getPermission() || [];
          u.includes('memorydetail-view') &&
          controls.push(
            <span
              key="0"
              className="control-btn green"
              onClick={() => this.onModalShow("see", record)}
            >
              <Tooltip placement="top" title="查看">
                <EyeOutlined></EyeOutlined>
              </Tooltip>
            </span>
          );
          u.includes('memorydetail-edit') &&
          controls.push(
            <span
              key="1"
              className="control-btn blue"
              onClick={() => this.onModalShow("up", record)}
            >
              <Tooltip placement="top" title="修改">
                <FormOutlined></FormOutlined>
              </Tooltip>
            </span>
          );
          u.includes('memorydetail-del') &&
          controls.push(
            <Popconfirm
              key="2"
              title="确定删除吗?"
              onConfirm={() => this.onDel(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <span className="control-btn red">
                <Tooltip placement="top" title="删除">
                  <DeleteOutlined></DeleteOutlined>
                </Tooltip>
              </span>
            </Popconfirm>
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
    this.onGetListData(values);
  }

  /**
   * 重置搜索条件
   */
  onReset = () => {
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

  /**
   * 添加/修改/查看 模态框出现
   * @data: 当前选中的那条数据
   * @type: add添加/up修改/see查看
   * **/
  onModalShow (type, data) {
    this.props.pageUserstore.changeShowmodal("on");

    if (type === "add") {
      this.setState({
        modalShow: true,
        operateType: type,
        nowData: {
          saleStatus: 0,
          source: 1,
          resourceAttribution: 1,
        },
      });
      return;
    }
    this.setState({
      modalShow: true,
      nowData: {
        id: data.id || "",
        memCode: data.memCode,
        memModelId: (data && data.memorymodelList[0] && data.memorymodelList[0].memName),
        memSize: (data && data.memorymodelList[0] && data.memorymodelList[0].memSize),
        memType: (data && data.memorymodelList[0] && data.memorymodelList[0].memType),
        houseName: data.houseName,
        houseId: data.houseId,
        purchasingTime: moment(data.purchasingTime),
        storageTime: data.storageTime,
        resourceAttribution: data.resourceAttribution,
        customerName: data.customerName,
        showType: data.showType,
        releaseStatus: data.releaseStatus,
        saleStatus: data.saleStatus,
        serverManagerIp: data.serverManagerIp,
        remark: data.remark,
        houseLocationCode: data.houseLocationCode,
        source: data.source,
      },
      operateType: type,
      editId: data.memModelId,
      version: data && data.version,
    });
  }

  // 删除某一条数据
  onDel (id) {
    let param = {};
    if (typeof id == "string") {
      let ids = [];
      ids.push(id);
      param = {
        id: ids,
      };
    } else {
      param = {
        id: id,
      };
    }
    let params = JSON.stringify(param);
    http
      .delete(`${BSS_ADMIN_URL}/api/product/memorydetail/delete`, {
        data: params,
      })
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.onGetListData({ page: 1 });
          message.success("出库成功");
        } else {
          tools.dealFail(res);
          this.setState({ loading: false });
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  onModalOk = (val) => {
    val.memSize = parseInt(val.memSize);
    http
      .post(`${BSS_ADMIN_URL}/api/product/memorydetail/add`, tools.clearEmpty(val))
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.onClose();
          this.onGetListData({ page: 1 });
          message.success("添加成功");
        } else {
          tools.dealFail(res);
        }
      })
      .catch(() => {
        this.setState({
          modalLoading: false,
        });
      });
  };
  edit = (id, val) => {
    val.memSize = parseInt(val.memSize);
    val.version = this.state.version;
    val.memName = '';
    http
      .put(`${BSS_ADMIN_URL}/api/product/memorydetail/${id}/update`, tools.clearNull(val))
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.onClose();
          this.onGetListData({ page: 1 });
          message.success("修改成功");
        } else {
          tools.dealFail(res);
        }
      })
      .catch(() => {
        this.setState({
          modalLoading: false,
        });
      });
  };
  onClose = () => {
    this.props.pageUserstore.changeShowmodal("off");
  };
  onModalClose = () => {
    this.props.pageUserstore.changeShowmodal("off");
  };
  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.selectedRows = selectedRows;
    this.setState({
      nowData2: {
        houseId: (this.selectedRows[0] && this.selectedRows[0].houseId),
        memModelId:
          (this.selectedRows[0] &&
            this.selectedRows[0].memorymodelList[0].memName),
        memSize:
          (this.selectedRows[0] &&
            this.selectedRows[0].memorymodelList[0].memSize),
        resourceAttribution:
          (this.selectedRows[0] && this.selectedRows[0].resourceAttribution),
        customerName:
          (this.selectedRows[0] && this.selectedRows[0].customerName),
        customerId:
          (this.selectedRows[0] && this.selectedRows[0].customerId),
        showType: (this.selectedRows[0] && this.selectedRows[0].showType),
        purchasingTime:
          (this.selectedRows[0] && moment(this.selectedRows[0].purchasingTime)),
        source: 1,
        saleStatus: 0,
      },
      id: this.selectedRows[0] && this.selectedRows[0].memModelId,
    });
    this.setState({ selectedRowKeys });
  };
  showDeleteConfirm = () => {
    let selectedRowKeys = this.state.selectedRowKeys;
    let _that = this;
    let len = selectedRowKeys.length;
    if (len < 1) {
      Modal.warning({
        title: "提示",
        content: "请选择至少一条数据！",
        destroyOnClose: true,
      });
      return false;
    }
    confirm({
      title: "你确定要批量出库吗？",
      icon: <ExclamationCircleOutlined />,
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk () {
        _that.onDel(selectedRowKeys);
        _that.setState({
          selectedRowKeys: [],
        });
      },
      onCancel () {
      },
    });
  };
  onTemplateShow = () => {
    let len = this.state.selectedRowKeys.length;
    switch (len) {
    case 0:
      Modal.warning({
        title: "提示",
        content: "请选择一条数据作为模板！",
        destroyOnClose: true,
      });
      break;
    case 1:
      this.setState({
        TemplateShow: true,
      });
      break;
    default:
      Modal.warning({
        title: "提示",
        content: "只能一次选择一条数据作为模板！",
        destroyOnClose: true,
      });
    }
  };
  handleOk = (val) => {
    val.memSize = parseInt(val.memSize);
    http
      .post(`${BSS_ADMIN_URL}/api/product/memorydetail/add`, val)
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.handleCancel();
          this.onGetListData({ page: 1 });
          message.success("添加成功");
        } else {
          message.error(res.data);
        }
      })
      .catch(() => {
        this.handleCancel();
      });
  };
  handleCancel = () => {
    this.setState({
      TemplateShow: false,
    });
  };
  render () {
    const p = this.props.root.powers;
    const {
      loading,
      operateType,
      lists,
      pageNum,
      page_size,
      modalShow,
      nowData,
      total,
      selectedRowKeys,
      TemplateShow,
      nowData2,
      lists4
    } = this.state;
    let house = this.props.areaResouse.houseList;

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    const u1 = User.getPermission() || [];
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
            <Form.Item name="memName" >
              <Input allowClear placeholder="请输入内存名称" />
            </Form.Item>
            <Form.Item name="memSize">
            <Select
                style={{ width: 240 }}
                allowClear
                placeholder="请选择内存容量"
              >
                {
                  lists4.map((item) => <Option key={item}>{item}</Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item name="houseId">
              <Select
                style={{ width: 240 }}
                allowClear
                placeholder="请选择机房"
              >
                {house.map((item) => (
                  <Option value={item.id} key={item.id}>
                    {item.fullName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="resourceAttribution">
              <Select
                style={{ width: 140 }}
                allowClear
                placeholder="请选择资源归属"
              >
                {_.map(SYS_DICT_SERVERPART.resource_attribution, (value, key) => (
                  <Option key={key} value={parseInt(key)}>
                    {value}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="customerName">
              <Input allowClear placeholder="请输入资源归属方名称"></Input>
            </Form.Item>
            <Form.Item name="saleStatus">
              <Select
                style={{ width: 140 }}
                allowClear
                placeholder="请选择资源状态"
              >
                {_.map(SYS_DICT_SERVERPART.parts_res_status, (value, key) => (
                  <Option key={key} value={parseInt(key)}>
                    {value.text}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            {/* <Form.Item name="showType">
              <Select
                style={{ width: 140 }}
                allowClear
                placeholder="请选择显示类型"
              >
                {_.map(SYS_DICT_SERVERPART.show_type, (value, key) => (
                  <Option key={key} value={parseInt(key)}>
                    {value}
                  </Option>
                ))}
              </Select>
            </Form.Item> */}
            <Form.Item shouldUpdate>
              <Button type="primary" htmlType="submit" className="actions-btn">
                搜索
              </Button>
            </Form.Item>
            <Form.Item shouldUpdate>
              <Button type="primary" htmlType="reset" onClick={this.onReset} className="actions-btn">
                重置
              </Button>
            </Form.Item>
          </Form>
        </div>
        {/* 操作 */}
        <div className="c-operate">
          {u1.includes('memorydetail-add') && <Button
            size="middle"
            className="actions-btn"
            onClick={() => {
              this.onModalShow("add", {});
            }}
          >
            入库
          </Button>}
          {u1.includes('memorydetail-add') && <Button
            size="middle"
            onClick={this.onTemplateShow}
            className="actions-btn"
          >
            模板入库
          </Button>}
          {u1.includes('memorydetail-del') && <Button size="middle" onClick={this.showDeleteConfirm}  className="actions-btn">
            批量出库
          </Button>}
        </div>
        {/* 数据展示*/}
        <div className="g-table">
          <Table
            columns={this.makeColumns()}
            rowKey={(record) => record.id}
            loading={loading}
            dataSource={lists}
            pagination={false}
            rowSelection={rowSelection}
            scroll={{ x: 1000 }}
            size="small"
          />
        </div>
        <div className="pagination">
          <Pagination
            size="middle"
            className="g-pagination"
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

        {/* 新增&修改&查看 模态框 */}
        <Add
          operateType={operateType}
          nowData={nowData}
          visible={modalShow}
          updateLists={this.onGetListData}
          onOk={this.onModalOk}
          edit={this.edit}
          onClose={this.onModalClose}
          releaseStatus={SYS_DICT_SERVERPART.releaseStatus}
          source={SYS_DICT_SERVERPART.source}
          house={house}
          resource_attribution={SYS_DICT_SERVERPART.resource_attribution}
          show_type={SYS_DICT_SERVERPART.show_type}
          mem_spec={SYS_DICT_SERVERPART.mem_spec}
          memory_type={SYS_DICT_SERVERPART.memory_type}
          memModelId={this.state.editId}
          sale_status={SYS_DICT_SERVERPART.parts_res_status}
        />
        <Template
          visible={TemplateShow}
          text={"模板入库"}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          releaseStatus={SYS_DICT_SERVERPART.releaseStatus}
          source={SYS_DICT_SERVERPART.source}
          house={house}
          selectedRows={nowData2}
          resource_attribution={SYS_DICT_SERVERPART.resource_attribution}
          show_type={SYS_DICT_SERVERPART.show_type}
          mem_spec={SYS_DICT_SERVERPART.mem_spec}
          memory_type={SYS_DICT_SERVERPART.memory_type}
          memModelId={this.state.id}
          sale_status={SYS_DICT_SERVERPART.parts_res_status}
        />
      </main>
    );
  }
}
