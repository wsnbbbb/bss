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
import { EyeOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';
import {observable} from "mobx";
import {formItemLayout, houseAttribute, UBitStatus} from '@src/config/commvar'; // 全局通用变量
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import {SYS_DICT_PORT} from '@src/config/sysDict'; // 系统字典

// ==================
// Definition
// ==================
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
  formRefEdit = React.createRef();
  constructor (props) {
    super(props);
    this.portkeys = {}; // 已存在的端口好，用于检测端口重复
    this.newDataLen = 0; // 新数据个数
    this.selectedRows = []; // 选中行数据
    this.editType = null; // 'batch'|'one'标识批量修改还是单个修改
    this.nowData = {}, // 当前操作的一条数据
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
   * @param {*} operateType 'up'|'see'
   */
  getDetail (id) {
    this.setState({
      loading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/product/network/device/port/template`, {
      params: {
        templateId: id
      }
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let ports = [];
          _.map(res.data, (item) => {
            ports.push(item.port);
          });
          this.portkeys = ports;
          this.selectedRows = []; // 清空选择项数据，因为版本号发生变更，所以缓存也要清空掉
          this.setState({
            loading: false,
            lists: res.data,
            selectedRowKeys: [],
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

  // 根据搜索条件生成端口
  GeneratePort (val) {
    const templateId = this.props.templateId;
    const {prefix, sult, start, ends, speed} = val;
    if (start > ends) {
      Modal.error({
        title: '开始值不能大于结束值'
      });
      return false;

    }
    const newList = [];
    const newports = [];
    for (let i = start; i <= ends; i++) {
      let port = `${prefix}${i}`;
      if (_.includes(this.portkeys, port)) {
        Modal.error({
          title: `${port}端口已存在，请重新选择开始和结束值！`,
        });
        return false;
      }
      // 新数据增加（因为包含开始和结束值，所以加1）
      this.newDataLen = this.newDataLen + ends - start + 1;
      newports.push(port);
      newList.push({
        id: null,
        templateId: templateId,
        sult: sult,
        port: port,
        speed: speed,
        version: 0,
      });
    }
    console.log(newList);
    this.portkeys = this.portkeys.concat(newports);
    this.setState({
      lists: this.state.lists.concat(newList)
    });
  }

  // 删除
  /**
   * @param {string} id null 标识新数据
   * @param {number} index 第几条数据0开始
   */
  onDelOne (id, index, item) {
    let list =  _.cloneDeep(this.state.lists);
    if (!id) {
      this.newDataLen = this.newDataLen - 1;
      this.portkeys.splice(this.portkeys.indexOf(item.port), 1);
      list.splice(index, 1);
      this.setState({
        lists: list
      });
      return true;
    }
    this.setState({
      loading: true,
    });
    http.delete(`${BSS_ADMIN_URL}/api/product/network/device/port/template/allDel`, {
      templateId: this.props.templateId,
      data: [id]
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          tools.auto_close_result('ok', '操作成功');
          this.getDetail(this.props.templateId);
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

  // 批量删除请求
  fetchDel () {
    let ids = [];
    _.map(this.selectedRows, (item) => {
      ids.push(item.id);
    });
    http.delete(`${BSS_ADMIN_URL}/api/product/network/device/port/template/allDel`, {
      templateId: this.props.templateId,
      data: ids
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          tools.auto_close_result('ok', '操作成功');
          this.newDataLen = 0;
          this.getDetail(this.props.templateId);
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
    // 存在新数据
    if (this.newDataLen > 0) {
      Modal.confirm({
        title: '数据丢失提示！',
        icon: <ExclamationCircleOutlined />,
        content: '你有新增的数据尚未保存，执行批量操作将会丢失，确认执行批量操作吗？',
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          this.fetchDel();
        },
        onCancel () {
          console.log('Cancel');
        },
      });
    } else {
      this.fetchDel();
    }
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
    this.getDetail(this.props.templateId);
    this.setState({
      showModal: true
    });
  }
  // 端口管理确认
  onOk = () => {
    const lists = this.state.lists;
    console.log(lists);
    // lists.forEach((item) => {
    //   item.version = 0;
    // });
    // console.log(lists);
    if (this.newDataLen <= 0) {
      Modal.error({
        title: '没有新增数据可保存'
      });
      return false;
    }
    this.setState({
      modalLoading: true,
    });
    http.post(`${BSS_ADMIN_URL}/api/product/network/device/port/template/allAddUpdate`, lists)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          tools.auto_close_result('ok', '操作成功');
          this.newDataLen = 0;
          this.setState({
            modalLoading: false,
            // modalShow: false
          });
          this.onClose();
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
      // 存在新数据
      if (this.newDataLen > 0) {
        Modal.confirm({
          title: '数据丢失提示！',
          icon: <ExclamationCircleOutlined />,
          content: '你有新增的数据尚未保存，执行批量操作将会丢失，确认执行批量操作吗？',
          okText: '确定',
          okType: 'danger',
          cancelText: '取消',
          onOk: () => {
            this.nowData = {};
            this.setState({
              showModalEdit: true,
            });
          },
          onCancel () {
            console.log('Cancel');
          },
        });
      } else {
        this.nowData = {};
        this.setState({
          showModalEdit: true,
        });
        return false;
      }
    }
  }
  // 端口管理确认
  onOkEdit = (val) => {
    val = tools.clearNull(val);
    let lists = [];
    if (this.editType == 'one') {
      lists.push({
        sult: this.nowData.sult,
        id: this.nowData.id,
        port: this.nowData.port,
        speed: this.nowData.speed,
        templateId: this.nowData.templateId,
        version: this.nowData.version,
        ...val,
      });
    } else {
      _.map(this.selectedRows, (item) => {
        lists.push({
          sult: item.sult,
          id: item.id,
          port: item.port,
          speed: item.speed,
          templateId: item.templateId,
          version: item.version,
          ...val,
        });
      });
    }
    this.setState({
      Editloading: true,
    });
    http.post(`${BSS_ADMIN_URL}/api/product/network/device/port/template/allAddUpdate`, lists)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          tools.auto_close_result('ok', '操作成功');
          this.setState({
            Editloading: false,
            showModalEdit: false,
          });
          this.getDetail(this.props.templateId);
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
        width: 150,
        key: 'port',
      },
      {
        title: '端口类型',
        dataIndex: 'sult',
        width: 150,
        key: 'sult',
        render: (text, record) => SYS_DICT_PORT.port_type[text]
      },
      {
        title: '端口速率（Mbps）',
        dataIndex: 'speed',
        width: 150,
        key: 'speed',
      },
      {
        title: '操作',
        key: 'control',
        fixed: 'right',
        width: 160,
        render: (text, record, index) => {
          const controls = [];
          const u = this.props.root.userinfo || {};
          const p = this.props.root.powers;
          // p.includes('user:up') &&
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
          // p.includes('user:up') &&
          if (record.id) {
            controls.push(
              <span
                key="1"
                className="control-btn red"
                onClick={() => this.onDelOne(record.id, index, record)}
              >
                <Tooltip placement="top" title="出库">
                  <DeleteOutlined></DeleteOutlined>
                </Tooltip>
              </span>
            );
          }
          // p.includes('user:up') &&
          if (!record.id) {
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
      <main className="mian" style={{display: "inline-block"}}>
        <Modal
          title={this.props.title}
          maskClosable={false}
          width="90%"
          destroyOnClose
          okText="保存新增数据"
          cancelText="取消"
          onOk={this.onOk}
          onCancel={this.onClose}
          visible={showModal}
        >
          {/* 搜索 */}
          <div className="g-search">
            <Form ref={this.formRefAdd} name="searchbox" layout="inline" onFinish={(values) => {this.GeneratePort(values);}}>
              <Form.Item name="prefix" label="前缀"
                rules={[{ required: true, message: '请选择' }]}>
                <Select
                  style={{width: 150}}
                  placeholder="前缀"
                  allowClear
                >
                  {
                    _.map(this.props.portDict.portprefix, (item, key) => <Option value={item} key={key} > {item} </Option>)
                  }
                </Select>
              </Form.Item>
              <Form.Item name="sult" label="端口类型"
                rules={[{ required: true, message: '请选择' }]}>
                <Select
                  style={{width: 150}}
                  placeholder="端口类型"
                  allowClear
                >
                  {
                    _.map(SYS_DICT_PORT.port_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                  }
                </Select>
              </Form.Item>
              <Form.Item name="start" label="开始值"
                rules={[{ required: true, message: '请输入' }, { pattern: regExpConfig.num, message: "请输入正整数" }]}>
                <InputNumber style={{width: 80}} placeholder="开始值"/>
              </Form.Item>
              <Form.Item name="ends" label="结束值"
                rules={[{ required: true, message: '请输入' }, { pattern: regExpConfig.num, message: "请输入正整数" }]}>
                <InputNumber style={{width: 80}} placeholder="结束值"/>
              </Form.Item>
              <Form.Item name="speed" label="端口速率(Mbps)"
                rules={[{ required: true, message: '请输入' }, { pattern: regExpConfig.num, message: "请输入正整数" }]}>
                <Input style={{width: 100}} placeholder="端口速率"/>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" >生成端口</Button>
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
              pagination={false}
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys,
                onChange: (selectedRowKeys, selectedRows) => {this.selectedRow(selectedRowKeys, selectedRows);},
                // getCheckboxProps: (record) => ({
                //   disabled: !record.id, // Column configuration not to be checked
                //   // deviceId: record.deviceId,
                // }),
              }}
            />
          </div>
        </Modal>
        <Modal
          title="批量编辑"
          maskClosable={false}
          width="90%"
          destroyOnClose
          footer={false}
          onCancel={this.onCloseEdit}
          visible={showModalEdit}
        >
          <Form ref={this.formRefEdit} name="editbox"
            initialValues={this.nowData}
            className="g-modal-field"
            onFinish={(values) => {this.onOkEdit(values);}}>
            <Form.Item name="sult" label="端口类型"
              {...formItemLayout}>
              <Select
                placeholder="端口类型"
              >
                {
                  _.map(SYS_DICT_PORT.port_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item name="speed" label="端口速率(Mbps)"
              {...formItemLayout}>
              <Input placeholder="端口速率"/>
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
      </main>
    );
  }
}
export default PortManage;


