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
  InputNumber,
  Table,
  Modal,
  Tooltip,
  Divider,
  Select,
} from 'antd';
import { FormOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';
import {formItemLayout} from '@src/config/commvar'; // 全局通用变量
import {SYS_DICT_PORT} from '@src/config/sysDict'; // 系统字典
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式

// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;

@withRouter
@inject('portDict')
@observer
class PortManage extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    portDict: P.any,
    PortTempParam: P.any, // deviceType 和 deviceModelId 设备类型和设备型号必填，查询端口模板作为初始数据。
    powers: P.array, // 当前登录用户权限
    defaultData: P.any,  // 当前选中的信息
    onOk: P.func, // 弹框确认
    onClose: P.func, // 只关闭弹窗
  };
  formRefAdd = React.createRef();
  formRefPortEdit = React.createRef();
  constructor (props) {
    super(props);
    this.portkeys = {}; // 已存在的端口好，用于检测端口重复(需求希望每次生成，清空上次生成但未保存记录)
    this.newDataLen = 0; // 新数据个数
    this.selectedRows = []; // 选中行数据
    this.editType = null; // 'batch'|'one'标识批量修改还是单个修改
    this.state = {
      lists: [],  // table表中的数据
      nowData: {}, // 当前操作的一条数据
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
   * 获取模板端口数据作为初始值（参数为设备类型&设备型号）
   * @param {obj} PortTempParam
   */
  getTemp (PortTempParam) {
    this.setState({
      loading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/product/network/device/port/template/listPortTemplate`, {
      params: PortTempParam
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let ports = [];
          _.map(res.data, (item) => {
            ports.push(item.port);
          });
          this.newDataLen = res.data.length;
          this.portkeys = ports;
          this.setState({
            loading: false,
            lists: res.data,
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


  // 根据搜索条件生成端口(茂盛希望，每次生成都是重新生成 不管上次生成记录)
  GeneratePort (val) {
    const {prefix, sult, start, ends, speed} = val;
    if (start > ends) {
      Modal.error({
        title: '开始值不能大于结束值'
      });
      return false;
    }
    const newList = [];
    this.portkeys = [];
    for (let i = start; i <= ends; i++) {
      let port = `${prefix}${i}`;
      // if (_.includes(this.portkeys, port)) {
      //   Modal.error({
      //     title: `${port}端口已存在，请重新选择开始和结束值！`,
      //   });
      //   return false;
      // }
      // 新数据增加
      this.portkeys.push(port);
      this.newDataLen = ends - start + 1;
      newList.push({
        id: null,
        sult: sult,
        port: port,
        speed: speed,
        status: 1, // 默认状态为可用
        remark: '',
        url: '',
      });
    }
    this.setState({
      lists: newList
    });
  }

  // 删除
  /**
   * @param {string} id null 标识新数据
   * @param {number} index 第几条数据0开始
   */
  onDelOne (index, item) {
    let list =  _.cloneDeep(this.state.lists);
    this.newDataLen = this.newDataLen - 1;
    this.portkeys.splice(this.portkeys.indexOf(item.port), 1);
    list.splice(index, 1);
    this.setState({
      lists: list
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

  // 批量删除
  /**
   * 不管新旧数据，都当旧数据处理
   * 后端遇到id为null的不做处理
   */
  onBatchDel () {
    this.dealSelectedCache();
    let len = this.state.selectedRowKeys.length;
    if (len <= 0) {
      Modal.warning({
        title: '请至少选择一条数据',
        content: '',
      });
      return false;
    }
    let lists = _.filter(this.state.lists, (item) => !this.state.selectedRowKeys.includes(item.port));
    this.selectedRows = [];
    this.setState({
      selectedRowKeys: [],
      lists: lists
    });
  }

  // 选择选中行
  selectedRow (selectedRowKeys, selectedRows) {
    this.selectedRows = selectedRows;
    this.setState({
      selectedRowKeys: selectedRowKeys
    });
  }

  // 展示组件
  modalShow () {
    // 如果已经存在数据，保留上次操作记录
    if (this.state.lists.length > 0) {
      this.setState({
        showModal: true
      });
      return;
    }
    // 第一次操作 执行如下逻辑
    const {deviceModelId, deviceType } = this.props.PortTempParam;
    if (deviceModelId == undefined || deviceType == undefined) {
      Modal.error({
        title: '请选择设备型号和设备类型!'
      });
      return false;
    }
    if (Object.keys(this.props.portDict.portprefix).length <= 0) {
      this.props.portDict.fetchPortPrefix();
    }
    this.getTemp(this.props.PortTempParam);
    this.setState({
      showModal: true
    });
  }
  // 端口管理确认
  onOk = () => {
    const lists = this.state.lists;
    if (this.newDataLen <= 0) {
      Modal.error({
        title: '没有新增数据可保存'
      });
      return false;
    }
    this.props.onSelect(lists);
    this.setState({
      showModal: false
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
      this.setState({
        nowData: data,
        showModalEdit: true,
      });
      return false;
    }
    // 批量修改
    if (type == 'batch') {
      if (this.state.selectedRowKeys.length <= 0) {
        Modal.error({
          title: '请至少选择一条数据'
        });
        return true;
      }
      this.setState({
        nowData: {},
        showModalEdit: true,
      });
    }
  }
  // 端口管理修改确认
  onOkEdit = (val) => {
    val = tools.clearNull(val);
    let lists = _.cloneDeep(this.state.lists);
    if (this.editType == 'one') {
      let nowData = this.state.nowData;
      let index = _.findIndex(lists, (list) => nowData.port == list.port);
      lists[index] = {
        sult: nowData.sult == undefined ? null : nowData.sult,
        status: nowData.status,
        url: nowData.url || '',
        port: nowData.port == undefined ? null : nowData.port,
        speed: nowData.speed == undefined ? null : nowData.speed,
        remark: nowData.remark || null,
        ...val,
      };
    } else {
      _.map(this.selectedRows, (item) => {
        let index = _.findIndex(lists, (list) => item.port == list.port);
        lists[index] = {
          sult: item.sult == undefined ? null : item.sult,
          status: item.status,
          url: item.url || '',
          port: item.port || null,
          speed: item.speed || null,
          remark: item.remark || null,
          ...val,
        };
      });
    }
    this.setState({
      nowData: {},
      lists: lists,
      showModalEdit: false,
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
        title: '端口状态',
        dataIndex: 'status',
        width: 150,
        key: 'status',
        render: (text, record) => {
          // 从模板导入的数据没有状态，设置默认值为可用
          if (text == undefined) {
            text = 1;
          }
          return tools.renderStatus(SYS_DICT_PORT.port_use, text);
        }
      },
      {
        title: '端口速率（Mbps）',
        dataIndex: 'speed',
        width: 150,
        key: 'speed',
      },
      {
        title: '浏览图url',
        dataIndex: 'url',
        width: 150,
        key: 'url',
      },
      {
        title: '备注',
        dataIndex: 'remark',
        width: 150,
        key: 'remark',
      },
      {
        title: '操作',
        key: 'control',
        fixed: 'right',
        width: 160,
        render: (text, record, index) => {
          const controls = [];
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
          controls.push(
            <span
              key="1"
              className="control-btn red"
              onClick={() => this.onDelOne(index, record)}
            >
              <Tooltip placement="top" title="删除">
                <DeleteOutlined></DeleteOutlined>
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

  render () {
    const {lists, showModal, showModalEdit, loading} = this.state;
    return (
      <main className="mian">
        <Modal
          title={this.props.title}
          maskClosable={false}
          width="90%"
          destroyOnClose
          okText="保存"
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
              <Form.Item shouldUpdate>
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
            <Table
              columns={this.makeColumns()}
              rowKey={(record) => record.port}
              loading={loading}
              dataSource={lists}
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys: this.state.selectedRowKeys,
                onChange: (selectedRowKeys, selectedRows) => {this.selectedRow(selectedRowKeys, selectedRows);},
              }}
            />
          </div>

        </Modal>
        {/* 编辑弹框 */}
        <Modal
          title={this.editType == 'one' ? '编辑' : '批量编辑'}
          maskClosable={false}
          width="90%"
          destroyOnClose
          footer={false}
          onCancel={this.onCloseEdit}
          visible={showModalEdit}
        >
          <Form ref={this.formRefPortEdit} name="editbox"
            initialValues={this.state.nowData}
            className="g-modal-field"
            onFinish={(values) => {this.onOkEdit(values);}}>
            <Form.Item name="sult" label="端口类型"
              rules={[{ required: this.editType == 'one', message: '请输入' }]}
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
              rules={[{ required: this.editType == 'one', message: '请输入' }]}
              {...formItemLayout}>
              <Input placeholder="端口速率"/>
            </Form.Item>
            <Form.Item name="status" label="端口状态"
              rules={[{ required: this.editType == 'one', message: '请输入' }]}
              {...formItemLayout}>
              <Select placeholder="端口状态" >
                {
                  _.map(SYS_DICT_PORT.port_use, (item, key) => <Option value={parseInt(key)} key={key} disabled={key == '2'}> {item.text} </Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item name="url" label="浏量图url"
              {...formItemLayout}>
              <Input placeholder="浏量图url"/>
            </Form.Item>
            <FormItem label="备注" name="remark"
              {...formItemLayout}>
              <TextArea
                autoSize={{ minRows: 5}}
                placeholder="请输入"
              />
            </FormItem>
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


