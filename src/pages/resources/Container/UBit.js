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
  InputNumber,
  Table,
  message,
  Popconfirm,
  Spin,
  Modal,
  Tooltip,
  Divider,
  Select,
  TreeSelect
} from 'antd';
import { EyeOutlined, FormOutlined, DeleteOutlined} from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';
import {SYS_DICT_NET_DEVICE, SYS_DICT_CABINET} from '@src/config/sysDict'; // 全局通用变量
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import UBitOptLog from '@src/pages/resources/container/UBitOptLog';
import AviewInput from '@src/pages/resources/container/AviewInput';
import Cabinet from '@src/pages/resources/container/Cabinet';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const { TreeNode } = TreeSelect;

@withRouter
@inject('root')
@inject('cabinetDict')
@observer
class UBit extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    root: P.any,
    cabinetDict: P.any,
    powers: P.array, // 当前登录用户权限
    defaultData: P.any,  // 当前选中的信息
    onOk: P.func, // 弹框确认
    onClose: P.func, // 只关闭弹窗
  };
  formRefAdd = React.createRef();
  constructor (props) {
    super(props);
    this.selectedRows = []; // 选中行数据
    this.cabinetInfo = {}, // 机柜信息用于传给父组件使用
    this.regionInfo = {}, // 区域信息用于传给父组件使用
    this.state = {
      nowData: {}, // 获取的机柜数据
      lists: [], // 处理后的U位数据
      loading: false,
      showModal: false,
      regionId: '', // 区域id用于作为获取机柜的参数
      cabinetId: '', // 机柜id
      uw: undefined, // 占U位数,用于判断uw是否发生改变
    };
  }
  componentDidMount () {
  }
  componentWillReceiveProps (nextProps) {
  }

  /**
   * 获取u位详情信息
   * @param {*} id 机柜id
   */
  getDetail (id, fileds = {}) {
    this.setState({
      loading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/product/cabinet/${id}/get`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let lists = res.data.ulocationList;
          this.uList = lists;
          this.setState({
            nowData: res.data,
            loading: false,
            lists: lists,
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


  /**
   * 起始位置也要计入
   * 选中U位
   * 当前选的u位 为最小起始位置
   */
  selectedRow (selectedRowKeys, selectedRows) {
    let uwLenth =  this.props.uw; // 占位数
    let uwsLen = this.uList.length; // 总U位数
    let uw = selectedRows[0].uw; // 最小起始U位值
    if (uwsLen < uw + uwLenth - 1) {
      Modal.error({
        title: '大于总U位数,请从新选择起始U位!'
      });
      return false;
    }
    // 例如：uw从42-1，数据index从0-41，如果选中的uw为2，则起始位置：start = end + uwLenth-1；结束位置：end = uwsLen - uw
    let endIndex = uwsLen - uw;
    let startIndex = uwsLen - uwLenth - uw + 1;
    let uws = _.slice(this.uList, startIndex,  endIndex + 1);
    for (let i = 0; i < uwLenth; i++) {
      if (uws[i].status != '1') {
        Modal.error({
          title: 'U位被占用或大于总U位数,请从新选择起始U位!'
        });
        return false;
      }
    }
    this.selectedRows = selectedRows;
    this.props.onSelect({
      regionId: this.state.regionId,
      regionInfo: this.regionInfo,
      cabinetInfo: this.cabinetInfo,
      uBitInfo: selectedRows[0],
    });
    this.setState({
      showModal: false
    });
  }

  /**
   * 获取区域信息
   * @param {string} value :locationId
   * @param {*} record :地区视图对应的一条数据
   */
  getRegion (value, record) {
    if (value) {
      this.regionInfo = record;
      this.cabinetInfo = {};
      this.setState({
        lists: [],
        regionId: record.regionId,
        cabinetId: undefined
      });
    } else {
      this.regionInfo = {};
      this.cabinetInfo = {};
      this.setState({
        lists: [],
        regionId: undefined,
        cabinetId: undefined
      });

    }

  }

  // 获取机柜信息
  getCabinet (value, record) {
    this.cabinetInfo = record[0];
    this.setState({
      cabinetId: value
    });
    this.getDetail(value);
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.formRefAdd.current.resetFields();
  };
  modalShow () {
    if (!this.props.uw) {
      Modal.error({
        title: '请输入U位数'
      });
      return false;
    }
    // 如果占U位数发生改变，则清空历史数据
    if (this.props.uw !== this.state.uw) {
      this.selectedRows = []; // 选中行数据
      this.regionInfo = {}, // 区域相关信息
      this.cabinetInfo = {}, // 机柜信息
      this.setState({
        nowData: {}, // 获取的机柜数据
        lists: [], // 处理后的U位数据
        regionId: undefined, // 区域id
        cabinetId: undefined, // 机柜id
        uw: this.props.uw,
        showModal: true
      });
    } else {
      this.setState({
        showModal: true
      });
    }
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.setState({showModal: false});
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
    let listsLen = this.state.lists.length;
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
        fixed: 'right',
        width: 160,
        render: (text, record) => {
          const controls = [];
          // p.includes('user:query') &&
          controls.push(
            <UBitOptLog uLocationId={record.id}></UBitOptLog>
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

  render () {
    const {lists, showModal, loading} = this.state;
    return (
      <React.Fragment>
        <Modal
          title={this.props.title || '选择U位'}
          maskClosable={false}
          width="95%"
          destroyOnClose
          footer={null}
          onCancel={this.onClose}
          visible={showModal}
        >
          <main className="mian">
            {/* 搜索 */}
            <div className="g-search">
              <AviewInput defaultKey={this.regionInfo && this.regionInfo.fullLocationId} onSearch={(value, record) => {this.getRegion(value, record);}}></AviewInput>
              <div style={{display: "inline-block", width: 200, marginLeft: 10}}>
                <Cabinet
                  title="选择机柜"
                  disabled={!this.state.regionId && this.props.uw}
                  disabledTip="请先选择区域"
                  fetchPath={`${BSS_ADMIN_URL}/api/product/cabinet/choose?us=${this.props.uw}&regionId=${this.state.regionId}`}
                  onSelect={(value, record) => {this.getCabinet(value, record);}}>
                  <Input placeholder="选择机柜" value={this.cabinetInfo.name}></Input>
                </Cabinet>
              </div>
            </div>
            {/* 数据展示 */}
            <div className="g-table">
              <Table
                columns={this.makeColumns()}
                rowKey={(record) => record.id}
                loading={loading}
                dataSource={lists}
                pagination={false}
                size="small"
                rowSelection={{
                  type: 'radio',
                  onChange: (selectedRowKeys, selectedRows) => {this.selectedRow(selectedRowKeys, selectedRows);},
                  getCheckboxProps: (record) => ({
                    disabled: record.status != 1, // Column configuration not to be checked
                    status: record.status,
                  }),
                }}
              />
            </div>
          </main>
        </Modal>
        <span onClick={() => {this.modalShow();}}>
          {this.props.children}
        </span>
      </React.Fragment>
    );
  }
}
export default UBit;


