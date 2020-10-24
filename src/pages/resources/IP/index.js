/* eslint-disable react/prop-types */
/** IP ip资源管理/ip资源 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import Axios from 'axios';
import {
  Form,
  Button,
  Input,
  Table,
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
} from "@ant-design/icons";
import { inject, observer } from 'mobx-react';
import './index.less';
import http from '@src/util/http';
import tools from '@src/util/tools'; // 工具
import { User } from '@src/util/user.js';
import { SYS_DICT_IP } from '@src/config/sysDict';// ip资源字典

// ==================
// 所需的所有组件
// ==================
import Edit from './container/Edit';
import Checkip from './container/Checkip';
import Warehousing from './container/Warehousing';


const { Option } = Select;
const { confirm } = Modal;

@inject('root')
@inject("areaResouse")
@inject("CategoryProduct")
@inject("ipresourceDict")
@observer
export default class list extends React.Component {
  static propTypes = {
    location: P.any, // 当前位置
    areaResouse: P.any, // 区域字典
    CategoryProduct: P.any, // 类目
    ipresourceDict: P.any, // ip资源字典
    root: P.any, // 全局状态
    userinfo: P.any, // 用户信息
    powers: P.array, // 当前登录用户权限
  };

  searchFormRef = React.createRef();
  constructor (props) {
    super(props);
    console.log(this.props),
    this.selectedRow = {
      length: 0,
      keys: [],
      rows: [],
    }; // 选中数据
    this.hardSearch = {}; // 存储比较顽固的查询条件（顶部查询条件）
    this.searchParam = {}; // 搜索条件，因为不需要条件更新来及时的重新渲染组件，所以不放在state中
    this.locationId = undefined;
    this.state = {
      searchParam: {}, // 搜索条件
      lists: [], // 当前表格全部数据有层级关系 用于排序操作
      loading: false, // 表格数据是否正在加载中
      page: 1, // 当前第几页
      pageSize: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      nowData: {}, // 当前选中ip的信息，用于查看详情、修改
      modalShow: false,   // ip增 修 查 状态模的显示
      nowipId: undefined,  // 当前选中的ip
      expandedRowKeys: [], // 展开的行keys
      selectedRowKeys: [], // 选中的行
      regionInfo: {},
      download: '',
      ipWarehouse: false,
    };
  }

  componentDidMount () {
    if (this.props.areaResouse.houseList.length <= 0) {
      this.props.areaResouse.fetchHouse();
    }
    this.props.ipresourceDict.fetchbandwidthType();
    this.onGetListData();
    this.props.CategoryProduct.fetchCategory();
  }

  // 机房搜索
  onSelectHouse (value, record) {
    this.onGetListData(record);
  }

  /**
 * 重置搜索条件
 */
  onResetSearch = () => {
    this.categoryId = '';
    this.searchFormRef.current.resetFields();
  };

  /**
* 搜索
* @param {obj} values 搜索条件
*/
  onSearchfrom (values) {
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
    console.log(values);
    this.searchParam = values;
    this.setState({ searchValue: values });
    this.onGetListData(values);
  }

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
    http.get(`${BSS_ADMIN_URL}/api/product/ipSegment`, {
    // http.get(`http://10.3.9.24:8080/api/product/ipSegment`, {
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
    console.log(record);
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
      ipWarehouse: false
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
      loading: true,
      modalLoading: true,
    });
    let param = tools.clearNull({
      id: this.id,
      ...obj
    });
    http.put(`${BSS_ADMIN_URL}/api/product/ipSegment/${this.id}/update`, param)
    // http.put(`http://10.3.9.24:8080/api/product/ipSegment/${this.id}/update`, param)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          tools.auto_close_result('ok', '操作成功');
          that.setState({
            page: 1,
            modalLoading: false,
            modalShow: false,
          });
          that.onGetListData({ page: 1 });
        } else {
          tools.dealFail(res);
        }
        that.setState({ modalLoading: false, loading: false });
      })
      .catch(() => {
        that.setState({ modalLoading: false, loading: false });
      });
  }
  onCategoryChange = (value) => {
    console.log(value);
    this.categoryId = value[value.length - 1];
    console.log(this.categoryId);
  };

  // 构建字段
  makeColumns () {
    const {  show_type, boolean } = SYS_DICT_IP;
    const columns = [
      {
        title: '机房/区域',
        dataIndex: 'fullLocationName',
        key: 'fullLocationName',
      },
      {
        title: 'IP段信息',
        dataIndex: 'ipAddr',
        key: 'ipAddr',
      },
      {
        title: '网关',
        dataIndex: 'gateway',
        key: 'gateway'
      },
      {
        title: '掩码',
        dataIndex: 'netmask',
        key: 'netmask'
      },
      {
        title: '可用地址段',
        dataIndex: 'availableSegment',
        key: 'availableSegment'
      },
      {
        title: '带宽类型',
        dataIndex: 'bandwidthTypeName',
        key: 'bandwidthTypeName'
      },
      {
        title: '所属业务',
        dataIndex: 'businessTypeName',
        key: 'businessTypeName'
      },
      {
        title: '显示方式',
        dataIndex: 'showType',
        key: 'showType',
        render: (text, record) => show_type[text]
      },
      {
        title: '锁定状态',
        dataIndex: 'isLock',
        key: 'isLock',
        render: (text, record) => boolean[text]
      },
      {
        title: '备注',
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
              {User.hasPermission('ipSegment-view') &&
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
              {User.hasPermission('ipSegment-update') && <Tooltip placement="top" title="修改">
                <FormOutlined onClick={() => {this.onModalShow(record);}}></FormOutlined>
              </Tooltip>}
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
  // 锁定
  ipResourcesLock = () => {
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
      title: "你确定要锁定吗？",
      icon: <ExclamationCircleOutlined />,
      okText: "确定",
      okType: "danger",
      cancelText: "取消",

      onOk () {
        _that.Lock(selectedRowKeys);
        _that.setState({
          selectedRowKeys: [],
        });
      },
      onCancel () {
        console.log("Cancel");
      },
    });
  };
  // 解锁
  ipResourcesUnlock = () => {
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
      title: "你确定要解锁吗？",
      icon: <ExclamationCircleOutlined />,
      okText: "确定",
      okType: "danger",
      cancelText: "取消",

      onOk () {
        _that.Unlock(selectedRowKeys);
        _that.setState({
          selectedRowKeys: [],
        });
      },
      onCancel () {
        console.log("Cancel");
      },
    });
  };
  // 锁定某一条数据
  Lock (id) {
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
      .delete(`${BSS_ADMIN_URL}/api/product/ipSegment/lock`, {
        data: params
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
          tools.dealFail(res);
          this.setState({ loading: false });
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }
  // 解锁某一条数据
  Unlock (id) {
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
      .delete(`${BSS_ADMIN_URL}/api/product/ipSegment/unlock`, {
        data: params,
      })
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.setState({
            // page: 1,
            loading: false,
          });
          this.onGetListData();
          tools.auto_close_result('ok', '操作成功');
        } else {
          tools.dealFail(res);
          this.setState({ loading: false });
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
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
      .delete(`${BSS_ADMIN_URL}/api/product/ipSegment/delete`, {
      // .delete(`http://10.3.9.24:8080/api/product/ipSegment/delete`, {
        data: params,
      })
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.setState({
            // page: 1,
            loading: false,
          });
          this.onGetListData();
          tools.auto_close_result('ok', '操作成功');
        } else {
          tools.dealFail(res);
          this.setState({ loading: false });
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }
  // 导出
  handleExport = () => {
    let param = this.state.searchValue;
    if (param == null) {
      this.setState({ loading: true });
    }
    this.setState({ loading: true });
    event.preventDefault();// 使a自带的方法失效，即无法调整到href中的URL
    Axios({
      method: 'post',
      url: `${BSS_ADMIN_URL}/api/product/ipSegment/export`,
      // url: `http://10.3.9.24:8080/api/product/ipSegment/export`,
      responseType: 'blob',
      headers: {
        'Authorization': 'token ' + User.getToken()
      },
      data: param
    })
      .then((res) => {
        const link = document.createElement('a');
        let blob = new Blob([res.data], { type: 'application/octet-stream' });
        const fileName = decodeURI(res.headers['filename']);
        console.log(fileName);
        link.style.display = 'none';
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.setState({ loading: false });
        tools.auto_close_result('ok', '操作成功');
      })
      .catch((error) => {
        tools.dealFail(res);
        this.setState({ loading: false });
        console.log(error);
      });
  }
  // 入库
  ipWarehousing=() => {
    this.setState({
      ipWarehouse: true
    });
  }

  /**
 * ip资源入库 操作
 * @param {obj} obj
 */
  ipWarehouseOK (obj) {
    console.log(obj);
    // eslint-disable-next-line consistent-this
    let that = this.that;
    that.setState({
      loading: true,
      modalLoading: true,
    });
    let param = tools.clearNull({
      ...obj
    });
    // http.post(`http://10.3.9.24:8080/api/product/ipSegment/add`, param)
    http.post(`${BSS_ADMIN_URL}/api/product/ipSegment/add`, param)
      .then((res) => {
        res = res.data;
        console.log(res);
        if (tools.hasStatusOk(res)) {
          tools.auto_close_result('ok', '操作成功');
          that.setState({
            page: 1,
            modalLoading: false,
            modalShow: false,
            ipWarehouse: false
          });
          that.onGetListData({ page: 1 });
        } else {
          tools.dealFail(res);
        }
        that.setState({ modalLoading: false, loading: false });
      })
      .catch(() => {
        that.setState({ modalLoading: false, loading: false });
      });
  }

  render () {
    const { houseList } = this.props.areaResouse;
    const { bandwidthType } = this.props.ipresourceDict;
    const {  ip_source,  boolean } = SYS_DICT_IP;
    const { lists, loading, page, pageSize, total, nowipId, modalShow, ipWarehouse, nowData, selectedRowKeys } = this.state;
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
                style={{ width: 200 }}>
                {houseList.map((item) => (
                  <Option value={item.id} key={item.id}>
                    {item.fullName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="businessType">
              <Cascader options={this.props.CategoryProduct.categoryTreeList}  placeholder="请选择所属业务" fieldNames={{ label: 'name', value: 'id', children: 'children' }} style={{width: 300}} onChange={this.onCategoryChange}/>
            </Form.Item>

            <Form.Item name="bandwidthType">
              <Select
                placeholder="请选择带宽类型" allowClear
                style={{ width: 170 }}>
                {_.map(bandwidthType, (value, key) => <Option value={key} key={key}>{value}</Option>)}
              </Select>
            </Form.Item>

            <Form.Item name="source">
              <Select
                placeholder="请选择IP来源" allowClear
                style={{ width: 170 }}>
                {_.map(ip_source, (value, key) => <Option value={parseInt(key)} key={key}>{value}</Option>)}
              </Select>
            </Form.Item>

            <Form.Item name="ipAddr" >
              <Input placeholder="请输入ip段信息" maxLength="30" allowClear />
            </Form.Item>

            <Form.Item name="isLock">
              <Select
                placeholder="请选择锁定状态" allowClear
                style={{ width: 170 }}>
                {_.map(boolean, (value, key) => <Option value={parseInt(key)} key={key}>{value}</Option>)}
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
          <Button size="middle"  className="actions-btn" onClick={this.ipWarehousing}>入库</Button>
          {User.hasPermission('ipSegment-lock') && <Button size="middle"  className="actions-btn" onClick={this.ipResourcesLock}>锁定</Button>}
          {User.hasPermission('ipSegment-unlock') && <Button size="middle" className="actions-btn" onClick={this.ipResourcesUnlock}>解锁</Button>}
          {User.hasPermission('ipSegment-delete') && <Button size="middle" className="actions-btn" onClick={this.showDeleteConfirm}>批量出库</Button>}
          {User.hasPermission('ipSegment-export') && <Button size="middle" className="actions-btn" onClick={this.handleExport}>导出</Button>}
        </div>
        {/* 数据展示 */}
        <div className="g-table">
          <Table
            scroll={{ x: 1600 }}
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
              onShowSizeChange={(current, size) => {this.onPageSizeChange(current, size);}} />
          </div>
        </div>
        <Modal
          title="ip资源编辑"
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
            id={nowipId}></Edit>
        </Modal>
        <Modal
          title="ip资源入库"
          maskClosable={false}
          width="80%"
          destroyOnClose
          footer={null}
          onCancel={this.onModalClose}
          visible={ipWarehouse}>
          <Warehousing
            that={this}
            onOk={this.ipWarehouseOK}
            onClose={this.onModalClose}
            defaultData={nowData}
            id={nowipId}></Warehousing>
        </Modal>
      </main>
    );
  }
}
