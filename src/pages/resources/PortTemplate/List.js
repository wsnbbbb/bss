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
  Pagination,
  message,
  Popconfirm,
  Spin,
  Modal,
  Tooltip,
  Divider,
  Select
} from 'antd';
import { EyeOutlined, FormOutlined, DeleteOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';
import {observable} from "mobx";
import {formItemLayout2, houseAttribute, UBitStatus} from '@src/config/commvar'; // 全局通用变量
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import PortManage from './PortManage';
import {User} from "@src/util/user";
import { SYS_DICT_NET_DEVICE } from '@src/config/sysDict';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { confirm } = Modal;
const { TextArea } = Input;
const { Option } = Select;
@withRouter
@inject('root')
@inject('deviceDict')
@observer
class List extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    root: P.any,
    powers: P.array, // 当前登录用户权限
  };
  constructor (props) {
    super(props);
    this.formRefAdd =  React.createRef();
    this.searchFormRef =  React.createRef();
    this.searchParam = {};
    this.state = {
      nowData: {}, // 获取的机柜数据
      lists: [], // table数据
      page: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      modalShow: false,
      modalLoading: false,
      operateType: 'add',
      selectedRowKeys: [],
    };
  }
  componentDidMount () {
    if (Object.keys(this.props.deviceDict.devicemodel).length <= 0) {
      this.props.deviceDict.fetchDeviceModel();
    }
    this.onGetListData();
  }
  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextState.someData !== this.state.someData;
  // }
  // componentWillReceiveProps (nextProps) {
  //   console.log(nextProps, this.props);
  // }

  // 搜索
  onSearch (param) {
    this.searchParam = param;
    this.onGetListData(param);
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.searchFormRef.current.resetFields();
  };

  // 查询当前页面所需列表数据
  onGetListData (values) {
    // const p = this.props.root.powers;
    // if (!p.includes('user:query')) {
    //   return;
    // }
    const params = _.assign({}, {
      ...this.searchParam,
      ...values
    });
    this.setState({
      loading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/product/network/device/template`, {params: params})
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
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

  // 删除模板
  onDel (id) {
    this.setState({
      loading: true,
    });
    http.delete(`${BSS_ADMIN_URL}/api/product/network/device/template/${id}/delete`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.onGetListData();
          message.success('删除成功')
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

  // 新增/修改
  onModalShow (type, data) {
    if (type == 'add') {
      this.setState({
        modalShow: true,
        operateType: type,
      });
    } else {
      this.setState({
        modalShow: true,
        operateType: type,
        nowData: data
      });
    }
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.setState({modalShow: false});
  };

  // 确认添加模板
  onModalOk (val) {
    this.setState({
      modalLoading: true,
    });
    if (this.state.operateType == 'add') {
      http.post(`${BSS_ADMIN_URL}/api/product/network/device/template/add`, tools.clearNull(val))
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
            tools.dealFail(res);
          }
          this.setState({ modalLoading: false });
        })
        .catch(() => {
          this.setState({ modalLoading: false });
        });
    } else {
      let param = tools.clearNull({
        ...this.state.nowData,
        ...obj,
      });
      http.put(`${BSS_ADMIN_URL}/api/product/network/device/template/${this.state.nowData.id}/update`, tools.clearNull(param))
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
            tools.dealFail(res);
          }
          this.setState({ modalLoading: false });
        })
        .catch(() => {
          this.setState({ modalLoading: false });
        });
    }
  }

  // 管理端口保存
  savePort (key, target) {
    http.post(`${BSS_ADMIN_URL}/api/product/networkdeviceporttemplate`, tools.clearNull(val))
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
          tools.dealFail(res);
        }
        this.setState({ modalLoading: false });
      })
      .catch(() => {
        this.setState({ modalLoading: false });
      });
  }

  // 构建字段 机房
  makeColumns () {
    const columns = [
      {
        title: '设备类型',
        dataIndex: 'deviceType',
        key: 'deviceType',
        render: (text, record) => SYS_DICT_NET_DEVICE.re_facility[text]
      },
      {
        title: '设备型号',
        dataIndex: 'deviceModelId',
        key: 'deviceModelId',
        render: (text, record) => this.props.deviceDict.devicemodel[text]
      },
      {
        title: '操作',
        key: 'control',
        fixed: 'right',
        // width: 100,
        render: (text, record) => {
          const controls = [];
          const u = User.getPermission() || [];
          u.includes('network-devices-edit') &&
          controls.push(
            <PortManage
              key='1'
              templateId={record.id}
              title={'管理端口'}
              onSelect={(keys, ports) => {this.savePort(keys, items);}}
            ><Tooltip placement="top" title="管理端口">
                <FormOutlined></FormOutlined>
              </Tooltip></PortManage>
          );
          u.includes('network-devices-delete') &&
          controls.push(
            <Popconfirm
              key="2"
              title="确定删除吗?"
              onConfirm={() => this.onDel(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <span className="control-btn red">
                <Tooltip placement="top" title="删除">
                  <DeleteOutlined></DeleteOutlined>
                </Tooltip>
              </span>
            </Popconfirm>
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
  // onSelectChange=(selectedRowKeys)=>{
  //   this.setState({selectedRowKeys});
  // }
  // showDeleteConfirm = () => {
  //   let selectedRowKeys = this.state.selectedRowKeys;
  //   let _that = this;
  //   let len = selectedRowKeys.length;
  //   if (len < 1) {
  //     Modal.warning({
  //       title: "提示",
  //       content: "请选择至少一条数据！",
  //       destroyOnClose: true,
  //     });
  //     return false;
  //   }
  //   confirm({
  //     title: "你确定要批量删除吗？",
  //     icon: <ExclamationCircleOutlined />,
  //     okText: "确定",
  //     okType: "danger",
  //     cancelText: "取消",
  //     onOk () {
  //       _that.onDel(selectedRowKeys);
  //       _that.setState({
  //         selectedRowKeys: [],
  //       });
  //     },
  //     onCancel () {
  //     },
  //   });
  // };
  render () {
    const {lists, loading, page, pageSize, total, modalLoading, modalShow, operateType, nowData, selectedRowKeys} = this.state;
    const { devicemodel} = this.props.deviceDict;
    const u1 = User.getPermission() || [];
    // const rowSelection = {
    //   selectedRowKeys,
    //   onChange: this.onSelectChange,
    // };
    return (
      <main className="mian">
        {/* 搜索 */}
        <div className="g-search">
          <Form ref={this.searchFormRef} name="searchbox" layout="inline" onFinish={(values) => {this.onSearch(values);}}>
            <FormItem name="deviceType">
              <Select
                style={{width: 150}}
                placeholder="设备类型"
                allowClear
              >
                {
                  _.map(SYS_DICT_NET_DEVICE.re_facility, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                }
              </Select>
            </FormItem>
            <FormItem name="deviceModelId">
              <Select
                style={{width: 300}}
                placeholder="设备型号"
                showSearch
                filterOption={tools.filterOption}
                allowClear>
                {
                  _.map(devicemodel, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                }
              </Select>
            </FormItem>
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
          {u1.includes('network-devices-add') && <Button size="middle" className="actions-btn" onClick={() => {this.onModalShow('add');}}>添加模板</Button>}
          {/* <Button size="middle" onClick={this.showDeleteConfirm}  className="actions-btn">
            批量删除
          </Button> */}
        </div>
        {/* 数据展示 */}
        <div className="g-table">
          <Table
            columns={this.makeColumns()}
            rowKey={(record) => record.id}
            loading={loading}
            dataSource={lists}
            pagination={false}
            // rowSelection={rowSelection}
          />

          <div className="g-pagination">
            <Pagination current={page} total={total} pageSize={pageSize}
              showSizeChanger
              showTotal={(total) => `共 ${total} 条`}
              onChange={(current, size) => {this.onPageChange(current, size);}}
              onShowSizeChange={(current, size) => {this.onPageSizeChange(current, size);}}/>
          </div>
        </div>
        {/* 新增&修改&查看 模态框 */}
        <Modal
          title={
            { add: '新增端口模板', up: '修改端口模板' }[operateType]
          }
          maskClosable={false}
          width="50%"
          destroyOnClose
          footer={null}
          modalLoading={modalLoading}
          onCancel={this.onClose}
          visible={modalShow}
        >
          <Form name="form_in_modal"
            ref={this.formRefAdd}
            className="g-modal-field"
            onFinish={(values) => {this.onModalOk(values);}}
            initialValues={nowData}>
            <FormItem label="设备类型" name="deviceType"
              rules={[{ required: true}]}
              {...formItemLayout2}>
              <Select>
                {
                  _.map(SYS_DICT_NET_DEVICE.re_facility, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                }
              </Select>
            </FormItem>
            <FormItem label="设备型号" name="deviceModelId"
              rules={[{ required: true}]}
              {...formItemLayout2}>
              <Select>
                {
                  _.map(devicemodel, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                }
              </Select>
            </FormItem>

            <div className="actions-btn">
              <Button htmlType="submit" className="action-btn ok">确认提交</Button>
              <Button onClick={this.onClose} className="action-btn ok">取消</Button>
            </div>
          </Form>

        </Modal>
      </main>
    );
  }
}
export default List;


