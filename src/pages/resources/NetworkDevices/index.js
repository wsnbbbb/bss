/* eslint-disable react/prop-types */
/** User 系统管理/用户管理 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import {
  Form, Button, Input, Select, Table, Pagination, Tooltip, Divider, Modal,
} from 'antd';
import { ExclamationCircleOutlined, EyeOutlined, FormOutlined, DeleteOutlined, ApiOutlined, PlusSquareOutlined} from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import http from '@src/util/http';
import tools from '@src/util/tools'; // 工具
import {SYS_DICT_NET_DEVICE} from '@src/config/sysDict'; // 系统字典
// ==================
// 所需的所有组件
// ==================

import Add from './container/add';
import Edit from './container/Edit';
import DevicesDetail from './container/DevicesDetail';
import EditPort from './container/EditPort';
import GeneratePort from './container/GeneratePort';
import {User} from "@src/util/user";
const { confirm } = Modal;
const { Option } = Select;

@inject('deviceDict')
@observer
export default class List extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    userinfo: P.any,
    powers: P.array,
    deviceDict: P.any,
  };
  searchFormRef = React.createRef();
  constructor (props) {
    super(props);
    this.selectedRows = []; // 选中条数
    this.searchParam = {}, // 搜索条件（顶部查询条件）
    this.state = {
      lists: [], // 接口获取机柜信息不包含空机柜
      loading: false, // 机柜数据正在加载中
      page: 1, // 当前第几页
      pageSize: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      selectedRowKeys: [], // 选中行ids
      modalShow: false,   // 机房增 修 查 状态模的显示
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      nowDeviceId: undefined,  // 当前选中的设备id 机柜u位管理组件使用
      nowData: {}
    };
  }
  componentDidMount () {
    if (Object.keys(this.props.deviceDict.devicebrand).length <= 0) {
      this.props.deviceDict.fetchDeviceBrand();
    }
    if (Object.keys(this.props.deviceDict.devicemodel).length <= 0) {
      this.props.deviceDict.fetchDeviceModel();
    }
    this.onGetListData();
  }

  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: '设备名称',
        dataIndex: 'deviceName',
        key: 'deviceName'
      },
      {
        title: '区域',
        dataIndex: 'fullLocationName',
        key: 'fullLocationName'
      },
      {
        title: '机柜',
        dataIndex: 'cabinetName',
        key: 'cabinetName'
      },
      {
        title: '物理位置码',
        dataIndex: 'locationCode',
        key: 'locationCode'
      },
      {
        title: '管理IP',
        dataIndex: 'ip',
        key: 'ip'
      },
      {
        title: '起始U位',
        dataIndex: 'startubat',
        key: 'startubat'
      },
      {
        title: '占用U位',
        dataIndex: 'uw',
        key: 'uw'
      },
      {
        title: '端口数量',
        dataIndex: 'num',
        key: 'num'
      },
      {
        title: '设备类型',
        dataIndex: 'deviceType',
        key: 'deviceType',
        render: (text, record) => SYS_DICT_NET_DEVICE.re_facility[text]
      },
      // {
      //   title: '入库时间',
      //   dataIndex: 'storagetime',
      //   key: 'storagetime'
      // },
      // {
      //   title: '备注',
      //   dataIndex: 'remarks',
      //   key: 'remarks'
      // },
      {
        title: '操作',
        key: 'control',
        fixed: 'right',
        width: 200,
        render: (text, record) => {
          const controls = [];
          const u = User.getPermission() || [];
          u.includes('network-devices-view') &&
          controls.push(
            <span
              key="0"
              className="control-btn green"
            >
              <Tooltip placement="top" title="查看">
                <DevicesDetail deviceId={record.id}>
                  <EyeOutlined></EyeOutlined>
                </DevicesDetail>
              </Tooltip>
            </span>
          );
          u.includes('network-devices-edit') &&
          controls.push(
            <span
              key="1"
              className="control-btn blue">
              <Tooltip placement="top" title="修改">
                <FormOutlined onClick={() => {this.onModalShow(record);}}></FormOutlined>
              </Tooltip>
            </span>
          );
          u.includes('network-devices-delete') &&
          // u.id !== record.id &&
            controls.push(
              <span key="2" className="control-btn red">
                <Tooltip placement="top" title="删除">
                  <DeleteOutlined onClick={() => {this.onDel(record.id);}}></DeleteOutlined>
                </Tooltip>
              </span>
            );
          u.includes('network-devices-edit') &&
          controls.push(
            <span key="3" className="control-btn blue">
              <Tooltip placement="top" title="修改端口">
                <EditPort
                  deviceId={record.id}
                  title="修改端口"
                  onSelect={() => {this.onGetListData();}}>
                  <ApiOutlined />
                </EditPort>
              </Tooltip>
            </span>
          );
          u.includes('network-devices-add') &&
          controls.push(
            <span key="4" className="control-btn blue">
              <Tooltip placement="top" title="增加端口">
                <GeneratePort
                  deviceId={record.id}
                  title="增加端口"
                  onSelect={() => {this.onGetListData();}}>
                  <PlusSquareOutlined />
                </GeneratePort>
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
    }, this.searchParam, values);
    this.setState({
      loading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/product/network/devices`, {
      params: params
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.selectedRows = [];
          this.setState({
            lists: res.data.records,
            total: res.data.total,
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

  /**
   * 搜索
   * @param {obj} values 搜索条件
   */
  onSearch (values) {
    this.searchParam = values;
    this.selectedRows = [];
    this.setState({
      page: 1,
    });
    this.onGetListData(values);
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
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
   * 编辑 模态框出现
   * @item: 当前选中的那条数据
   * **/
  onModalShow = (record) => {
    this.setState({
      modalShow: true,
      nowDeviceId: record.id,
      nowData: record
    });
  }

  /**
   * 设备修改 操作
   * @param {obj} obj
   */
  onModalOk = (obj) => {
    this.setState({
      modalLoading: true,
    });
    http.put(`${BSS_ADMIN_URL}/api/product/stock/${this.state.nowData.id}/update`, tools.clearNull(obj))
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
          tools.dealFail(res);
          this.setState({ modalLoading: false });
        }
      })
      .catch(() => {
        this.setState({ modalLoading: false });
      });
  }

  /**
   * 获取机柜详情信息 查看和编辑时使用
   * @param {*} id 机柜id
   */
  getDetail (id) {
    http.get(`${BSS_ADMIN_URL}/api/product/devices/${id}/get`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            nowDataCabinet: res.data,
            modalShow: true,
            modalLoading: false,
          });
        } else {
          tools.dealFail(res);
          this.setState({
            modalLoading: false,
          });
        }
      })
      .catch(() => {
        this.setState({
          modalLoading: false,
        });
      });
  }

  // 关闭机柜增 修 弹窗
  onModalClose = () => {
    this.setState({
      modalShow: false,
    });
  }

  // 删除某一条网络设备
  onDel (id) {
    confirm({
      icon: <ExclamationCircleOutlined />,
      content: `确认要删除这条数据吗？`,
      onOk: () => {
        this.setState({ loading: true });
        http.delete(`${BSS_ADMIN_URL}/api/product/stock/${id}/delete`)
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
  batchDel () {
    if (this.selectedRows.length <= 0) {
      Modal.warning({
        title: '请至少选择一条数据！'
      });
      return;
    }
    confirm({
      icon: <ExclamationCircleOutlined />,
      content: `确认执行批量删除操作吗？`,
      onOk: () => {
        let ids = [];
        console.log(this.selectedRows);
        _.map(this.selectedRows, (item) => {
          ids.push(item.id);
        });
        console.log(ids);
        this.setState({ loading: true });
        http.delete(`${BSS_ADMIN_URL}/api/product/stock/alldel`, {
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
   * 机柜U位管理 模态框出现
   * @item: 当前选中的那条数据
   * **/
  onModalShowUBit (record) {
    this.setState({
      modalShowUBit: true,
      nowCabinetId: record.id,
    });
  }

  render () {
    const {lists, loading, page, pageSize, total, nowDeviceId, modalShow, modalLoading, nowData, selectedRowKeys} =  this.state;
    const u1 = User.getPermission() || [];
    return (
      <main className="mian">
        {/* 搜索 */}
        <div className="g-search">
          <Form ref={this.searchFormRef} name="searchbox" layout="inline" onFinish={(values) => {this.onSearch(values);}}>
            <Form.Item name="cabinet">
              <Input placeholder="机柜名称" allowClear/>
            </Form.Item>
            <Form.Item name="deviceName">
              <Input placeholder="设备名称" allowClear/>
            </Form.Item>
            <Form.Item name="deviceType">
              <Select
                style={{width: 150}}
                placeholder="设备类型" allowClear>
                {
                  _.map(SYS_DICT_NET_DEVICE.re_facility, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item name="ip">
              <Input placeholder="管理IP" allowClear/>
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
          {u1.includes('network-devices-delete') && <Button className="actions-btn" size="middle" onClick={() => {this.batchDel();}}>批量删除</Button>}
          {u1.includes('network-devices-add') && <Add updateList={() => {this.onGetListData();}}>
            <Button className="actions-btn" size="middle" >添加网络设备</Button>
          </Add>}
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
              selectedRowKeys,
              onChange: (selectedRowKeys, selectedRows) => {this.selectedRow(selectedRowKeys, selectedRows);}
            }}
          />
          <div className="g-pagination">
            <Pagination current={page} total={total} pageSize={pageSize}
              showSizeChanger
              showTotal={(total) => `共 ${total} 条`}
              onChange={(current, size) => {this.onPageChange(current, size);}}
              onShowSizeChange={(current, size) => {this.onPageSizeChange(current, size);}}/>
          </div>
        </div>
        <Modal
          title="修改网络设备"
          maskClosable={false}
          modalLoading={modalLoading}
          width="80%"
          destroyOnClose
          footer={null}
          onCancel={this.onModalClose}
          visible={modalShow}>
          <Edit
            onOk={this.onModalOk}
            onClose={this.onModalClose}
            defaultData={nowData}
            deviceId={nowDeviceId}></Edit>
        </Modal>
      </main>
    );
  }
}
