/* eslint-disable react/prop-types */
/** User 系统管理/用户管理 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import {
  Form,
  Button,
  Input,
  Table,
  message,
  Pagination,
  Tooltip,
  Divider,
  Select,
  Modal,
  Cascader
} from 'antd';
import {
  EyeOutlined,
  FormOutlined,
  ExclamationCircleOutlined,
  OrderedListOutlined
} from "@ant-design/icons";
import { inject, observer} from 'mobx-react';
import './index.less';
import http from '@src/util/http';
import tools from '@src/util/tools'; // 工具
import {SYS_DICT_IP} from '@src/config/sysDict';// ip资源字典
// ==================
// 所需的所有组件
// ==================

import Edit from './container/Edit';
import Checkip from './container/Checkip';
import Record from './container/Record';
import Addblack from './container/Addblack';
import Removeblack from './container/Removeblack';
import Retain from './container/Retain';
import CancelRetain from './container/CancelRetain';
import {User} from '@src/util/user.js';

const type = 'DragbleBodyRow1';
const { Option } = Select;
const { confirm } = Modal;

@inject('root')
@inject("areaResouse")
@inject("ipresourceDict")
@inject("CategoryProduct")
@observer
export default class list extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    root: P.any, // 全局资源
    areaResouse: P.any, // 区域字典
    ipresourceDict: P.any, // ip资源字典
    CategoryProduct: P.any,
    powers: P.array, // 当前登录用户权限
    onClose: P.func, // 关闭编辑弹窗
    onOK: P.func, // 添加成功后的回调
    deviceId: P.string, // ip id
    defaultData: P.any, // ip基础信息
    id: P.any, // 当前id
  };

  searchFormRef = React.createRef();

  constructor (props) {
    super(props);
    console.log(props);
    this.hardSearch = {}; // 存储比较顽固的查询条件（顶部查询条件）
    this.searchParam = {}; // 搜索条件，因为不需要条件更新来及时的重新渲染组件，所以不放在state中
    this.locationId = undefined;
    this.state = {
      searchParam: {}, // 搜索条件
      lists: [], // 当前表格全部数据有层级关系 用于排序操作
      areaList: [], // 区域信息
      loading: false, // 表格数据是否正在加载中
      page: 1, // 当前第几页
      pageSize: 20, // 每页多少条
      total: null, // 数据库总共多少条数据
      operateType: 'add', // 操作类型 add新增，up修改, see查看
      modalShow: false,   // ip 修 查 状态模的显示
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      nowData: {}, // 当前选中ip的信息，用于查看详情、修改
      nowDataRegion: {}, // 当前选中区域的信息，用于查看详情、修改
      operateTypeRegion: 'add', // 区域操作类型 add新增，up修改, see查看
      // eslint-disable-next-line no-dupe-keys
      modalShow: false,   // ip增 修 查 状态模的显示
      nowipId: undefined,  // 当前选中的ip
      expandedRowKeys: [], // 展开的行keys
      selectedRowKeys: [], // 选中的行
      AddblackmodalShow: false,
      RemoveblackmodalShow: false,
      RetainmodalShow: false,
      cancelRetainShow: false,
      lists2: [], // 类目数据
    };
  }

  componentDidMount () {
    if (this.props.areaResouse.houseList.length <= 0) {
      this.props.areaResouse.fetchHouse();
    }
    if (this.props.areaResouse.vareaList.length <= 0) {
      this.props.areaResouse.fetchVarea();
    }
    // 带宽类型
    if (Object.keys(this.props.ipresourceDict.bandwidthType).length <= 0) {
      this.props.ipresourceDict.fetchbandwidthType();
    }
    // this.onGetCategory()
    this.props.CategoryProduct.fetchCategory();
    this.onGetListData();
  }

  // 机房搜索
  onSelectHouse (value, record) {
    this.onGetListData(record);
  }
  // 区域搜索
  onSelectRegion (value, record) {
    this.onGetListData(record);
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.searchFormRef.current.resetFields();
  };

  /**
   * 搜索
   * @param {obj} values 搜索条件
   */
  onSearchfrom (values) {
    // console.log(values);
    // 解决中括号查询全部bug
    console.log(values);
    values.businessType = this.categoryId;
    let ipaddr = values.ipAddr;
    if (values.ipAddr != undefined) {
      if (ipaddr.indexOf('[') != -1) {
        values.ipAddr = '%5D';
      } else if (ipaddr.indexOf('[') != -1) {
        values.ipAddr = '%5B';
      }
    }
    this.searchParam = values;
    this.onGetListData(values);
  }

  onCategoryChange = (value) => {
    console.log(value);
    this.categoryId = value[value.length - 1];
    console.log(this.categoryId);
  };

  // 查询当前页面所需列表数据
  onGetListData (values) {
    // 区域的数据
    values = values || this.state.regionInfo;
    const params = _.assign({}, {
      page: 1,
    }, this.searchParam, {
      ...values
    });
    this.setState({
      loading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/product/ipAddr`, {
    // http.get(`http://10.3.9.29:8080/api/product/ipAddr`, {
      params: params
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            lists: res.data.records,
            total: res.data.total,
            page: res.data.current,
            selectedRowKeys: [],
            selectedRows: [],
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


  // 选择选中行
  onSelectedRow (selectedRowKeys, selectedRows) {
    this.selectedRows = selectedRows;
    this.setState({ selectedRowKeys });
    let arr = [];
    for (let i = 0; i < selectedRows.length; i++) {
      const element = selectedRows[i].ipAddr;
      arr.push(element);
    }
    this.setState({iparr: arr, ipId: selectedRowKeys.join(',')});
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
    // 修改弹窗
    onModalShow = (record) => {
      this.searchParam = {};
      this.setState({
        modalShow: true,
        nowipId: record.id,
        nowData: record
      });
    }

  // 关闭ip资源查 修 弹窗
  onModalClose = () => {
    this.setState({
      modalShow: false,
      AddblackmodalShow: false,
      RemoveblackmodalShow: false,
      RetainmodalShow: false,
      cancelRetainShow: false
    });
  }

  /**
   * ip资源修改 操作
   * @param {obj} obj
   */
  onModalOk (obj) {
    // eslint-disable-next-line consistent-this
    let that = this.that;
    that.setState({
      modalLoading: true,
    });
    let param = tools.clearNull({
      id: this.id,
      ...obj
    });
    http.put(`${BSS_ADMIN_URL}/api/product/ipAddr/${this.id}/update`, param)
    // http.put(`http://10.3.9.29:8080/api/product/ipAddr/${this.id}/update`, param)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          tools.auto_close_result('ok', '操作成功');
          that.setState({
            page: 1,
            modalLoading: false,
            modalShow: false,
          });
          that.onGetListData({page: 1});
        } else {
          tools.dealFail(res);
        }
        that.setState({ modalLoading: false });
      })
      .catch(() => {
        that.setState({ modalLoading: false });
      });
  }

  // 加入黑名单
  onAddBlack (obj) {
    // eslint-disable-next-line consistent-this
    let _that = this.that;
    let param = JSON.stringify(obj);
    _that.setState({ modalLoading: true });
    http.put(`${BSS_ADMIN_URL}/api/product/ipAddr/addBlack`, param)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.onClose();
          _that.setState({
            modalLoading: false,
            modalShow: false,
          });
          _that.onGetListData();
          tools.auto_close_result('ok', '操作成功');
        } else {
          tools.dealFail(res);
        }
        _that.setState({ modalLoading: false });
      })
      .catch(() => {
        _that.setState({ modalLoading: false });
      });
  }

  // 取消黑名单
  onRemoveBlack (obj) {
    // eslint-disable-next-line consistent-this
    let _that = this.that;
    let param = JSON.stringify(obj);
    _that.setState({ modalLoading: true });
    http.put(`${BSS_ADMIN_URL}/api/product/ipAddr/cancelBlack`, param)
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.onClose();
          _that.setState({
            modalLoading: false,
            modalShow: false,
          });
          _that.onGetListData();
          tools.auto_close_result('ok', '操作成功');
        } else {
          tools.dealFail(res);
        }
        _that.setState({ modalLoading: false });
      })
      .catch(() => {
        _that.setState({ modalLoading: false });
      });
  }

  // 保留
  onRetainIp (obj) {
    // eslint-disable-next-line consistent-this
    let _that = this.that;
    let param = JSON.stringify(obj);
    _that.setState({ modalLoading: true });
    http.put(`${BSS_ADMIN_URL}/api/product/ipAddr/ipKeep`, param)
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.onClose();
          _that.setState({
            modalLoading: false,
            modalShow: false,
          });
          _that.onGetListData();
          tools.auto_close_result('ok', '操作成功');
        } else {
          tools.dealFail(res);
        }
        _that.setState({ modalLoading: false });
      })
      .catch(() => {
        _that.setState({ modalLoading: false });
      });
  }

  // 取消保留
  onCancelRetainIp (obj) {
    // eslint-disable-next-line consistent-this
    let _that = this.that;
    let param = JSON.stringify(obj);
    _that.setState({ modalLoading: true });
    http.put(`${BSS_ADMIN_URL}/api/product/ipAddr/ipKeep`, param)
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.onClose();
          _that.setState({
            // page: 1,
            modalLoading: false,
            modalShow: false,
          });
          _that.onGetListData();
          tools.auto_close_result('ok', '操作成功');
        } else {
          tools.dealFail(res);
        }
        _that.setState({ modalLoading: false });
      })
      .catch(() => {
        this.setState({ modalLoading: false });
      });
  }

  // 构建字段
  makeColumns () {
    const {is_lock, ip_type, ip_res_status, special_status, boolean} = SYS_DICT_IP;
    const columns = [
      {
        title: '机房/区域',
        dataIndex: 'fullLocationName',
        key: 'fullLocationName',
      },
      {
        title: 'ip名称',
        dataIndex: 'ipAddr',
        key: 'ipAddr'
      },
      {
        title: 'ip段信息',
        dataIndex: 'ipSegment',
        key: 'ipSegment'
      },
      {
        title: 'ip分类',
        dataIndex: 'ipType',
        key: 'ipType',
        render: (text, record) => ip_type[text]
      },
      {
        title: '所属业务',
        dataIndex: 'businessTypeName',
        key: 'businessTypeName',
      },
      {
        title: '带宽类型',
        dataIndex: 'bandwidthTypeName',
        key: 'bandwidthTypeName'
      },
      {
        title: '锁定状态',
        dataIndex: 'isLock',
        key: 'isLock',
        render: (text, record) => boolean[text]

      },
      {
        title: '资源状态',
        dataIndex: 'resStatus',
        key: 'resStatus',
        render: (text, record) => tools.renderStatus(ip_res_status, text)
      },
      {
        title: '特殊状态',
        dataIndex: 'specialStatus',
        key: 'specialStatus',
        render: (text, record) => special_status[text]
      },
      {
        title: 'ip资源备注',
        dataIndex: 'ipSegmentRemark',
        key: 'ipSegmentRemark'
      },
      {
        title: 'ip备注',
        dataIndex: 'remark',
        key: 'remark'
      },
      {
        title: '操作',
        key: 'control',
        fixed: 'right',
        width: 120,
        render: (text, record) => {
          const controls = [];
          const u = this.props.root.userinfo || {};
          const p = this.props.root.powers;
          controls.push(
            <span
              key="0"
              className="control-btn green"
            >
              {User.hasPermission('ipAddr-view') &&
                <Checkip deviceId={record.id}>
                  <Tooltip placement="top" title="查看">
                    <EyeOutlined></EyeOutlined>
                  </Tooltip>
                </Checkip>
              }
            </span>
          );
          controls.push(
            <span
              key="1"
              className="control-btn blue">
              {User.hasPermission('ipAddr-edit') && <Tooltip placement="top" title="修改">
                <FormOutlined onClick={() => {this.onModalShow(record);}}></FormOutlined>
              </Tooltip>}
            </span>
          );
          controls.push(
            <span
              key="2"
              className="control-btn red"
            >
              {User.hasPermission('ipUseRecord-view') &&
                <Record deviceId={record.id}>
                  <Tooltip placement="top" title="使用记录">
                    <OrderedListOutlined />
                  </Tooltip>
                </Record>
              }
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
      }
    ];
    return columns;
  }

// 批量出库
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
      console.log("OK");

      _that.onDel(selectedRowKeys);
      _that.setState({
        selectedRowKeys: [],
      });
    },
    onCancel () {
      console.log("Cancel");
    },
  });
};
// 批量加入黑名单
showAddConfirm = () => {
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
  } else {
    _that.onAdd(selectedRowKeys);
    _that.setState({
      selectedRowKeys: [],
    });
  }
};
// 批量移出黑名单
showRemoveConfirm = () => {
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
  } else {
    _that.onRemove(selectedRowKeys);
    _that.setState({
      selectedRowKeys: [],
    });
  }
};
// 批量保留
showRetainfirm = () => {
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
  } else {
    _that.onRetain(selectedRowKeys);
    _that.setState({
      selectedRowKeys: [],
    });
  }
};
// 批量取消保留
cancelRetainfirm = () => {
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
  } else {
    _that.cancelRetain(selectedRowKeys);
    _that.setState({
      selectedRowKeys: [],
    });
  }
};
// 出库
onDel (id) {
  if (typeof id == "string") {
    let ids = [];
    ids.push(id);
    // eslint-disable-next-line no-var
    var param = {
      id: ids,
    };
  } else {
    // eslint-disable-next-line no-var
    var param = {
      id: id,
    };
  }
  this.setState({ loading: true });
  let params = JSON.stringify(param);
  http
    .delete(`${BSS_ADMIN_URL}/api/product/ipAddr/delete`, {
    // .delete(`http://10.3.9.24:8080/api/product/ipAddr/delete`, {
      data: params,
    })
    .then((res) => {
      res = res.data;
      if (res.code === 20000) {
        this.setState({
          loading: false,
        });
        this.onGetListData();
        tools.auto_close_result('ok', '操作成功');
      } else {
        message.error(res.message);
        this.setState({ loading: false });
      }
    })
    .catch(() => {
      this.setState({ loading: false });
    });
}
// 加入黑名单
onAdd (id) {
  if (typeof id == "string") {
    let ids = [];
    ids.push(id);
    // eslint-disable-next-line no-var
    var param = {
      id: ids,
    };
  } else {
    // eslint-disable-next-line no-var
    var param = {
      id: id,
    };
  }
  let params = JSON.stringify(param);
  this.setState({
    AddblackmodalShow: true
  });
}

// 移出黑名单
onRemove (id) {
  if (typeof id == "string") {
    let ids = [];
    ids.push(id);
    // eslint-disable-next-line no-var
    var param = {
      id: ids,
    };
  } else {
    // eslint-disable-next-line no-var
    var param = {
      id: id,
    };
  }
  let params = JSON.stringify(param);
  this.setState({
    RemoveblackmodalShow: true
  });
}

// 保留
onRetain (id) {
  if (typeof id == "string") {
    let ids = [];
    ids.push(id);
    // eslint-disable-next-line no-var
    var param = {
      id: ids,
    };
  } else {
    // eslint-disable-next-line no-var
    var param = {
      id: id,
    };
  }
  let params = JSON.stringify(param);
  this.setState({
    RetainmodalShow: true
  });
}

// 取消保留
cancelRetain (id) {
  if (typeof id == "string") {
    let ids = [];
    ids.push(id);
    // eslint-disable-next-line no-var
    var param = {
      id: ids,
    };
  } else {
    // eslint-disable-next-line no-var
    var param = {
      id: id,
    };
  }
  let params = JSON.stringify(param);
  this.setState({
    cancelRetainShow: true
  });
}

// 获取类目数据
onGetCategory () {
  http
    .get(`${BSS_ADMIN_URL}/api/goods/category`)
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

render () {
  const {houseList, vareaList } = this.props.areaResouse;
  const {bandwidthType} = this.props.ipresourceDict;
  const {ip_res_status, special_status, boolean} = SYS_DICT_IP;
  const {lists, lists2, iparr, loading, page, pageSize, total, nowipId, modalShow, AddblackmodalShow, RemoveblackmodalShow, RetainmodalShow, cancelRetainShow, nowData, selectedRowKeys} =  this.state;
  return (
    <main className="mian">
      {/* 搜索 */}
      <div className="g-search">
        <Form ref={this.searchFormRef} name="searchbox" layout="inline" onFinish={(values) => {this.onSearchfrom(values);}}>
          <Form.Item name="houseId">
            <Select
              allowClear placeholder="请选择机房"
              showSearch
              filterOption={tools.filterOption}
              style={{width: 200}}>
              {houseList.map((item) => (
                <Option value={item.id} key={item.id}>
                  {item.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="regionId">
            <Select
              allowClear placeholder="请选择区域"
              showSearch
              filterOption={tools.filterOption}
              style={{width: 300}}>
              {vareaList.map((item) => (
                <Option value={item.fullLocationId} key={item.fullLocationId}>
                  {item.fullLocationName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="businessType">
            <Cascader options={this.props.CategoryProduct.categoryTreeList}  placeholder="请选择所属业务" fieldNames={{ label: 'name', value: 'id', children: 'children' }} style={{width: 300}} onChange={this.onCategoryChange}/>
          </Form.Item>

          <Form.Item name="bandwidthtype">
            <Select
              placeholder="请选择带宽类型" allowClear
              style={{width: 170}}>
              {_.map(bandwidthType, (value, key) => <Option value={key} key={key}>{value}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item name="ipAddr">
            <Input placeholder="请输入ip名称" maxLength="30" allowClear/>
          </Form.Item>

          <Form.Item name="ipSegment">
            <Input placeholder="请输入ip段信息" maxLength="30" allowClear/>
          </Form.Item>

          <Form.Item name="resStatus">
            <Select
              placeholder="资源状态" allowClear
              style={{width: 170}}>
              {_.map(ip_res_status, (value, key) => <Option value={parseInt(key)} key={key}>{value.text}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item name="specialStatus">
            <Select
              placeholder="特殊状态" allowClear
              style={{width: 170}}>
              {_.map(special_status, (value, key) => <Option value={parseInt(key)} key={key}>{value}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item shouldUpdate>
            <Button type="primary" htmlType="submit" >查询</Button>
          </Form.Item>
          <Form.Item shouldUpdate>
            <Button type="primary" onClick={this.onResetSearch} >重置</Button>
          </Form.Item>
        </Form>
      </div>
      {/* 操作 */}
      <div className="g-operate">
        {User.hasPermission('ipAddr-del') && <Button size="middle" className="actions-btn" onClick={this.showDeleteConfirm}>批量出库</Button>}
        {User.hasPermission('ipAddr-addBlack') && <Button size="middle" className="actions-btn" onClick={this.showAddConfirm}>加入黑名单</Button>}
        {User.hasPermission('ipAddr-cancelBlack') && <Button size="middle" className="actions-btn" onClick={this.showRemoveConfirm}>取消黑名单</Button>}
        {User.hasPermission('ipAddr-keep') && <Button size="middle" className="actions-btn" onClick={this.showRetainfirm}>预留</Button>}
        {User.hasPermission('ipAddr-keep') && <Button size="middle" className="actions-btn" onClick={this.cancelRetainfirm}>取消预留</Button>}
      </div>
      {/* 数据展示 */}
      <div className="g-table">
        <Table
          scroll={{x: 1600}}
          columns={this.makeColumns()}
          rowKey={(record) => record.id}
          loading={loading}
          dataSource={lists}
          pagination={false}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {this.onSelectedRow(selectedRowKeys, selectedRows);}
          }}
        />
        <div className="g-pagination">
          <Pagination current={page} total={total} pageSize={pageSize}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `共 ${total} 条`}
            onChange={(current, size) => {this.onPageChange(current, size);}}
            onShowSizeChange={(current, size) => {this.onPageSizeChange(current, size);}}/>
        </div>
      </div>
      <Modal
        title="ip详情编辑"
        maskClosable={false}
        width="80%"
        destroyOnClose
        footer={null}
        onCancel={this.onModalClose}
        visible={modalShow}>
        <Edit
          that={this}
          onOk={this.onModalOk}
          onClose={this.onModalClose}
          defaultData={nowData}
          // businessTypeLists={lists2}
          id={nowipId}></Edit>
      </Modal>
      <Modal
        title="加入黑名单"
        maskClosable={false}
        width="50%"
        destroyOnClose
        footer={null}
        onCancel={this.onModalClose}
        visible={AddblackmodalShow}>
        <Addblack
          that={this}
          onSubmit={this.onAddBlack}
          onClose={this.onModalClose}
          defaultData={nowData}
          ipId={this.state.ipId}
          iparr={iparr}
        ></Addblack>
      </Modal>
      <Modal
        title="取消黑名单"
        maskClosable={false}
        width="50%"
        destroyOnClose
        footer={null}
        onCancel={this.onModalClose}
        visible={RemoveblackmodalShow}>
        <Removeblack
          that={this}
          onSubmit={this.onRemoveBlack}
          onClose={this.onModalClose}
          defaultData={nowData}
          ipId={this.state.ipId}
          iparr={iparr}
        ></Removeblack>
      </Modal>
      <Modal
        title="预留"
        maskClosable={false}
        width="50%"
        destroyOnClose
        footer={null}
        onCancel={this.onModalClose}
        visible={RetainmodalShow}>
        <Retain
          that={this}
          onSubmit={this.onRetainIp}
          onClose={this.onModalClose}
          defaultData={nowData}
          ipId={this.state.ipId}
          iparr={iparr}
        ></Retain>
      </Modal>
      <Modal
        title="取消预留"
        maskClosable={false}
        width="50%"
        destroyOnClose
        footer={null}
        onCancel={this.onModalClose}
        visible={cancelRetainShow}>
        <CancelRetain
          that={this}
          onSubmit={this.onCancelRetainIp}
          onClose={this.onModalClose}
          defaultData={nowData}
          ipId={this.state.ipId}
          iparr={iparr}
        ></CancelRetain>
      </Modal>
    </main>
  );
}
}
