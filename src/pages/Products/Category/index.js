/* eslint-disable react/prop-types */

import React from "react";
import P from "prop-types";
import {
  Form,
  Button,
  Pagination,
  Input,
  Table,
  Modal,
  Select,
  Tree,
  Tooltip,
  Popconfirm,
  Divider,
  message,
  Switch,
  Tag
} from "antd";
import {
  DownOutlined,
  FormOutlined,
  DeleteOutlined,
  CaretDownOutlined,
} from "@ant-design/icons";
import { inject, observer } from "mobx-react";
import "./index.less";
import tools from "@src/util/tools"; // 工具
import qs from "qs";
import _ from "lodash";
import http from "@src/util/http";
import Add from "./container/Add";
import Edit from "./container/Edit";
import {SYS_DICT_PRODUCT} from '@src/config/sysDict'; // 系统字典
const { Option } = Select;
const FormItem = Form.Item;
const { confirm } = Modal;
const { TreeNode } = Tree;
function setParams ({ query = "" }) {
  const searchParams = new URLSearchParams();
  searchParams.set("query", query);
  return searchParams.toString();
}
@observer
export default class CategoryManage extends React.Component {
  static propTypes = {
    location: P.any, // 当前位置
    history: P.any,
    userinfo: P.any, // 用户信息
    powers: P.array, // 用户权限
    authManage: P.any,
    match: P.any, // 路径
    pageUserstore: P.any,
    root: P.any, // 全局资源
    serverPartDict: P.any, // 服务器字典
    serverDict: P.any
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
    (this.state = {
      lists: [], // 当前页面列表数据
      loading: false, // 表格数据是否正在加载中
      pageNum: 1, // 当前第几页
      page_size: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      addShow: false, // 新增类目模态框
      lists2: [],
    });
  }
  componentDidMount () {
    // this.getData(['0-0']);
    this.onGetListData();
    this.onGetListData2('0012095310f347109eacc980cd1ce500');
  }

  // 更新url触发
  updateURL = () => {
    const url = setParams({ query: this.state.inputValue });
    this.props.history.push(`?${url}`);
  };


  componentWillReceiveProps () {}

  /**
   * 查询当前页面所需列表数据
   * @param {number} pageNum
   * @param {number} pageSize
   */
  onGetListData (param = {}) {
    this.setState({loading: true});
    http
      .get(`${BSS_ADMIN_URL}/api/goods/category`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let lists = res.data;
          let lists2 = [];
          lists2 = tools.formatTree(lists);
          this.setState({
            lists: lists2,
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
  onGetListData2 (selectedKeys) {
    this.setState({loading: true});
    http
      .get(`${BSS_ADMIN_URL}/api/goods/category/${selectedKeys}/get`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let lists = res.data;
          // console.log(lists);
          this.level = lists[0].level;
          this.productQuantity = lists[0].productQuantity;
          this.lowerCategoryNum = lists[0].lowerCategoryNum;
          this.status = lists[0].status;
          this.resourceConfigs = lists[0].resourceConfigs;
          //console.log(this.status);
          this.setState({
            lists2: lists,
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
        title: "类目名",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "前台展示名",
        dataIndex: "showName",
        key: "showName",
        render: (text, record) => <Tag color="#2db7f5">{record && record.showName}</Tag>
      },
    
      {
        title: "操作",
        key: "control",
        render: (text, record) => {
          const controls = [];
          controls.push(
            <Edit record={record} updatalists={() => this.updatalists(this.selectedKeys)}>
              <span
                key="1"
                className="control-btn blue"
              >
                <Tooltip placement="top" title="修改">
                  <FormOutlined style={{ color: "#1890ff" }}></FormOutlined>
                </Tooltip>
              </span>
            </Edit>
          );
          (this.level >= 3 && this.productQuantity === 0) &&
          controls.push(
            <Popconfirm
              key="4"
              title="确定删除吗?"
              onConfirm={() => this.onDel(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <span className="control-btn red">
                <Tooltip placement="top" title="删除">
                  <DeleteOutlined style={{ color: "red" }}></DeleteOutlined>
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
        }
      },
    ];
    // console.log(this.resourceConfigs);
    if(this.resourceConfigs&&this.resourceConfigs.length>0){
      columns.unshift({
        title: "最小资源配置",
        dataIndex: "resourceConfigs",
        key: "resourceConfigs",
        render: (text, record) => 
          text&&text.map((item)=>
            <span key={item.id}>{item.configName}</span>
          )
      });
    }
    if(this.status===0||this.status ===1){
      columns.push({
        title: "状态",
        dataIndex: "status",
        key: "status",
        render: (text, record) =>
          text === 1 ? (
            <Switch
              defaultChecked
              size="small"
              onChange={() => this.changeStatus(text, record)}
            />
          ) : (
            <Switch
              size="small"
              onChange={() => this.changeStatus(text, record)}
            />
          ),

      });
    }
    if(this.lowerCategoryNum>0){
      columns.unshift({
        title: "下级类目数",
        dataIndex: "lowerCategoryNum",
        key: "lowerCategoryNum",
        render: (text, record) => <Tag color="#87d068">{record && record.lowerCategoryNum}</Tag>
      });
    }
    if (this.level === 2) {
      columns.unshift({
        title: "上级类目名",
        dataIndex: "superiorName",
        key: "superiorName",
      });
    }
    if (this.level >= 3) {
      columns.unshift({
        title: "产品数",
        dataIndex: "productQuantity",
        key: "productQuantity",
        render: (text, record) => <Tag color="#87d068">{record && record.productQuantity}</Tag>
      });
      columns.unshift({
        title: "管理的产品类型",
        dataIndex: "type",
        key: "type",
        render: (text, record) => SYS_DICT_PRODUCT.product_category_type[text]
      });
      columns.unshift({
        title: "上级类目名",
        dataIndex: "superiorName",
        key: "superiorName",
      });
    }
    return columns;
  }
  onSelect = (selectedKeys, info) => {
    this.selectedKeys = selectedKeys;
    if(selectedKeys.length===0){
      return
    }
    this.onGetListData2(this.selectedKeys);
  };
  onAddShow = () => {
    this.setState({
      addShow: true,
    });
  }
  onCancel =() => {
    this.setState({
      addShow: false,
    });
  }
  getNodes = (tree) => tree.reduce((pre, item) => {
    pre.push(
      <TreeNode value={item.id} title={item.name} key={item.id} level={item.level}>
        {item.children ? this.getNodes(item.children) : null}
      </TreeNode>
    );
    return pre;
  }, []);
  handleOk =(value) => {
    http
      .post(`${BSS_ADMIN_URL}/api/goods/category/add`, tools.clearEmpty(value))
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.onCancel();
          this.onGetListData();
          message.success("添加成功");
        } else {
          tools.dealFail(res);
        }
      })
      .catch(() => {
      });
  }
  updatalists = (key) => {
    this.onGetListData2(key);
  }
  onDel = (id) => {
    http
      .delete(`${BSS_ADMIN_URL}/api/goods/category/${id}/delete`)
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.onGetListData();
          this.onGetListData2('0012095310f347109eacc980cd1ce500');
          message.success("删除成功");
        } else {
          tools.dealFail(res);
        }
      })
      .catch(() => {
      });
  }
  changeStatus = (text, record) => {
    let status = record.status;
    text === 0 ? status = 1 : status = 0;
    let obj = {status: status,version:record.version};
    console.log(this.selectedKeys);
    this.setState({
      loading: true,
    });
    http
      .post(`${BSS_ADMIN_URL}/api/goods/category/${record.id}/start-using`, tools.clearNull(obj))
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.onGetListData2(this.selectedKeys);
          message.success("修改状态成功");
        } else {
          tools.dealFail(res);
        }
      })
      .catch(() => {
      });
  };
  render () {
    const {
      loading,
      lists,
      lists2
    } = this.state;
    // console.log(lists);this.productQuantity&&this.productQuantity === 0&&
    return (
      <main className="mian">
        <div className="left-contain" style={{marginRight: '0px', padding: '20px'}}>
          <Tree
            showLine
            switcherIcon={<CaretDownOutlined />}
            blockNode
            defaultSelectedKeys={['0012095310f347109eacc980cd1ce500']}
            onSelect={this.onSelect}
            loading={loading}
          >
            {this.getNodes(lists)}
          </Tree>
        </div>
        <div className="right-contain">
          <div className="c-operate">
            {(this.level >= 2 || (this.resourceConfigs&&this.resourceConfigs.length === 0)) &&
           <Button
             size="middle"
             onClick={this.onAddShow}
             style={{ color: "#1890ff", borderColor: "#1890ff" }}
           >
              新增类目
           </Button>}
          </div>
          <div className="g-table">
            <Table
              columns={this.makeColumns()}
              rowKey={(record) => record.id}
              loading={loading}
              dataSource={lists2}
              pagination={false}
            //   size="small"
            />
          </div>
        </div>
        <Modal
          title="新增类目"
          visible={this.state.addShow}
          onCancel={this.onCancel}
          footer={null}
          destroyOnClose
          width="50%"
        >
          <Add onClose={this.onCancel} lists={lists} selectedKeys={this.selectedKeys} onOK={(val) => this.handleOk(val)}/>
        </Modal>
      </main>
    );
  }
}
