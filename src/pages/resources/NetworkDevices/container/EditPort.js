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
  Modal,
  Tooltip,
  Divider,
  Select,
  TreeSelect
} from 'antd';
import { EyeOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';
import {observable} from "mobx";
import {formItemLayout, houseAttribute, UBitStatus} from '@src/config/commvar'; // 全局通用变量
import {SYS_DICT_PORT} from '@src/config/sysDict'; // 系统字典
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式

const { Option } = Select;

@withRouter
@inject('root')
@inject('portDict')
@observer
class PortManage extends React.Component {
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
  formRefEditPort = React.createRef();
  constructor (props) {
    super(props);
    this.portkeys = {}; // 已存在的端口好，用于检测端口重复
    this.newDataLen = 0; // 端口个数
    this.selectedRows = []; // 选中行数据
    this.editType = null; // 'batch'|'one'标识批量修改还是单个修改
    this.nowData = {}, // 当前操作的一条数据
    this.origionList = []; // 此此设备所有的端口数据
    this.state = {
      lists: [],  // table表中的数据
      loading: false,
      showModal: false,
      showModalEdit: false,
      Editloading: false,

    };
  }
  componentDidMount () {
  }
  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextState.someData !== this.state.someData;
  // }
  componentWillReceiveProps (nextProps) {

  }

  /**
   * 获取模板端口模板id 或者（设备类型&设备型号）
   * @param {*} id 机柜id
   */
  getDetail () {
    this.setState({
      loading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/product/network/devices/port`, {
      params: {
        networkDeviceId: this.props.deviceId
      }
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.origionList = res.data;
          let ports = [];
          _.map(res.data, (item) => {
            ports.push(item.port);
          });
          this.portkeys = ports;
          this.setState({
            loading: false,
            lists: res.data,
            selectedRowKeys: [],
          });
          this.props.onSelect(res.data.length);
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

  // 查询
  search (val) {
    if (val.port) {
      let reg = new RegExp(val.port);
      let lists = _.filter(this.origionList, (item) => reg.test(item.port));
      this.setState({
        lists: lists
      });
    } else {
      this.setState({
        lists: this.origionList
      });
    }
  }

  // 删除单条数据
  /**
   * @param {string} id null 标识新数据
   * @param {number} index 第几条数据0开始
   */
  onDelOne (id, index, item) {
    let ids = [];
    ids.push(id);
    http.delete(`${BSS_ADMIN_URL}/api/product/network/devices/port/alldel`, {
      data: ids
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          // 删除后清空选中项
          this.selectedRows = [];
          this.setState({
            selectedRowKeys: [],
          });
          this.getDetail();
          // this.onCancel();
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
   * 批量操作前，清除缓存中已经删除的数据
   */
  dealSelectedCache () {
    // 去缓存在this.selectedRows中 但是已经删除的数据。
    let _selectedRows = _.cloneDeep(this.selectedRows);
    this.selectedRows = _.dropWhile(_selectedRows, (item) => {
      let  exist =  _.includes(this.portkeys, item.port);
      return !exist;
    });
  }
  // // 删除
  // onDel=(val)=>{

  // }
  // 批量删除请求
  fetchDel () {
    let ids = [];
    _.map(this.selectedRows, (item) => {
      ids.push(item.id);
    });
    this.setState({
      loading: true,
    });
    http.delete(`${BSS_ADMIN_URL}/api/product/network/devices/port/alldel`, {
      data: ids
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          // 删除后清空选中项
          this.selectedRows = [];
          this.setState({
            selectedRowKeys: [],
          });
          this.getDetail();
          this.onCancel();
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

  // 批量删除
  /**
   * 不管新旧数据，都当旧数据处理
   * 后端遇到id为null的不做处理
   */
  onBatchDel () {
    this.dealSelectedCache();
    let len = this.selectedRows.length;
    if (len <= 0) {
      Modal.warning({
        title: '请至少选择一条数据',
        content: '',
      });
      return false;
    }
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      title: '删除',
      content: '是否确认删除？',
      onOk: () => {
        this.fetchDel();
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

  // 展示组件
  modalShow () {
    if (Object.keys(this.props.portDict.portprefix).length <= 0) {
      this.props.portDict.fetchPortPrefix();
    }
    this.getDetail();
    this.setState({
      showModal: true
    });
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.setState({showModal: false});
  };

  /**
   * 展示修改组件
   * @param {string} type 'batch'|'one'
   */
  modalShowEdit (type, data) {
    this.editType = type;
    // 单个修改
    if (type == 'one') {
      this.nowData = data;
      this.setState({
        showModalEdit: true,
      });
      return false;
    }
    // 批量修改
    if (type == 'batch') {
      this.dealSelectedCache();
      if (this.selectedRows.length <= 0) {
        Modal.error({
          title: '请至少选择一条数据'
        });
        return true;
      }
      this.nowData = {};
      this.setState({
        showModalEdit: true,
      });
      return false;
    }
  }
  // 端口管理确认
  onOkEdit = (val) => {
    val = tools.clearNull(val);
    let lists = [];
    if (this.editType == 'one') {
      lists.push({
        id: this.nowData.id,
        version: this.nowData.version,
        networkDeviceId: this.props.deviceId,
        ...val,
      });
    } else {
      _.map(this.selectedRows, (item) => {
        lists.push({
          networkDeviceId: this.props.deviceId,
          id: item.id,
          version: item.version,
          ...val,
        });
      });
    }
    this.setState({
      Editloading: true,
    });
    http.post(`${BSS_ADMIN_URL}/api/product/network/devices/port/allupdate`, lists)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            Editloading: false,
            showModalEdit: false
          });
          this.getDetail();
        } else {
          tools.dealFail(res);
          this.setState({
            Editloading: false,
          });
        }
      })
      .catch(() => {
        this.setState({
          Editloading: false,
        });
      });

  }

  /** 点击关闭时触发 **/
  onCloseEdit = () => {
    this.setState({showModalEdit: false});
  };

  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: '端口',
        dataIndex: 'port',
        key: 'port',
      },
      {
        title: '端口类型',
        dataIndex: 'sult',
        key: 'sult',
        render: (text, record) => SYS_DICT_PORT.port_type[text]
      },
      {
        title: '端口状态',
        dataIndex: 'status',
        key: 'status',
        render: (text) => tools.renderStatus(SYS_DICT_PORT.port_use, text)
      },
      {
        title: '端口速率（Mbps）',
        dataIndex: 'speed',
        key: 'speed',
      },
      {
        title: '浏览图url',
        dataIndex: 'url',
        key: 'url',
      },
      {
        title: '连接信息（管理IP）',
        dataIndex: 'manageIp',
        width: 150,
        key: 'manageIp',
      },
      {
        title: '连接信息（网卡名）',
        dataIndex: 'deviceNetworkName',
        width: 150,
        key: 'deviceNetworkName',
      },
      {
        title: '连接信息（服务器名称）',
        dataIndex: 'deviceName',
        width: 150,
        key: 'deviceName',
      },
      {
        title: '备注',
        dataIndex: 'remark',
        // width: 150,
        key: 'remark',
      },
      {
        title: '操作',
        key: 'control',
        fixed: 'right',
        width: 100,
        render: (text, record, index) => {
          const controls = [];
          if (record.id) {
            controls.push(
              <span
                key="0"
                className="control-btn blue"
                onClick={() => this.modalShowEdit('one', record)}>
                <Tooltip placement="top" title="编辑">
                  <FormOutlined></FormOutlined>
                </Tooltip>
              </span>
            );
          }
          if (record.id && record.status != 2) {
            controls.push(
              <span
                key="1"
                className="control-btn red"
                onClick={() => this.onDelOne(record.id, index, record)}
              >
                <Tooltip placement="top" title="删除">
                  <DeleteOutlined></DeleteOutlined>
                </Tooltip>
              </span>
            );
          }
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
    const {lists, showModal, showModalEdit, loading, selectedRowKeys} = this.state;
    return (
      <React.Fragment>
        <Modal
          title={this.props.title}
          maskClosable={false}
          width="90%"
          destroyOnClose
          footer={false}
          onCancel={this.onClose}
          visible={showModal}
        >
          {/* 搜索 */}
          <div className="g-search">
            <Form ref={this.formRefAdd} name="searchbox" layout="inline" onFinish={(values) => {this.search(values);}}>
              <Form.Item name="port" label="端口号">
                <Input style={{width: 100}} placeholder="端口号"/>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" >查询</Button>
              </Form.Item>
            </Form>
          </div>
          {/* 操作 */}
          <div className="g-operate">
            <Button size="middle" type="dashed" onClick={() => {this.modalShowEdit('batch');}}>批量编辑</Button>
            <Button size="middle" type="dashed" onClick={() => {this.onBatchDel();}}>批量删除</Button>
          </div>
          {/* 数据展示 */}
          <div className="g-table">
            {/* <DndProvider backend={HTML5Backend1}> </DndProvider> */}
            <Table
              columns={this.makeColumns()}
              rowKey={(record) => record.port}
              loading={loading}
              dataSource={lists}
              // pagination={false}
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys,
                onChange: (selectedRowKeys, selectedRows) => {this.selectedRow(selectedRowKeys, selectedRows);},
                getCheckboxProps: (record) => ({
                  disabled: record.status == 2, // Column configuration not to be checked
                  // deviceId: record.deviceId,
                }),
              }}
            />
          </div>

        </Modal>
        <Modal
          title={this.editType == 'one' ? '编辑' : '批量编辑'}
          maskClosable={false}
          width="90%"
          destroyOnClose
          footer={false}
          onCancel={this.onCloseEdit}
          visible={showModalEdit}
        >
          <Form ref={this.formRefEditPort} name="editbox"
            initialValues={this.nowData}
            className="g-modal-field"
            onFinish={(values) => {this.onOkEdit(values);}}>
            <Form.Item name="port" label="端口" rules={[{ required: this.editType == 'one', message: '请输入' }]}
              {...formItemLayout}>
              <Input placeholder="端口" disabled/>
            </Form.Item>
            <Form.Item name="sult" label="端口类型" rules={[{ required: this.editType == 'one', message: '请选择' }]}
              {...formItemLayout}>
              <Select
                placeholder="端口类型">
                {
                  _.map(SYS_DICT_PORT.port_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item name="status" label="端口状态" rules={[{ required: this.editType == 'one', message: '请选择' }]}
              {...formItemLayout}>
              <Select
                disabled={this.nowData.status == 2}
                placeholder="端口状态">
                {
                  _.map(SYS_DICT_PORT.port_use, (item, key) => <Option value={parseInt(key)} key={key} disabled={key == 2} > {item.text} </Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item name="speed" label="端口速率(Mbps)" rules={[{ required: this.editType == 'one', message: '请输入' }]}
              {...formItemLayout}>
              <Input placeholder="端口速率"/>
            </Form.Item>
            {this.editType == 'one' && <Form.Item name="url" label="流量图URL"
              {...formItemLayout}>
              <Input placeholder="流量图URL"/>
            </Form.Item>}
            <Form.Item name="remark" label="备注"
              {...formItemLayout}>
              <Input placeholder="备注"/>
            </Form.Item>
            <div className="actions-btn">
              <Button type="primary" className="action-btn ok" htmlType="submit" >保存</Button>
              <Button type="primary" className="action-btn ok" onClick={this.onCloseEdit} >取消</Button>
            </div>
          </Form>
        </Modal>
        <span onClick={() => {this.modalShow();}}>
          {this.props.children}
        </span>
      </React.Fragment>
    );
  }
}
export default PortManage;


