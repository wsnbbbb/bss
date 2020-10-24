/* eslint-disable react/prop-types */
/** User 系统管理/用户管理 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import {
  Form, Button, Input, Select, Table, Pagination, Tooltip, Divider, Modal, Tag,
} from 'antd';
import { ExclamationCircleOutlined, EyeOutlined, FormOutlined, DeleteOutlined, UnlockOutlined} from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import http from '@src/util/http';
import tools from '@src/util/tools'; // 工具
import {SYS_DICT_SERVER, SYS_DICT_COMMON} from '@src/config/sysDict'; // 系统字典
import {formItemLayout, pageConfig} from '@src/config/commvar'; // 全局变量
// ==================
// 所需的所有组件
// ==================
import SimpleUpload from '@src/containers/SimpleUpload';
import Add from './container/Add/index.js';
import Customer from '@src/pages/resources/ServerPart/customer';
import EditServer from './container/EditServer/index.js';
import ServerDetail from './container/ServerDetail';
import EditRam from './container/EditRam/index.js';
import EditHardDisk from './container/EditHardDisk/index.js';
import EditBusinessIp from './container/EditBusinessIp/index.js';
import NetCardTable from './container/NetCardTable';
import moment from 'moment';
import {User} from '@src/util/user.js';
import { text } from 'body-parser';
const { confirm } = Modal;
const { TextArea } = Input;
// 机房下的区域
// ==================
// Definition
// ==================
const { Option } = Select;
@inject('root')
@inject('serverDict')
@inject("areaResouse")
@observer
export default class List extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    deviceDict: P.any,
    serverDict: P.any,
    areaResouse: P.any,
  };
  searchFormRef = React.createRef();
  constructor (props) {
    super(props);
    this.selectedRows = []; // 选中的数据(用于模板入库||批量修改销售状态||预留)
    this.searchParam = {}; // 搜索条件，因为不需要条件更新来及时的重新渲染组件，所以不放在state中
    this.state = {
      lists: [], // 接口获取服务器信息
      loading: false, // 服务器数据正在加载中
      page: 1, // 当前第几页
      pageSize: 5, // 每页多少条
      total: 0, // 数据库总共多少条数据
      selectedRowKeys: [], // 选中行的ids
      modalShow: false,   // 控制入库的模态框显示
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      nowData: {}, // 当前选中服务器的信息，用于查看详情、修改
      modalEditShow: false, // 修改模态框
      modalSeeShow: false, // 查看详情状态模
      customerShow: false, // 预约客户模态框
      statusShow: false, // 批量修改销售状态
      subscribeCustomer: {}, // 预约选中的用户信息
      NetCardList: [], // 查询的当前操作服务器的网卡信息
      currentNetCard: {}, // 快捷方式编辑后的服务器网卡信息
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
    // 通用服务器型号
    if (Object.keys(this.props.serverDict.server_model).length <= 0) {
      this.props.serverDict.fetchServerModel();
    }
    // 通用服务器品牌
    if (Object.keys(this.props.serverDict.server_brand).length <= 0) {
      this.props.serverDict.fetchServerBrand();
    }
     // 服务器故障状态
     if (Object.keys(this.props.serverDict.server_fault_category).length <= 0) {
      this.props.serverDict.fetchServerFaultStatus();
    }
  }

  // 构建字段
  makeColumns () {
    const server_brand = this.props.serverDict.server_brand;
    const server_model = this.props.serverDict.server_model;
    const columns = [
      {
        title: '服务器类型',
        dataIndex: 'serverType',
        key: 'serverType',
        width: 110,
        render: (text, record) => SYS_DICT_SERVER.se_unittype[text] || '未知类型'
      },
      {
        title: '管理IP',
        dataIndex: 'serverIp',
        key: 'serverIp',
        width: 150,
        render: (text, record, index) => <span className="mytag light-blue"
          onClick={() => {this.onModalShowEdit('see', record.id);}}>{text}</span>
      },
      // {
      //   title: '机房',
      //   dataIndex: 'houseId',
      //   key: 'houseId',
      //   render: (text) => {
      //     let house = _.find(this.props.areaResouse.houseList, (item) => item.id == text);
      //     return house && house.fullName;
      //   }
      // },
      {
        title: '区域',
        dataIndex: 'locationId',
        key: 'locationId',
        render: (text) => {
          let house = _.find(this.props.areaResouse.vareaList, (item) => item.fullLocationId == text);
          return house && house.fullLocationName;
        }
      },
      {
        title: '机柜号',
        dataIndex: 'cabinetsName',
        key: 'cabinetsName',
        width: 100,
      },
      {
        title: '内存(G)',
        width: 120,
        dataIndex: 'serverCurrentMemory',
        key: 'serverCurrentMemory',
        render: (text, record) => <EditRam Serverinfo={record}
          canOpt={record.status != 2} // 已售，不允许修改
          updateList={this.onGetListData}><span className="mytag light-blue">内存：{text}</span></EditRam>
      },
      {
        title: '硬盘(G)',
        width: 120,
        dataIndex: 'serverCurrentDisk',
        key: 'serverCurrentDisk',
        render: (text, record) => <EditHardDisk Serverinfo={record}
          canOpt={record.status != 2} // 已售，不允许修改
          updateList={this.onGetListData}><span className="mytag light-blue">硬盘：{text}</span></EditHardDisk>
      },
      {
        title: '网卡',
        dataIndex: 'networkNumber',
        key: 'networkNumber',
        width: 80,
        render: (text, record) => <span className="mytag light-blue" onClick={() => {this.onModalShowNetCard(record);}}>{text}</span>
      },
      {
        title: 'CPU个数',
        dataIndex: 'serverCpu',
        key: 'serverCpu',
        width: 70,
        render: (text, record) => {
          return record.serverCpuSlot;
        }
      },
      {
        title: 'CPU型号',
        dataIndex: 'serverCpus',
        key: 'serverCpus',
        width: 200,
        render:(text,record)=>{
          if (record.serverCpus) {
            return record.serverCpus[0].cpuName;
          }
          return 'UNKNOW';
        }
      },
      // {
      //   title: '业务IP',
      //   dataIndex: 'ipUseRecords',
      //   key: 'ipUseRecords',
      //   width: 160,
      //   render: (text, record) => <EditBusinessIp data={text}></EditBusinessIp>
      // },
      // {
      //   title: '规格',
      //   dataIndex: 'serverSpec',
      //   key: 'serverSpec',
      //   width: 120,
      // },
      // {
      //   title: '服务器名称',
      //   dataIndex: 'serverName',
      //   key: 'serverName',
      //   render: (text, record) => {
      //     // 规则：品牌_型号_规格
      //     let modal = server_model[record.serverModel] || undefined;
      //     let brand = server_brand[record.serverBrand] || undefined;
      //     return `${brand}_${modal}_${record.serverSpec}`;
      //   }
      // },
      {
        title: '销售状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (text) => tools.renderStatus(SYS_DICT_SERVER.market, text)
      },
      {
        title: '品牌',
        dataIndex: 'serverModel',
        key: 'serverModel',
        width: 100,
        render: (text, record) => {
          let brand = server_brand[record.serverBrand] || undefined;
          return brand;
        }
      },
      {
        title: '型号',
        dataIndex: 'serverBrand',
        key: 'serverBrand',
        width: 100,
        render: (text, record) => {
          let modal = server_model[record.serverModel] || undefined;
          return modal;
        }
      },
      {
        title: '业务类型',
        dataIndex: 'businessTypes',
        key: 'businessTypes',
        width: 120,
        render: (text, record) => record.businessTypes && record.businessTypes.name || 'UNKNOW'
      },
      {
        title: '服务器状态',
        dataIndex: 'serverStatus',
        key: 'serverStatus',
        width: 110,
        render: (text) => tools.renderStatus(SYS_DICT_SERVER.server_status, text)
      },
      {
        title: 'Raid卡',
        dataIndex: 'raidName',
        key: 'raidName',
        width: 120,
      },
      {
        title: '发布状态',
        dataIndex: 'releaseStatus',
        key: 'releaseStatus',
        width: 100,
        render: (text, record) => SYS_DICT_SERVER.releaseStatus[text] || 'unknow'
      },
      {
        title: '备注',
        dataIndex: 'remarks',
        key: 'remarks',
        width: 100,
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
                <EyeOutlined onClick={() => {this.onModalShowEdit('see', record.id);}}></EyeOutlined>
              </Tooltip>
            </span>
          );
          User.hasPermission('server-update') && record.status != 2 &&
          controls.push(
            <span
              key="1"
              className="control-btn blue"
            >
              <Tooltip placement="top" title="修改">
                <FormOutlined onClick={() => {this.onModalShowEdit('up', record.id);}}></FormOutlined>
              </Tooltip>
            </span>
          );
          User.hasPermission('server-update') && record.status == 2 &&
          controls.push(
            <span
              key="1"
              className="control-btn blue"
            >
              <Tooltip placement="top" title="修改备注">
                <FormOutlined onClick={() => {this.onModalShowRemark(record);}}></FormOutlined>
              </Tooltip>
            </span>
          );
          User.hasPermission('server-del1') && record.status != 2;
          controls.push(
            <span
              key="2"
              className="control-btn red"
            >
              <Tooltip placement="top" title="删除">
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

  // 导出
  export = () => {
    tools.download(`${BSS_ADMIN_URL}/api/product/server/excel/export`, this.searchParam);
  }
  // 查询当前页面所需列表数据
  onGetListData = (values) => {
    const params = _.assign({}, {
      page: this.state.page,
      pageSize: this.state.pageSize,
    }, this.searchParam, {
      ...values
    });
    this.setState({
      loading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/product/server`, {
      params: tools.clearEmpty(params)
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.selectedRows = [];
          this.setState({
            lists: res.data.records,
            total: res.data.total,
            loading: false,
            selectedRowKeys: []
          });
        } else {
          this.setState({ loading: false });
          tools.dealFail(res);
        }
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
    this.searchParam = tools.clearEmpty(values);
    this.setState({
      page: 1,
    });
    this.onGetListData(this.searchParam);
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
   * 入库/模板入库 模态框出现
   * @item: 当前选中的那条数据
   * @type: 入库/tempadd模板入库
   * **/
  onModalShow (type) {
    let tempdata = {
      serverType: 1,
      serverUs: 1, // 服务器占一个节点 或者 u位
      networkNumber: 3,
      status: 1, // 未售
      serverStatus: 2, // 关机

    };
    // 模板入库
    if (type == 'tempadd' && this.state.selectedRowKeys.length != 1) {
      Modal.warning({
        title: '请选择一条数据作为模板'
      });
      return false;
    }
    if (type == 'tempadd') {
      let selectedRow = this.selectedRows[0];
      tempdata = {
        "remarks": selectedRow.remarks,
        "serverBrand": selectedRow.serverBrand,
        "serverModel": selectedRow.serverModel,
        "serverType": selectedRow.serverType || 1, // 默认是通用服务器
        "serverDiskSpec": selectedRow.serverDiskSpec,
        "serverDiskHot": selectedRow.serverDiskHot,
        "serverDiskSlot": selectedRow.serverDiskSlot,
        "diskInterfaceType": selectedRow.diskInterfaceType,
        "serverOneMemory": selectedRow.serverOneMemory,
        "serverMemorySlot": selectedRow.serverMemorySlot,
        "serverCpuSlot": selectedRow.serverCpuSlot,
        "serverMaxMemory": selectedRow.serverMaxMemory,
        "serverMemoryType": selectedRow.serverMemoryType,
        "serverMemorySpec": selectedRow.serverMemorySpec,
        "serverUs": 1,
        "serverUseType": selectedRow.serverUseType,
        "status": selectedRow.status,
        "market": selectedRow.market,
        "showMode": selectedRow.showMode,
        "businessType": selectedRow.businessType,
        "networkNumber": selectedRow.networkNumber || 3, // 默认三张网卡
        // "isRaid": selectedRow.isRaid,
        // "isUseRaid": selectedRow.isUseRaid,
        "releaseStatus": selectedRow.releaseStatus
      };
    }
    this.setState({
      nowData: tempdata,
      modalShow: true
    });
  }

  // 批量修改销售状态
  onStatusShow () {
    if (this.state.selectedRowKeys.length < 1) {
      Modal.warning({
        title: '请选择至少一条服务器信息'
      });
      return false;
    }

    this.setState({
      statusShow: true,
    });
  }

  // TODO 暂时未上线
  onStatusOk (obj) {
    if (obj.status == undefined) {
      return;
    }
    this.setState({
      modalLoading: true,
    });
    let params = [];
    _.map(this.selectedRows, (item) => {
      params.push({
        serverId: item.id,
        version: item.version,
        saleStatus: obj.status,
      });
    });
    http.post(`${BSS_ADMIN_URL}/api/product/server/batch/status`, params)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          tools.auto_close_result('ok', '操作成功');
          this.setState({
            modalLoading: false,
            statusShow: false,
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
   * 编辑和修改 模态框出现
   * @serverId: 服务器id
   * @type: up|see
   * **/
  onModalShowEdit (type, serverId) {
    this.getDetail(type, serverId);
  }

  /**
   * 编辑备注
   * **/
  onModalShowRemark (record) {
    this.setState({
      nowData: record,
      remarksShow: true
    });
  }

  /**
   * 展示网卡
   * @record: 服务器当前服务信息
   * **/
  onModalShowNetCard (record) {
    this.setState({loading: true});
    http.get(`${BSS_ADMIN_URL}/api/product/server/network`,
      {params: { serverId: record.id }})
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let data = res.data;
          this.setState({
            nowData: record,
            NetCardList: data,
            onModalShowNetCard: true,
            loading: false,
          });
        } else {
          this.setState({
            loading: false,
          });
          tools.dealFail(res);
        }
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
      });
  }

  /**
   * 确认修改网卡
   * **/
  onNetCardOk  () {
    if (this.state.currentNetCard.length == 0) {
      Modal.warning({
        title: '没有数据发生变更！'
      });
      return;
    }
    let param = [];
    _.map(this.state.currentNetCard, (item) => {
      param.push(tools.clearNull({
        id: item.id,
        serverId: item.serverId,
        network: item.network,
        networkDeviceId: item.networkDevice && item.networkDevice.id,
        networkDevicePort: item.devicePort && item.devicePort.id,
        status: item.status,
        speed: item.speed,
        isIpmi: item.isIpmi,
        interfaceType: item.interfaceType,
        version: item.version,
      }));
    });
    this.setState({
      modalLoading: true,
    });
    http.put(`${BSS_ADMIN_URL}/api/product/server/network/batch/edit`, param)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          tools.auto_close_result('ok', '操作成功');
          this.setState({
            modalLoading: false,
            onModalShowNetCard: false,
          });
          this.onGetListData();
        } else {
          this.setState({ modalLoading: false});
          tools.dealFail(res);
        }
      })
      .catch(() => {
        this.setState({ modalLoading: false });
      });
  }
  // 暂存网卡变更信息
  changeNetCard (currentNetCard) {
    this.setState({
      currentNetCard: currentNetCard
    });
  }

  /**
   * 确认编辑备注
   * **/
  onRemarkOk (record) {
    let params = {
      "server": {
        ...record,
        version: this.state.nowData.version
      }
    };
    this.setState({
      modalLoading: true,
    });
    http.put(`${BSS_ADMIN_URL}/api/product/server/${this.state.nowData.id}/edit`, tools.clearNull(params))
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          tools.auto_close_result('ok', '操作成功');
          this.setState({
            modalLoading: false,
            remarksShow: false,
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


  // 预留 弹窗显示
  onReserveShow=() => {
    let len = this.selectedRows.length;
    if (len <= 0) {
      Modal.warning({
        title: '请至少选择一条可用的数据',
        content: '',
      });
      return false;
    }
    let canReserve = true;
    this.selectedRows.forEach((item) => {
      // 未售的可预留
      if (item.status != 1) {
        canReserve = false;
      }
    });
    if (!canReserve) {
      Modal.warning({
        title: '请选择可用的数据预约',
        content: '',
      });
      return false;
    }
    this.setState({
      customerShow: true,
    });
  }

  // 选中用户
  onSelectCustomer = (value) => {
    this.setState({
      subscribeCustomer: value[0],
    });
  }

  /**
 * 确定预留
 * **/
  setReserveCustomer () {
    console.log('缺少接口');
    // this.setState({
    //   modalLoading: true,
    // });
    // http.post(`${BSS_ADMIN_URL}/api/product/server/add`, tools.clearNull(obj))
    //   .then((res) => {
    //     res = res.data;
    //     if (tools.hasStatusOk(res)) {
    //       this.setState({
    //         modalLoading: false,
    //         modalShow: false,
    //       });
    //       this.onGetListData();
    //     } else {
    //       tools.dealFail(res);
    //     }
    //     this.setState({ modalLoading: false });
    //   })
    //   .catch(() => {
    //     this.setState({ modalLoading: false });
    //   });
  }

  /**
 * 获取服务器详情信息 查看和编辑时使用
 * @param {*} id 服务器id
 * @param {*} type 服务器up或者see
 */
  getDetail (type, id) {
    this.setState({loading: true});
    http.get(`${BSS_ADMIN_URL}/api/product/server/${id}/get`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let data = res.data;
          // 前端生成服务器名称
          const server_brand = this.props.serverDict.server_brand;
          const server_model = this.props.serverDict.server_model;
          let modal = server_model[data.serverModel] || undefined;
          let brand = server_brand[data.serverBrand] || undefined;
          let serverName = `${brand}_${modal}_${data.serverSpec}`;
          data['serverName'] = serverName;
          data['purchasingTime'] = moment(data.purchasingTime);
          data['storageTime'] = moment(data.storageTime);
          if (type == 'see') {
            this.setState({
              nowData: data,
              modalSeeShow: true,
              loading: false,
            });
            return;
          } else {
            this.setState({
              nowData: data,
              modalEditShow: true,
              loading: false,
            });
            return;
          }
        } else {
          this.setState({ loading: false});
          tools.dealFail(res);
        }
      })
      .catch(() => {
        this.setState({ loading: false});
      });
  }

  /**
   * 服务器入库操作
   * @param {obj} obj
   */
  onModalOk (obj) {
    this.setState({
      modalLoading: true,
    });
    http.post(`${BSS_ADMIN_URL}/api/product/server/add`, tools.clearNull(obj))
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
   * 服务器入库操作
   * @param {obj} obj
   */
  onModalEditOk (obj) {
    this.setState({
      modalLoading: true,
    });
    http.put(`${BSS_ADMIN_URL}/api/product/server/${this.state.nowData.id}/edit`, tools.clearNull(obj))
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          tools.auto_close_result('ok', '操作成功');
          this.setState({
            modalLoading: false,
            modalEditShow: false,
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

  // 关闭服务器增 修弹窗
  onModalClose () {
    this.setState({
      modalShow: false,
      modalEditShow: false,
      modalSeeShow: false,
      customerShow: false,
      remarksShow: false,
      onModalShowNetCard: false,
      statusShow: false,
    });
  }

  // 批量出库
  batchDel () {
    if (this.state.selectedRowKeys.length <= 0) {
      Modal.warning({
        title: '请至少选择一条数据!'
      });
      return false;
    }
    confirm({
      icon: <ExclamationCircleOutlined />,
      content: `确认要执行批量删除吗？`,
      onOk: () => {
        this.setState({ loading: true });
        http.delete(`${BSS_ADMIN_URL}/api/product/server/batch/delete`, {
          data: {serverIds: this.state.selectedRowKeys}
        })
          .then((res) => {
            res = res.data;
            if (tools.hasStatusOk(res)) {
              tools.auto_close_result('ok', '操作成功');
              this.onGetListData();
              this.setState({
                selectedRowKeys: []
              });
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
  // 删除某一条服务器数据
  onDel (id) {
    confirm({
      icon: <ExclamationCircleOutlined />,
      content: `确认要删除这条数据吗？`,
      onOk: () => {
        this.setState({ loading: true });
        http.delete(`${BSS_ADMIN_URL}/api/product/server/${id}/delete`)
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
  onSelectedRow (selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys: selectedRowKeys,
    });
    this.selectedRows = selectedRows;
  }

  render () {
    const {houseList, vareaList } = this.props.areaResouse;
    const {lists, loading, page, pageSize, total, nowData, selectedRowKeys, subscribeCustomer} =  this.state;
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
            <Form.Item name="serverType">
              <Select
                style={{width: 150}}
                placeholder="设备类型" allowClear>
                {
                  _.map(SYS_DICT_SERVER.se_unittype, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item name="cabinetName">
              <Input placeholder="机柜名称" allowClear/>
            </Form.Item>
            {/* <Form.Item name="customerName">
              <Input placeholder="客户名" allowClear/>
            </Form.Item> */}
            <Form.Item name="serverIp">
              <Input placeholder="管理IP" allowClear/>
            </Form.Item>
            <Form.Item name="businessIp">
              <Input placeholder="业务IP" allowClear/>
            </Form.Item>
            <Form.Item name="status">
              <Select
                style={{width: 150}}
                placeholder="销售状态" allowClear>
                {
                  _.map(SYS_DICT_SERVER.market, (item, key) => <Option value={parseInt(key)} key={key} > {item.text} </Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item name="serverStatus">
              <Select
                style={{width: 150}}
                placeholder="服务器状态" allowClear>
                {
                  _.map(SYS_DICT_SERVER.server_status, (item, key) => <Option value={parseInt(key)} key={key} > {item.text} </Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item name="releaseStatus">
              <Select
                style={{width: 150}}
                placeholder="发布状态" allowClear>
                {
                  _.map(SYS_DICT_SERVER.releaseStatus, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                }
              </Select>
            </Form.Item>
            {/* <Form.Item name="isUseRaid">
              <Select
                style={{width: 150}}
                placeholder="是否有RAID卡" allowClear>
                {
                  _.map(SYS_DICT_COMMON.bool, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                }
              </Select>
            </Form.Item> */}
            <Form.Item name="serverUseType">
              <Select
                style={{width: 150}}
                placeholder="用途" allowClear>
                {
                  _.map(SYS_DICT_SERVER.server_useage, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item name="remarks">
              <Input placeholder="备注" allowClear style={{width: 300}}/>
            </Form.Item>
            <Form.Item shouldUpdate>
              <Button type="primary" htmlType="submit" >搜索</Button>
            </Form.Item>
            <Form.Item shouldUpdate>
              <Button type="primary" onClick={this.onResetSearch} >重置</Button>
            </Form.Item>
          </Form>
        </div>
        {/* 操作 */}
        <div className="g-operate">
          {User.hasPermission('server-del') && <Button className="actions-btn" size="middle" onClick={() => {this.batchDel();}}>批量出库</Button>}
          {User.hasPermission('server-add') && <Button className="actions-btn" size="middle" onClick={() => {this.onModalShow('add');}}>服务器入库</Button>}
          {User.hasPermission('server-add') && <Button className="actions-btn" size="middle" onClick={() => {this.onModalShow('tempadd');}}>服务器模板入库</Button>}
          {User.hasPermission('server-update') && <Button className="actions-btn" size="middle" onClick={() => {this.onStatusShow();}}>批量修改销售状态</Button>}
          <Button onClick={this.export} className="actions-btn" size="middle" >导出</Button>
          <Button onClick={() => {tools.download(`${BSS_ADMIN_URL}/api/product/server/template/download`);}} className="actions-btn" size="middle" >下载模板</Button>
          {User.hasPermission('server-update') && <SimpleUpload filetext="上传模板" url={`${BSS_ADMIN_URL}/api/product/server/excel/import`}><Button className="actions-btn" size="middle">服务器导入</Button></SimpleUpload>}
          <Button disabled size="middle" onClick={() => {this.onReserveShow();}}>预留</Button>
          {/* <button>设置表头</button> */}
        </div>
        {/* 数据展示 */}
        <div className="g-table">
          <Table
            scroll={{x: 2200}}
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
              {...pageConfig}
              showSizeChanger
              showTotal={(total) => `共 ${total} 条`}
              onChange={(current, size) => {this.onPageChange(current, size);}}
              onShowSizeChange={(current, size) => {this.onPageSizeChange(current, size);}}
            />
          </div>
        </div>
        <Modal
          title="服务器入库"
          maskClosable={false}
          width="90%"
          destroyOnClose
          footer={null}
          onCancel={() => this.onModalClose()}
          visible={this.state.modalShow}
          modalLoading={this.state.modalLoading}>
          {/* 外机入库和模板入库 */}
          <Add
            data={nowData}
            onOk={(v) => this.onModalOk(v)}
            onClose={() => this.onModalClose()}
          ></Add>
        </Modal>
        <Modal
          title="服务器编辑"
          maskClosable={false}
          width="90%"
          destroyOnClose
          footer={null}
          onCancel={() => this.onModalClose()}
          visible={this.state.modalEditShow}
          modalLoading={this.state.modalLoading}>
          <EditServer
            data={nowData}
            onOk={(v) => this.onModalEditOk(v)}
            onClose={() => this.onModalClose()}
          ></EditServer>
        </Modal>
        <Modal
          title="服务器查看"
          maskClosable={false}
          width="90%"
          destroyOnClose
          footer={null}
          onCancel={() => this.onModalClose()}
          visible={this.state.modalSeeShow}
          modalLoading={this.state.modalLoading}>
          <ServerDetail
            data={nowData}
            onClose={() => this.onModalClose()}
          ></ServerDetail>
        </Modal>
        {/* 预约 */}
        <Modal
          visible={this.state.customerShow}
          width={500}
          destroyOnClose
          onCancel={() => {this.onModalClose;}}
          onOk={this.onCutomerok}
          title="选择预约方"
          okText="确定"
          cancelText="取消"
        >
          <Form className="g-modal-field">
            <Form.Item label="预约客户" {...formItemLayout}>
              <Input
                placeholder="请选择"
                disabled
                style={{width: 120}}
                value={subscribeCustomer.name}>
              </Input>
              <Button style={
                { display: "inline-block" }
              }>
                <Customer onSelect={this.onSelectCustomer}>
                      选择
                </Customer>
              </Button>
            </Form.Item>
          </Form>
        </Modal>
        {/* 已售服务器只能改备注 */}
        <Modal
          visible={this.state.remarksShow}
          modalLoading={this.state.modalLoading}
          width={600}
          destroyOnClose
          onCancel={() => {this.onModalClose();}}
          footer={false}
          title="修改服务器备注"
        >
          <Form className="g-modal-field"
            initialValues={{remarks: nowData && nowData.remarks}}
            onFinish={(values) => {this.onRemarkOk(values);}}>
            <Form.Item label="备注" name="remarks" {...formItemLayout}>
              <TextArea
                placeholder="请输入"
                maxLength={250}
              >
              </TextArea>
            </Form.Item>
            <div className="actions-btn">
              <Button htmlType="submit" className="action-btn ok">确认提交</Button>
              <Button onClick={() => {this.onModalClose();}} className="action-btn ok">取消</Button>
            </div>
          </Form>
        </Modal>
        {/* 批量修改销售状态*/}
        <Modal
          visible={this.state.statusShow}
          modalLoading={this.state.modalLoading}
          width={600}
          destroyOnClose
          onCancel={() => {this.onModalClose();}}
          footer={false}
          title="批量修改销售状态"
        >
          <Form className="g-modal-field"
            onFinish={(values) => {this.onStatusOk(values);}}>
            <Form.Item label="销售状态" name="status"
              rules={[{ required: true}]}
              {...formItemLayout}>
              <Select
                placeholder="销售状态" allowClear>
                {
                  _.map(SYS_DICT_SERVER.market, (item, key) => <Option value={parseInt(key)} key={key} disabled={key == 2}> {item.text} </Option>)
                }
              </Select>
            </Form.Item>
            <div className="actions-btn">
              <Button htmlType="submit" className="action-btn ok">确认提交</Button>
              <Button onClick={() => {this.onModalClose();}} className="action-btn ok">取消</Button>
            </div>
          </Form>
        </Modal>
        {/* 网卡连接都可以修改 */}
        <Modal
          visible={this.state.onModalShowNetCard}
          modalLoading={this.state.modalLoading}
          width="90%"
          destroyOnClose
          onCancel={() => {this.onModalClose();}}
          onOk={() => {this.onNetCardOk();}}
          title="修改服务器网卡连接"
        >
          <NetCardTable serverInfo={nowData} houseId={nowData && nowData.houseId}
            NetCardList={this.state.NetCardList}
            setSolts={(currentNetCard) => {this.changeNetCard(currentNetCard);}}
          ></NetCardTable>
        </Modal>
      </main>
    );
  }
}
