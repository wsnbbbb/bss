/* eslint-disable react/prop-types */

/** 资源管理/机柜U位管理 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import http from '@src/util/http';
import {
  Form,
  Button,
  Input,
  Tag,
  Table,
  Popconfirm,
  Modal,
  Tooltip,
  Divider,
  Row,
  Col
} from 'antd';
import { DeleteOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import { observer} from 'mobx-react';
import { withRouter } from 'react-router';
import {formItemLayout} from '@src/config/commvar'; // 全局通用变量
import {SYS_DICT_CABINET} from '@src/config/sysDict'; // 系统字典
import tools from '@src/util/tools'; // 工具
import UBitOptLog from '@src/pages/resources/Cabinet/UBitOptLog';
import Customer from '@src/pages/resources/ServerPart/customer';
import SeeNodeMater from '@src/pages/resources/OutsideMachine/container/See';
import {User} from "@src/util/user";
// ==================
// Definition
// ==================
const FormItem = Form.Item;
import { useDrag, useDrop } from 'react-dnd';
const type = 'DragbleBodyRow1';
const { confirm } = Modal;

/**
 * u位可以移动行组件
 * @param {obj} record 一条数据
 */
const DragableBodyRow = ({ index, moveRow, className, style, record, ...restProps }) => {
  const ref = React.useRef();
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
      moveRow(item.index, index, item);
    },
  });
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
  drop(drag(ref));
  return (
    <tr
      ref={ref}
      className={`${className}${isOver ? dropClassName : ''}`}
      style={{ cursor: 'move', ...style }}
      {...restProps}
    />
  );
};

@withRouter
@observer
class UBitManage extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    operateType: P.string,
    data: P.any,  // 当前选中的信息
    visible: P.bool, // 弹框是否显示
    loading: P.bool, // 添加/修改/查看 是否正在请求中
    onOk: P.func, // 弹框确认
    onClose: P.func, // 只关闭弹窗
  };
  formRefAdd = React.createRef();
  constructor (props) {
    super(props);
    this.selectAreaNode = {}; // 选中的地区节点信息
    this.selectedRows = []; // 选中行数据
    this.formRef = React.createRef();
    this.searchFormRef = React.createRef();
    this.state = {
      nowData: {}, // 获取的机柜数据
      lists: [], // 处理后的U位数据
      loading: false,
      modalShowArea: false,
      list2: [],
      customerShow: false,
      subscribeCustomer: '',
      type: '',
      selectedRows: [],
      selectedRowKeys: [],
    };
  }
  componentDidMount () {
    this.onGetListData();
  }

  onGetListData (param = {}) {
    let params = _.assign({}, this.searchCondition, { cabinetId: this.props.cabinetId }, param);
    this.setState({ loading: true});
    http.get(`${BSS_ADMIN_URL}/api/product/ulocation/list`, { params: tools.clearNull(params) })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let lists = res.data;
          this.selectedRows = [];
          this.setState({
            lists: lists,
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

  // 出库
  onDel (record) {
    let id = record.deviceId;
    let {lists} = this.state;
    let arr = [];
    lists.forEach((item) => {
      if (item.deviceId === id) {
        arr.push(item.id);
      }
    });
    http.delete(`${BSS_ADMIN_URL}/api/product/ulocation/allDel`, {data: arr})
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.onGetListData();
          tools.auto_close_result('ok', '操作成功');
        } else {
          tools.dealFail(res);
        }
        this.setState({
          loading: false,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
      });
  }
  // 批量出库
  outOfStock () {
    let {selectedRows} = this.state;
    let len = selectedRows.length;
    if (len <= 0) {
      Modal.warning({
        title: '请至少选择一条已占用的数据',
        content: '',
      });
      return false;
    }
    let status = [];
    selectedRows.forEach((item) => {
      status.push(item.status);
    });
    if (status.includes(3) === true || status.includes(1) === true) {
      Modal.warning({
        title: '请选择已占用的数据出库',
        content: '',
      });
      return false;
    }
    confirm({
      title: "你确定要出库吗？",
      icon: <ExclamationCircleOutlined />,
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk: () => {
        this.out();
      },
      onCancel () {
        console.log("Cancel");
      },
    });

  }
  // 批量出库
  out = () => {
    http.delete(`${BSS_ADMIN_URL}/api/product/ulocation/allDel`, {data: this.state.selectedRowKeys})
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.onGetListData();
          tools.auto_close_result('ok', '操作成功');
        } else {
          tools.dealFail(res);
        }
        this.setState({
          loading: false,
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
        });
      });
  }
  // 验证通过
  onFinish (values) {
    const { operateType } = this.props;
    if (operateType === 'see') {
      // 是查看
      this.props.onClose();
      return;
    }
    const {localInfo, ...rest} = values;
    this.props.onOk({
      ...rest,
      districtId: this.selectAreaNode.id,
    });
  }

  // 选择选中行
  selectedRow (selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
      selectedRowKeys
    });
    this.selectedRows = [];
    selectedRows.forEach((item) => {
      this.selectedRows.push({
        id: item.id,
        status: 3,
        version: item.version,
      });
    });
    // this.selectedRowKeys = selectedRowKeys;
  }
  // 预约
  onReserveShow=() => {
    let {selectedRows} = this.state;
    let len = selectedRows.length;
    if (len <= 0) {
      Modal.warning({
        title: '请至少选择一条可用的数据',
        content: '',
      });
      return false;
    }
    let status = [];
    selectedRows.forEach((item) => {
      status.push(item.status);
    });
    if (status.includes(3) === true || status.includes(0) === true) {
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
  // 确定预约
  onReserve =() => {
    let {subscribeCustomer} = this.state;
    this.selectedRows.forEach((item) => {
      item.subscribeCustomer = subscribeCustomer;
    });
    http.post(`${BSS_ADMIN_URL}/api/product/ulocation/allUpdate`, this.selectedRows)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            customerShow: false,
          });
          this.onGetListData();
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

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.searchFormRef.current.resetFields();
  };

  /** 点击关闭时触发 **/
  onClose = () => {
    this.props.onClose();
  };
  // 得到rowspan
  mergeCells2=(text, key, index) => {
    // 上一行该列数据是否一样
    let {lists} = this.state;
    if (index !== 0 && text === lists[index - 1][key]) {
      return 0;
    }
    let rowSpan = 1;
    // 判断下一行是否相等
    for (let i = index + 1; i < lists.length; i++) {
      if (text !== lists[i][key]) {
        break;
      }
      rowSpan++;
    }
    return rowSpan;
  }
  // 构建字段 机房
  makeColumns () {
    const columns = [
      {
        title: 'u位',
        dataIndex: 'uw',
        width: 80,
        key: 'uw',
      },
      {
        title: '管理ip',
        dataIndex: 'managerIp',
        width: 150,
        key: 'managerIp',
        render: (text, row, index) => {
          if (row.deviceId) {
            const obj = {
              children: text !== null ? text : '',
              props: {}
            };
            obj.props.rowSpan = this.mergeCells2(row.deviceId, 'deviceId', index);
            this.rowSpan = obj.props.rowSpan;
            return obj;
          } else {
            return {
              children: text !== null ? text : '',
              rowSpan: 0
            };
          }
        }
      },
      {
        title: '设备',
        dataIndex: 'deviceName',
        key: 'deviceName',
        render: (text, row, index) => {
          text = text !== null ? text : '';
          if (row.deviceId) {
            let chidren = text;
            // 如果外机,可以查看详情
            if (row.type == 3) {
              chidren = <SeeNodeMater deviceId={row.deviceId}><span className="mytag light-blue">{text}</span></SeeNodeMater>;
            }
            const obj = {
              children: chidren,
              props: {}
            };
            obj.props.rowSpan = this.rowSpan;
            return obj;
          } else {
            return {
              children: text,
              rowSpan: 0
            };
          }
        }
      },
      {
        title: '预约客户',
        dataIndex: 'customerName',
        key: 'customerName',
        render: (text, row, index) => {
          if (row.deviceId) {
            // 同一台网络设备 合并单元格
            const obj = {
              children: text,
              props: {}
            };
            obj.props.rowSpan = this.rowSpan;
            return obj;
          } else if (row.customerName) {
            // 同一个预约客户 合并单元格
            const obj = {
              children: text,
              props: {}
            };
            obj.props.rowSpan = this.mergeCells2(row.customerName, 'customerName', index);
            this.rowSpan = obj.props.rowSpan;
            return obj;

          } else {
            return {
              children: text,
              rowSpan: 0
            };
          }
        }
      },
      {
        title: '使用状态',
        dataIndex: 'status',
        width: 100,
        key: 'status',
        render: (text, row, index) => {
          let num = parseInt(text);
          if (row.deviceId) {
            const obj = {
              children: tools.renderStatus(SYS_DICT_CABINET.uw_status, num),
              props: {},
            };
            obj.props.rowSpan = this.rowSpan;
            return obj;
          } else if (row.customerName) {
            // 同一个预约客户 合并单元格
            const obj = {
              children: tools.renderStatus(SYS_DICT_CABINET.uw_status, num),
              props: {}
            };
            obj.props.rowSpan = this.mergeCells2(row.customerName, 'customerName', index);
            this.rowSpan = obj.props.rowSpan;
            return obj;
          } else {
            return {
              children: tools.renderStatus(SYS_DICT_CABINET.uw_status, num),
              rowSpan: 0
            };
          }
        }
      },
      {
        title: '出库记录',
        key: 'control',
        width: 80,
        render: (text, record) => <UBitOptLog uLocationId={record.id}></UBitOptLog>
      },
      {
        title: '操作',
        key: 'control',
        fixed: 'right',
        width: 60,
        render: (text, record) => {
          const controls = [];
          const u = User.getPermission() || [];
          if (record.status === 0) {
            u.includes('cabinet-u-edit') &&
            controls.push(
              <Popconfirm
                key="1"
                title="确定出库吗?"
                onConfirm={() => this.onDel(record)}
                okText="确定"
                cancelText="取消"
              >
                <span className="control-btn red">
                  <Tooltip placement="top" title="出库">
                    <DeleteOutlined></DeleteOutlined>
                  </Tooltip>
                </span>
              </Popconfirm>
            );
          }
          const result = [];
          controls.forEach((item, index) => {
            if (index) {
              result.push(<Divider key={`line${index}`} type="vertical" />);
            }
            result.push(item);
          });
          if (record.deviceId) {
            const obj = {
              children: result,
              props: {},
            };
            obj.props.rowSpan = this.rowSpan;
            return obj;
          } else {
            return {
              children: result,
              rowSpan: 0
            };
          }
        }
      }
    ];
    return columns;
  }

  // 自定义行元素
  components = {
    body: {
      row: DragableBodyRow,
    },
  };

  /**
   * 执行移动U位事件
   * @param {number} dragIndex 拖动开始位置下标
   * @param {number} hoverIndex 拖动存放位置下标
   * @param {obj} dragRecord.record 拖动的行数据
   * @param {obj} hoverRecord 存放位置对应的下一个行数据
   */
  moveRow = (dragIndex, hoverIndex, dragRecord, hoverRecord) => {
    dragRecord = dragRecord.record;
    // 顺序未发生更改不做处理
    if (dragIndex == hoverIndex) {
      return false;
    }
    let {lists} = this.state;
    let tindex = hoverIndex;
    let oriIds = [];
    let tarIds = [];
    oriIds.push(dragRecord.deviceId);
    tarIds.push(lists[tindex].id);
    let params = {
      oriIds: oriIds, // 被拖动的设备id
      tarIds: tarIds // 拖动的u位id
    };
    http.post(`${BSS_ADMIN_URL}/api/product/ulocation/move`, params)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.onGetListData();
        } else {
          tools.dealFail(res);
        }
        this.setState({ modalLoading: false });
      })
      .catch(() => {
        this.setState({ modalLoading: false });
      });
  };

  // 查询
  onSearch (values) {
    this.onGetListData(values);
  }
  onSelect = (value) => {
    this.formRef.current.setFieldsValue({
      customerName: value[0].name
    });
    this.setState({
      subscribeCustomer: value[0].id,
    });
  }
  onCutomerClose=() => {
    this.setState({
      customerShow: false
    });
  }
  onCutomerok=() => {
    let _that = this;
    confirm({
      title: "你确定要预约吗？",
      icon: <ExclamationCircleOutlined />,
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk () {
        console.log("OK");
        _that.onReserve();
      },
      onCancel () {
        console.log("Cancel");
      },
    });
  }
  onCancelReserve=() => {
    let {selectedRows} = this.state;
    let len = selectedRows.length;
    if (len <= 0) {
      Modal.warning({
        title: '请至少选择一条已预约的数据',
        content: '',
      });
      return false;
    }
    let status = [];
    selectedRows.forEach((item) => {
      status.push(item.status);
    });
    if (status.includes(1) === true || status.includes(0) === true) {
      Modal.warning({
        title: '请选择已预约的数据',
        content: '',
      });
      return false;
    }
    let _that = this;
    confirm({
      title: "你确定要取消预约吗？",
      icon: <ExclamationCircleOutlined />,
      okText: "确定",
      okType: "danger",
      cancelText: "取消",
      onOk () {
        console.log("OK");
        _that.onNoReserve();
      },
      onCancel () {
        console.log("Cancel");
      },
    });
  }
  onNoReserve=() => {
    let arr = [];
    let {selectedRows} = this.state;
    selectedRows.forEach((item) => {
      arr.push({
        id: item.id,
        status: 1,
        version: item.version,
      });
    });
    // console.log(arr);
    http.post(`${BSS_ADMIN_URL}/api/product/ulocation/allUpdate`, arr)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.onGetListData();
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

  render () {
    const {loading, data} = this.props;
    const {lists} = this.state;
    const u1 = User.getPermission() || [];
    return (
      <main className="mian">
        {/* 搜索 */}
        <div className="g-search">
          <Form ref={this.searchFormRef} name="searchbox" layout="inline" onFinish={(values) => {this.onSearch(values);}}>
            <Form.Item name="uw">
              <Input placeholder="请输入U位" allowClear/>
            </Form.Item>
            <Form.Item name="managerIp">
              <Input placeholder="请输入管理IP" allowClear/>
            </Form.Item>
            <Form.Item name="deviceName">
              <Input placeholder="请输入设备名称" allowClear/>
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
          {u1.includes('cabinet-u-edit') && <Button size="middle"  onClick={() => {this.outOfStock();}}     className="actions-btn">批量出库</Button>}
          {u1.includes('cabinet-u-edit') && <Button size="middle"  onClick={() => {this.onReserveShow();}}     className="actions-btn">预约</Button>}
          {u1.includes('cabinet-u-edit') && <Button size="middle"  onClick={() => {this.onCancelReserve();}}     className="actions-btn">取消预约</Button>}
        </div>
        {/* 数据展示 */}
        <div className="g-table">
          {/* <DndProvider backend={HTML5Backend1}> </DndProvider> */}
          <Table
            columns={this.makeColumns()}
            rowKey={(record) => record.id}
            loading={loading}
            dataSource={lists}
            pagination={false}
            bordered
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: this.state.selectedRowKeys,
              onChange: (selectedRowKeys, selectedRows) => {this.selectedRow(selectedRowKeys, selectedRows);},
            }}
            components={u1.includes('cabinet-u-edit') ? this.components : {}}
            onRow={(record, index) => ({
              record,
              index,
              moveRow: (dragIndex, hoverIndex, item) => {this.moveRow(dragIndex, hoverIndex, item, record);},
            })}
          />
        </div>
        <Modal
          visible={this.state.customerShow}
          width="40%"
          destroyOnClose
          onCancel={this.onCutomerClose}
          onOk={this.onCutomerok}
          title="选择预约方"
          okText="确定"
          cancelText="取消"
        >
          <Form
            name="form_in_modal"
            ref={this.formRef}
            className="g-modal-field"
          >
            <Row>
              <Col span={24}>
                <FormItem
                  label="预约客户"
                  {...formItemLayout}
                >
                  <FormItem
                    name="customerName"
                    style={{ display: "inline-block" }}
                  >
                    <Input
                      placeholder="请选择"
                      disabled
                    >
                    </Input>
                  </FormItem>
                  <Button
                    style={
                      { display: "inline-block" }
                    }
                  >
                    <Customer
                      onSelect={this.onSelect}
                    >
                      选择
                    </Customer>
                  </Button>
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Modal>
      </main>
    );
  }
}
export default UBitManage;


