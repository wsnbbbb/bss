/* eslint-disable react/prop-types */
/** 资源模块/外机列表页 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import {
  Form, Button, Input, Select, Table, Pagination,
  Tag, Spin, message, Popconfirm, Popover, Tooltip, Divider, Modal, InputNumber,
} from 'antd';
import { ExclamationCircleOutlined, EyeOutlined, FormOutlined, DeleteOutlined, UnlockOutlined} from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import { Link } from 'react-router-dom';
import http from '@src/util/http';
import tools from '@src/util/tools'; // 工具
import { cabinetStatusColor } from '@src/config/commvar'; // 全局变量
import { SYS_DICT_NODEMASTER } from '@src/config/sysDict'; // 全局变量
import { User } from '@src/util/user.js';
// ==================
// 所需的所有组件
// ==================

import Add from './container/Add';
import Edit from './container/Edit';
import See from './container/See';
const { confirm } = Modal;
const { Option } = Select;
@inject('root')
@inject('nodeMasterDict')
@inject("areaResouse")
@observer
// @DropTarget(type, spec, collect)
export default class List extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    userinfo: P.any,
    powers: P.array,
    nodeMasterDict: P.any,
  };
  searchFormRef = React.createRef();
  constructor (props) {
    super(props);
    this.selectedRows = []; // 选中数据
    this.searchParam = {}, // 存储查询条件（顶部查询条件）
    this.state = {
      lists: [], // 接口获取外机信息不包含空外机
      loading: false, // 外机数据正在加载中
      page: 1, // 当前第几页
      pageSize: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      selectedRowKeys: [], // 选中行id
      modalShow: false,   // 机房增 修 查 状态模的显示
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      nowData: {}, // 当前选中外机的信息，用于查看详情、修改
      nowDeviceId: '',  // 当前选中的外机id
      modalShowEdit: false,   // 修改外机状态模
      addType: undefined,   // 入库类型：tempadd（模板入库）|| add（put入库）
    };
  }
  componentDidMount () {
    this.onGetListData();
    if (this.props.areaResouse.houseList.length <= 0) {
      this.props.areaResouse.fetchHouse();
    }
    if (this.props.areaResouse.vareaList.length <= 0) {
      this.props.areaResouse.fetchVarea();
    }
    if (Object.keys(this.props.nodeMasterDict.device_model).length <= 0) {
      this.props.nodeMasterDict.fetchDeviceModel();
    }
    if (Object.keys(this.props.nodeMasterDict.device_spec).length <= 0) {
      this.props.nodeMasterDict.fetchDeviceSpec();
    }
    if (Object.keys(this.props.nodeMasterDict.device_brand).length <= 0) {
      this.props.nodeMasterDict.fetchDeviceBrand();
    }
  }

  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: '外机名称',
        dataIndex: 'name',
        key: 'name'
      },
      // {
      //   title: '位置码',
      //   dataIndex: 'positionalCode',
      //   key: 'positionalCode'
      // },
      {
        title: '区域',
        dataIndex: 'locationName',
        key: 'locationName'
      },
      {
        title: '品牌',
        dataIndex: 'deviceBrand',
        key: 'deviceBrand',
        width: 110,
        render: (text, record, index) => this.props.nodeMasterDict.device_brand[text] || 'UNKNOW'
      },
      {
        title: '型号',
        dataIndex: 'deviceModel',
        key: 'deviceModel',
        render: (text, record, index) => this.props.nodeMasterDict.device_model[text] || 'UNKNOW'
      },
      {
        title: '规格',
        dataIndex: 'deviceSpec',
        key: 'deviceSpec',
        width: 90,
        render: (text, record, index) => this.props.nodeMasterDict.device_spec[text] || 'UNKNOW'
      },
      {
        title: '机柜',
        dataIndex: 'cabinetName',
        key: 'cabinetName'
      },
      {
        title: '起始U位',
        dataIndex: 'startUs',
        width: 90,
        key: 'startUs'
      },
      {
        title: '占用U位',
        dataIndex: 'us',
        width: 90,
        key: 'us'
      },
      {
        title: '节点数',
        dataIndex: 'nodeNum',
        width: 80,
        key: 'nodeNum'
      },
      {
        title: '销售状态',
        dataIndex: 'status',
        width: 90,
        key: 'status',
        render: (text) => tools.renderStatus(SYS_DICT_NODEMASTER.node_server_market, text)
      },
      {
        title: '资源备注',
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
          controls.push(
            <span
              key="0"
              className="control-btn green"
            >
              <Tooltip placement="top" title="查看">
                <See deviceId={record.id}>
                  <EyeOutlined></EyeOutlined>
                </See>
              </Tooltip>
            </span>
          );
          User.hasPermission('node-server-edit') &&
          controls.push(
            <span
              key="1"
              className="control-btn blue">
              <Tooltip placement="top" title="修改">
                <FormOutlined onClick={() => {this.onModalShowEdit(record);}}></FormOutlined>
              </Tooltip>
            </span>
          );
          User.hasPermission('node-server-delete') &&
            controls.push(
              <span className="control-btn red">
                <Tooltip placement="top" title="出库">
                  <DeleteOutlined onClick={() => {this.onDel(record.id);}}></DeleteOutlined>
                </Tooltip>
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

  // 查询当前页面所需列表数据
  onGetListData (values) {
    const params = _.assign({}, {
      page: this.state.page,
      pageSize: this.state.pageSize,
    }, this.searchParam, {
      ...values
    });
    this.setState({
      loading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/product/nodeserver/master`, {
      params: tools.clearEmpty(params)
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.selectedRows = [];
          this.setState({
            lists: res.data.records,
            selectedRowKeys: [],
            total: res.data.total,
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
   * 搜索
   * @param {obj} values 搜索条件
   */
  onSearch (values) {
    this.searchParam = values;
    this.setState({
      page: 1,
    });
    this.onGetListData(values);
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.searchParam = {};
    this.searchFormRef.current.resetFields();
  };

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

  /**
   * 添加 模态框出现
   * @item: 当前选中的那条数据
   * @type: add添加/tempadd模板入库
   * **/
  onModalShow (type) {
    // 模板入库
    if (type == 'tempadd' && this.selectedRows.length != 1) {
      Modal.warning({
        title: '请选择一条数据作为模板'
      });
      return false;
    }
    this.setState({
      addType: type,
      modalShow: true
    });

  }

  /**
   * 设备添加 操作
   * @param {obj} obj
   */
  onModalAddOk = (obj) => {
    this.setState({
      modalLoading: true,
    });
    let param = tools.clearNull({
      ...obj
    });
    http.post(`${BSS_ADMIN_URL}/api/product/nodeserver/master/add`, tools.clearNull(obj))
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          tools.auto_close_result('ok', '操作成功');
          this.setState({
            page: 1,
            modalLoading: false,
            modalShow: false,
          });
          this.onGetListData({page: 1});
        } else {
          this.setState({ modalLoading: false });
          tools.dealFail(res);
        }
      })
      .catch(() => {
        this.setState({ modalLoading: false });
      });
  }

  /**
   * 设备修改 操作
   * @param {obj} obj
   */
  onModalEditOk = (obj) => {
    this.setState({
      modalLoading: true,
    });
    let param = tools.clearNull({
      ...obj
    });
    http.put(`${BSS_ADMIN_URL}/api/product/nodeserver/master/${this.state.nowDeviceId}/update`, param)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          tools.auto_close_result('ok', '操作成功');
          this.setState({
            modalLoading: false,
            modalShowEdit: false
          });
          this.onGetListData();
        } else {
          this.setState({ modalLoading: false });
          tools.dealFail(res);
        }
      })
      .catch(() => {
        this.setState({ modalLoading: false });
      });
  }

  /**
   * 外机执行 入库操作
   * @param {obj} obj
   */
  onModalOk (obj) {
    this.setState({
      modalLoading: true,
    });
    http.post(`${BSS_ADMIN_URL}/api/product/nodeServerMaster/add`, tools.clearNull(obj))
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          tools.auto_close_result('ok', '操作成功');
          this.setState({
            modalLoading: false,
            modalShow: false,
          });
          this.onGetListData();
        } else {
          this.setState({ modalLoading: false });
          tools.dealFail(res);
        }
      })
      .catch(() => {
        this.setState({ modalLoading: false });
      });
  }

  /**
   * 获取外机详细）
   * @param {*} id 外机id
   */
  getDetail (id) {
    this.setState({
      loading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/product/nodeserver/master/${id}/get`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let data = res.data;
          this.setState({
            modalShowEdit: true,
            nowDeviceId: id,
            nowData: data,
            loading: false
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

  // 关闭外机增 修 弹窗
  onModalClose = () => {
    this.setState({
      modalShow: false,
      modalShowEdit: false,
    });
  }

  // 删除某一条外机数据
  onDel (id) {
    confirm({
      icon: <ExclamationCircleOutlined />,
      content: `确认要删除这条数据吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        this.setState({ loading: true });
        http.delete(`${BSS_ADMIN_URL}/api/product/nodeserver/master/${id}/delete`)
          .then((res) => {
            res = res.data;
            if (tools.hasStatusOk(res)) {
              tools.auto_close_result('ok', '操作成功');
              this.onGetListData();
            } else {
              tools.dealFail(res);
              this.setState({ loading: false });
            }
          })
          .catch(() => {
            this.setState({ loading: false });
          });
      },
      onCancel () {
        console.log('Cancel');
      },
    });
  }
  // 删除某一条网络设备
  onBatchDel () {
    if (this.selectedRows.length <= 0) {
      Modal.warning({
        title: '请至少选择一条数据！'
      });
      return;
    }
    confirm({
      icon: <ExclamationCircleOutlined />,
      content: `确认执行批量删除操作吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        let ids = [];
        _.map(this.selectedRows, (item) => {
          ids.push(item.id);
        });
        this.setState({ loading: true });
        http.delete(`${BSS_ADMIN_URL}/api/product/nodeserver/master/allDel`, {
          data: ids
        })
          .then((res) => {
            res = res.data;
            if (tools.hasStatusOk(res)) {
              tools.auto_close_result('ok', '操作成功');
              this.onGetListData();
            } else {
              tools.dealFail(res);
              this.setState({ loading: false });
            }
          })
          .catch(() => {
            this.setState({ loading: false });
          });
      },
      onCancel () {
        console.log('Cancel');
      },
    });
  }

  // 选择选中行
  selectedRow (selectedRowKeys, selectedRows) {
    this.selectedRows = selectedRows;
    this.setState({
      selectedRowKeys: selectedRowKeys,
    });
  }

  /**
   * 编辑 模态框出现
   * @item: 当前选中的那条数据
   * **/
  onModalShowEdit (record) {
    this.getDetail(record.id);
  }

  render () {
    const {device_model, device_spec } = this.props.nodeMasterDict;
    const {houseList, vareaList } = this.props.areaResouse;
    const {lists, loading, page, pageSize, total, nowDeviceId, nowData} =  this.state;
    return (
      <main className="mian">
        {/* 搜索 */}
        <div className="g-search">
          <Form ref={this.searchFormRef} name="searchbox" layout="inline" onFinish={(values) => {this.onSearch(values);}}>
            <Form.Item name="houseId">
              <Select
                allowClear placeholder="请选择机房"
                style={{width: 300}}
                showSearch
                filterOption={tools.filterOption}>
                {houseList.map((item) => (
                  <Option value={item.id} key={item.id}>
                    {item.fullName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="locationId">
              <Select
                allowClear placeholder="请选择区域"
                style={{width: 300}}
                showSearch
                filterOption={tools.filterOption}>
                {vareaList.map((item) => (
                  <Option value={item.fullLocationId} key={item.fullLocationId}>
                    {item.fullLocationName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="cabinetName">
              <Input allowClear placeholder="请选择机柜" />
            </Form.Item>
            <Form.Item name="deviceModel">
              <Select
                style={{width: 200}}
                placeholder="外机型号" allowClear>
                {
                  _.map(device_model, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item name="deviceSpec">
              <Select
                style={{width: 200}}
                placeholder="外机规格" allowClear>
                {
                  _.map(device_spec, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item name="status">
              <Select
                style={{width: 150}}
                placeholder="请选择销售状态" allowClear>
                {
                  _.map(SYS_DICT_NODEMASTER.node_server_market, (item, key) => <Option value={parseInt(key)} key={key} > {item.text} </Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" >搜索</Button>
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={this.onResetSearch} >重置</Button>
            </Form.Item>
          </Form>
        </div>
        {/* 操作 */}
        <div className="g-operate">
          {User.hasPermission('node-server-delete') && <Button className="actions-btn" size="middle" onClick={() => {this.onBatchDel();}}>批量删除</Button>}
          {User.hasPermission('node-server-add') && <Button className="actions-btn" size="middle" onClick={() => {this.onModalShow('add');}}>外机入库</Button>}
          {User.hasPermission('node-server-add') && <Button className="actions-btn" size="middle" onClick={() => {this.onModalShow('tempadd');}}>模板入库</Button>}
        </div>
        {/* 数据展示 */}
        <div className="g-table">
          <Table
            scroll={{x: 1400}}
            columns={this.makeColumns()}
            rowKey={(record) => record.id}
            loading={loading}
            dataSource={lists}
            pagination={false}
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: this.state.selectedRowKeys,
              onChange: (selectedRowKeys, selectedRows) => {this.selectedRow(selectedRowKeys, selectedRows);}
            }}
          />
          <div className="g-pagination">
            <Pagination current={page} total={total} pageSize={pageSize}
              showSizeChanger
              showTotal={(total) => `共 ${total} 条`}
              onChange={(current, size) => {this.onPageChange(current, size);}}
              onShowSizeChange={(current, size) => {this.onPageSizeChange(current, size);}}
            />
          </div>
          {/* 外机入库和模板入库 */}
          <Modal
            title="添加外机"
            maskClosable={false}
            width="80%"
            destroyOnClose
            footer={null}
            onCancel={this.onModalClose}
            visible={this.state.modalShow}
            modalLoading={this.state.modalLoading}>
            <Add
              defaultData={this.selectedRows[0]}
              addType={this.state.addType}
              onOk={(v) => this.onModalAddOk(v)}
              onClose={this.onModalClose}
            ></Add>
          </Modal>
          {/* 修改外机 */}
          <Modal
            title="修改外机"
            maskClosable={false}
            width="90%"
            destroyOnClose
            footer={null}
            onCancel={this.onModalClose}
            visible={this.state.modalShowEdit}
            modalLoading={this.state.modalLoading}>
            <Edit
              deviceId={nowDeviceId}
              defaultData={nowData}
              onOk={(obj) => this.onModalEditOk(obj)}
              onClose={this.onModalClose}>
            </Edit>
          </Modal>
        </div>
      </main>
    );
  }
}
