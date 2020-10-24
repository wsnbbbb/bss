/* eslint-disable react/prop-types */
/** User 系统管理/用户管理 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import {
  Button,
  Tag,
  Spin,
  Popover,
  Modal,
  message
} from 'antd';
import { ExclamationCircleOutlined, PlusOutlined, WarningOutlined, LockOutlined} from '@ant-design/icons';
import { observer} from 'mobx-react';
import './index.less';
import http from '@src/util/http';
import tools from '@src/util/tools'; // 工具
// ==================
// 所需的所有组件
// ==================
import {User} from "@src/util/user";
import {SYS_DICT_CABINET} from "@src/config/sysDict";
import Add from './container/add';
import SimpleUpload from '@src/containers/SimpleUpload';
import Device from './container/Device';
import RegionInput from '@src/pages/resources/container/RegionInput';
import UBitManage from '@src/pages/resources/Cabinet/UBitManage';
import { useDrag, useDrop } from 'react-dnd';
import moment from 'moment'
function getamp (string) {
  if (!string) {
    return [undefined, undefined];
  }
  let index = string.search(/KVA|KW|A/i);
  let apm;
  let unit;
  if (index != -1) {
    apm = string.slice(0, index);
    unit = string.slice(index);
  }
  return [apm, unit];
}
const type = 'DragbleBodyRow1';
const { confirm } = Modal;
// 可放置的机柜组件
const DropCabiner = ({ index, moveRow, className, style, record, ...restProps }) => {
  const refbox = React.useRef();
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: (monitor) => {
      const { index: dragIndex} = monitor.getItem() || {};
      if (dragIndex === index) {
        return {};
      }
      return {
        begainItem: monitor.getItem(),
        isOver: monitor.isOver(),
        dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
      };
    },
    drop: (item) => {
      moveRow(item);
    },
  });
  drop(refbox);
  return (
    <td
      ref={refbox}
      className={`${className}${isOver ? dropClassName : ''}`}
      style={{ cursor: 'move', ...style }}
      {...restProps}
    />
  );
};
// 可拖动的机柜组件
const DragableCabiner = ({ index, moveRow, className, style, record, ...restProps }) => {
  const ref = React.useRef();
  const [, drag] = useDrag({
    item: { type, index, record},
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    beginDrag: (props, monitor, component) => {
      const record = props.record;
      return {record};
    },
  });
  drag(ref);
  return (
    <td
      ref={ref}
      className={`${className}`}
      style={{ cursor: 'move', ...style }}
      {...restProps}
    />
  );
};


// 区域下的机柜分布图
@observer
// @DropTarget(type, spec, collect)
export default class List extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
  };
  searchFormRef = React.createRef();
  constructor (props) {
    super(props);
    this.state = {
      searchParam: {}, // 搜索条件
      lists: [], // 接口获取机柜信息不包含空机柜
      loading: false, // 机柜数据正在加载中
      cabinetMap: {}, // 转化为字典类型的机柜信息不包含空机柜
      rowArr: [],
      colArr: [],
      operateType: 'add', // 操作类型 add新增，up修改, see查看
      modalShow: false,   // 机房增 修 查 状态模的显示
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      nowDataCabinet: {}, // 当前选中机柜的信息，用于查看详情、修改、机柜U位管理
      nowCabinetId: '',  // 当前选中的机柜id 机柜u位管理组件使用
      modalShowUBit: false,   // U位管理 状态模的显示
      modalLoadingUBit: false, //  U位管理否正在请求中
      regionInfo: {},
      changeData: {}, // 查看交换机数据
      showChang: false // 查看交换机
    };
  }
  componentDidMount () {
  }

  // 对机柜数据进行转换，便于页面展示
  makeCabinetMap = (list, row, col) => {
    let cabinetMap = {};
    let rowArr = [];
    let colArr = [];
    for (let colindex = 1; colindex <= col; colindex++) {
      colArr.push(colindex);
    }
    for (let rowindex = 1; rowindex <= row; rowindex++) {
      rowArr.push(rowindex);
    }
    _.map(list, (item) => {
      let xb = `${item.row}-${item.coulmn}`;
      cabinetMap[xb] = item;
    });
    return {
      cabinetMap: cabinetMap, // 被占用的数据
      rowArr: rowArr,
      colArr: colArr,
    };

  }

  // 查询当前页面所需列表数据
  onGetListData (values) {
    // 区域的数据
    values = values || this.state.regionInfo;
    if (!values.regionId || !values.record.row || !values.record.col) {
      return false;
    }
    const row = values.record.row;
    const col = values.record.col;
    const params = _.assign({}, {
      regionId: values.regionId,
    },
    this.state.searchParam);
    this.setState({ loading: true,
      regionInfo: values,
    });
    http.get(`${BSS_ADMIN_URL}/api/product/cabinet`, {params: params})
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let cabinetMap = this.makeCabinetMap(res.data, row, col);
          this.setState({
            lists: res.records,
            cabinetMap: cabinetMap.cabinetMap,
            rowArr: cabinetMap.rowArr,
            colArr: cabinetMap.colArr,
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
  onSearch (value, record) {
    console.log(record);
    this.obj = record.record;
    this.onGetListData(record);
  }

  /**
   * 添加/修改/查看 模态框出现
   * @item: 当前选中的那条数据
   * @type: add添加/up修改/see查看
   * **/
  onModalShow (type, data) {
    if (type == 'add') {
      let amp = getamp(this.obj.amp);
      const defaultData = {
        row: data.row,
        coulmn: data.coulmn,
        name: null,
        us: this.obj.cabinetUCount,
        spec: this.obj.spec,
        voltage: this.obj.voltage,
        amp: amp[0],
        voltageUnit: amp[1],
        power: null,
        bearing: this.obj.bearing,
        pdu: this.obj.pdu,
        attribute: null,
        locationId: null,
        regionId: null,
        remark: null,
        type: null,
        status: null,
        beginDate: null,
        endData: null,
      };
      this.setState({
        modalShow: true,
        nowDataCabinet: defaultData,
        operateType: type
      });
    } else {
      this.getDetail(data.id, type);
    }

  }

  /**
   * 机柜执行 增 修 操作
   * @param {obj} obj
   */
  onModalOk (obj) {
    this.setState({
      modalLoading: true,
    });
    if (this.state.operateType == 'add') {
      let param = {
        ...obj,
        districtId: this.state.regionInfo.districtId,
        houseId: this.state.regionInfo.houseId,
        regionId: this.state.regionInfo.regionId,
        type: 0,
      };
      http.post(`${BSS_ADMIN_URL}/api/product/cabinet/add`, tools.clearNull(param))
        .then((res) => {
          res = res.data;
          if (tools.hasStatusOk(res)) {
            this.setState({
              modalLoading: false,
              modalShow: false,
            });
            this.onGetListData();
            tools.auto_close_result('ok', '操作成功');
          } else {
            this.setState({
              modalShow: false,
            });
            tools.dealFail(res);
          }
          this.setState({ modalLoading: false });
        })
        .catch(() => {
          this.setState({
            modalShow: false,
          });
          this.setState({ modalLoading: false });
        });
    } else {
      let param = tools.clearNull({
        ...this.state.nowDataCabinet,
        ...obj
      });
      http.put(`${BSS_ADMIN_URL}/api/product/cabinet/${this.state.nowDataCabinet.id}/update`, tools.clearNull(param))
        .then((res) => {
          res = res.data;
          if (tools.hasStatusOk(res)) {
            this.setState({
              page: 1,
              modalLoading: false,
              modalShow: false,
            });
            this.onGetListData();
            tools.auto_close_result('ok', '操作成功');
          } else {
            this.setState({
              modalShow: false,
            });
            tools.dealFail(res);
          }
          this.setState({ modalLoading: false });
        })
        .catch(() => {
          this.setState({
            modalShow: false,
          });
          this.setState({ modalLoading: false });
        });
    }
  }

  /**
   * 获取机柜详情信息 查看和编辑时使用
   * @param {*} id 机柜id
   * @param {*} operateType 'up'|'see'
   */
  getDetail (id, operateType) {
    http.get(`${BSS_ADMIN_URL}/api/product/cabinet/${id}/get`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let amp = getamp(res.data.amp);
          console.log(res.data);
          this.setState({
            nowDataCabinet: {
              ...res.data,
              amp: amp[0],
              voltageUnit: amp[1],
            },
            modalShow: true,
            modalLoading: false,
            operateType: operateType,
          });
        } else {
          tools.dealFail(res);
        }
      })
      .catch(() => {
      });
  }
  // 添加障碍物
  setBarrier (record) {
    confirm({
      icon: <ExclamationCircleOutlined />,
      content: `确认添加障碍物`,
      onOk: () => {
        let params = {
          name: '障碍物',
          attribute: 6,
          coulmn: record.coulmn,
          row: record.row,
          us: 0,
          type: 1,
          regionId: this.state.regionInfo.regionId,
        };
        this.setState({ loading: true });
        http.post(`${BSS_ADMIN_URL}/api/product/cabinet/add`, params)
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
  // 移除障碍物
  removeBarrier (record) {
    confirm({
      icon: <ExclamationCircleOutlined />,
      content: `确认移除障碍物`,
      onOk: () => {
        this.setState({ loading: true });
        http.delete(`${BSS_ADMIN_URL}/api/product/cabinet/${record.id}/delete`)
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

  // 修改机柜状态
  setStatus (status, text, record) {
    confirm({
      icon: <ExclamationCircleOutlined />,
      content: `确认修改状态为${text}`,
      onOk: () => {
        this.setState({ loading: true });
        http.put(`${BSS_ADMIN_URL}/api/product/cabinet/${record.id}/update`,
          {
            status: status,
            version: record.version
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

  // 关闭机柜增 修 弹窗
  onModalClose () {
    this.setState({
      modalShow: false,
    });
  }

  // 删除某一条机柜数据
  onDel (id) {
    confirm({
      icon: <ExclamationCircleOutlined />,
      content: `确认要删除这条数据吗？`,
      onOk: () => {
        this.setState({ loading: true });
        http.delete(`${BSS_ADMIN_URL}/api/product/cabinet/${id}/delete`)
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


  /**
   * 机柜U位管理 模态框出现
   * @item: 当前选中的那条数据
   * **/
  onModalShowUBit (record) {
    this.setState({
      modalShowUBit: true,
      nowCabinetId: record.id,
      nowDataCabinet: record,
    });
  }
  // 查看交换机
  onShowChange (record) {
    this.setState({
      showChang: true,
      changeData: record,
    });
  }
  onCancel () {
    this.setState({
      showChang: false
    });
  }
  // 关闭增 修 弹窗
  onModalCloseUBit () {
    this.setState({
      modalShowUBit: false,
    });
  }

  /**
   * 执行移动行事件
   * @param {number} dragIndex 拖动开始位置下标
   * @param {number} hoverIndex 拖动存放位置下标
   * @param {obj} dragRecord 拖动的行数据
   * @param {obj} hoverRecord 存放位置对应的下一个行数据
   * @param {index} index 被存放位置index
   */
  moveRow = (dragRecord, hoverRecord) => {
    // 展示顺序未发生更改不做处理
    if (dragRecord.record.row == hoverRecord.row && dragRecord.record.coulmn ==  hoverRecord.coulmn) {
      return false;
    }
    this.setState({
      loading: true,
    });
    http.post(`${BSS_ADMIN_URL}/api/product/cabinet/${dragRecord.record.id}/move`, {
      ...hoverRecord,
      version: dragRecord.record.version
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            loading: false,
          });
          tools.auto_close_result('ok', '操作成功');
          this.onGetListData();
        } else {
          tools.dealFail(res);
        }
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };
  onLock = (record) => {
    let status = record.lockStatus;
    status === 0 ? status = 1 : status = 0;
    let obj = {lockStatus: status, version: record.version};
    this.setState({
      loading: true,
    });
    http
      .post(`${BSS_ADMIN_URL}/api/product/cabinet/${record.id}/lock`, tools.clearNull(obj))
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.onGetListData();
          message.success("修改状态成功");
          this.setState({
            loading: false,
          });
        } else {
          message.error(res.data);
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
  render () {
    const { loading, cabinetMap, rowArr, colArr} =  this.state;
    return (
      <main className="mian">
        <div className="clearfix">
          {/* 搜索 */}
          <div className="g-search" style={{width: 400, float: "left"}}>
            <RegionInput defaultKey={''} onSearch={(value, record) => {this.onSearch(value, record);}}></RegionInput>
          </div>
          {/* 操作 */}
          <div className="g-operate" style={{width: 200, float: "right"}}>
            {User.hasPermission('cabinet-u-edit') && <Button className="actions-btn" size="middle" onClick={() => {tools.download(`${BSS_ADMIN_URL}/api/product/cabinet/download/template`);}}>下载导入模板</Button>}
            {User.hasPermission('cabinet-u-edit') && <SimpleUpload filetext="上传模板" url={`${BSS_ADMIN_URL}/api/product/cabinet/import/template`}><Button className="actions-btn" size="middle">导入</Button></SimpleUpload>}
          </div>
        </div>
        {/* 数据展示 */}
        <div className="region-map">
          <div className="region-map-head clearfix">
            <div style={{float: 'right'}}>
              {
                _.map(SYS_DICT_CABINET.cabinet_status, (value, key) => <Tag key={key} color={value.color}>{value.text}</Tag>)
              }
            </div>
          </div>
          <div className="region-map-body">
            <Spin spinning={loading}>
              <table>
                <tbody>
                  {
                    _.map(rowArr, (row) => <tr key={row}>
                      {_.map(colArr, (col) => {
                        let xb = row + '-' + col;
                        let record = cabinetMap[xb];
                        // 有数据且是障碍物User.hasPermission('cabinet-u-view') &&
                        if (record && record.type === 1) {
                          return <Popover
                            title={'障碍物'}
                            trigger="click"
                            placement="right"
                            content={<ul className="opt-tooltip-box">
                              {User.hasPermission('cabinet-u-edit') && <li onClick={() => {this.removeBarrier(record);}} className="tooltip-inner" key={xb}>移除</li>}
                            </ul>}>
                            <td  className="td-box">
                              <div className="box box-barrier" title="障碍物">
                                <WarningOutlined />
                              </div>
                            </td>
                          </Popover>;
                        }
                        // 有数据是机柜
                        if (record && record.type === 0 && User.hasPermission('cabinet-u-view')) {
                          return <DragableCabiner
                            key={xb}
                            className="td-box"
                            record={record}
                            moveRow={(item) => {this.moveRow(item, record);}}
                          >
                            <Popover
                              trigger="click"
                              placement="right"
                              content={<ul className="opt-tooltip-box">
                                {User.hasPermission('cabinet-u-view') && <li onClick={() => {this.onModalShow('see', record);}} className="tooltip-inner">详情</li>}
                                {User.hasPermission('cabinet-u-edit') && <li onClick={() => {this.onModalShow('up', record);}} className="tooltip-inner">编辑</li>}
                                {User.hasPermission('cabinet-u-delete') && <li onClick={() => {this.onDel(record.id);}} className="tooltip-inner">删除</li>}
                                {User.hasPermission('cabinet-u-edit') && <li onClick={() => {this.onLock(record);}} className="tooltip-inner">{record.lockStatus === 0 ? "锁定" : "解锁"}</li>}
                                {User.hasPermission('cabinet-u-edit') && record.status != 0 && <li onClick={() => {this.setStatus(0, '已购未分配', record);}} className="tooltip-inner">已购未分配</li>}
                                {User.hasPermission('cabinet-u-edit') && record.status != 1 && <li onClick={() => {this.setStatus(1, '已分配未使用', record);}} className="tooltip-inner">已分配未使用</li>}
                                {User.hasPermission('cabinet-u-edit') && record.status != 2 && <li onClick={() => {this.setStatus(2, '已启用未分配', record);}} className="tooltip-inner">已启用未分配</li>}
                                {User.hasPermission('cabinet-u-edit') && record.status != 3 && <li onClick={() => {this.setStatus(3, '已使用', record);}} className="tooltip-inner">已使用</li>}
                                {User.hasPermission('network-devices-view') && <li className="tooltip-inner" onClick={() => {this.onShowChange(record);}}>交换机</li>}
                                {User.hasPermission('cabinet-u-view') && <li onClick={() => {this.onModalShowUBit(record);}} className="tooltip-inner">机柜U位管理</li>}
                              </ul>}
                              title={record.name}
                            >
                              <div className={`box cabinet-status-${record.status}`}>{record.lockStatus === 1 && <LockOutlined />}{record.name}</div>
                            </Popover>
                          </DragableCabiner>;
                        }
                        record = {
                          row: row,
                          coulmn: col
                        };

                        return <DropCabiner
                          key={xb}
                          className="td-box"
                          record={{
                            row: row,
                            coulmn: col
                          }}
                          moveRow={(item) => {this.moveRow(item, record);}}
                        >
                          <Popover
                            title={`行-列：${xb}`}
                            trigger="click"
                            placement="right"
                            content={<ul className="opt-tooltip-box">
                              {User.hasPermission('cabinet-u-add') && <li onClick={() => {this.onModalShow('add', record);}} className="tooltip-inner">添加</li>}
                              {User.hasPermission('cabinet-u-edit') && <li onClick={() => {this.setBarrier(record);}} className="tooltip-inner">设置障碍物</li>}
                            </ul>}
                          >
                            <div className="box"><PlusOutlined /></div>
                          </Popover>
                        </DropCabiner>;
                      })}
                    </tr>)
                  }
                </tbody>
              </table>
            </Spin>
          </div>
        </div>
        {/* 新增&修改&查看 模态框 因为机柜详细信息在子组件中不会涉及更新 所有数据由父组件传入*/}
        <Add
          visible={this.state.modalShow}
          modalLoading={this.state.modalLoading}
          data={this.state.nowDataCabinet}
          operateType={this.state.operateType}
          onOk={(v) => this.onModalOk(v)}
          onClose={() => this.onModalClose()}
        />
        {/* 机柜U位管理
        1.因为u位管理组件中有搜索，数据会根据搜索条件更新 所以只传机柜id过去，获取数据组件自己更新
        2.Modal 是在子组件中还是父组件中的思考：
        2.1如果modal定义在子组件中，则子组件只能是弹出形式使用
        2.2如果modal定义父组件中。则对应的子组件可放入弹框或者直接平铺显示，不受限。
        */}
        <Modal
          maskClosable={false}
          title={`${this.state.nowDataCabinet.name} 机柜U位管理`}
          destroyOnClose
          visible={this.state.modalShowUBit}
          width="90%"
          footer={false}
          onCancel={() => this.onModalCloseUBit()}
        >
          <UBitManage cabinetId={this.state.nowCabinetId}
          />
        </Modal>
        <Modal
          visible={this.state.showChang}
          title="交换机"
          width="90%"
          onCancel={() => this.onCancel()}
          onOk={() => this.onCancel()}
          footer={null}
          okText="确定"
          cancelText="取消"
          destroyOnClose
        >
          <Device  record={this.state.changeData}/>
        </Modal>
      </main>
    );
  }
}
