/* eslint-disable react/jsx-no-undef */
/* eslint-disable react/prop-types */

import React from 'react';
import P from 'prop-types';
import {
  Form, Button, Input, Select, Radio, Pagination, Modal, InputNumber, Cascader, Table, Tooltip, Divider, Popconfirm, message, Tag
} from 'antd';
import {
  PlusSquareOutlined,
  FormOutlined,
  DeleteOutlined
} from "@ant-design/icons";
import { inject, observer} from 'mobx-react';
import { Link } from 'react-router-dom';
import http from '@src/util/http';
import tools from '@src/util/tools'; // 工具
import {formItemLayout2 } from '@src/config/commvar'; // 全局变量
import { User } from '@src/util/user.js';
// ==================
// 所需的所有组件
// ==================
import Add from './container/Add';
import Edit from './container/Edit';
const FormItem = Form.Item;
const { confirm } = Modal;
const { Option } = Select;
@inject('nodeMasterDict')
@inject("areaResouse")
@observer
// @DropTarget(type, spec, collect)
export default class List extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    userinfo: P.any,
  };
  formRef = React.createRef();
  formRef2 = React.createRef();
  constructor (props) {
    super(props);
    this.searchParam = {}, // 存储查询条件（顶部查询条件）
    this.state = {
      lists: [],
      loading: false, // 数据正在加载中
      page: 1, // 当前第几页
      pageSize: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      modalShow: false,   // 模的显示
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      price: 0, // 基础价格
      lists2: [], // 业务类型数据
      AddNextShow: false,
      lists3: [],
      lists4: [],
    };
  }
  componentDidMount () {
    this.onGetListData();
    this.onGetListData2();
    if (this.props.areaResouse.houseList.length <= 0) {
      this.props.areaResouse.fetchHouse();
    }
  }

  onGetListData () {
    this.setState({
      loading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/goods/bandwidth-type?houseId=${this.props.houseId}`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            lists: res.data,
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
  onGetListData2 () {
    this.setState({
      loading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/goods/api-client/srgw/isp`)
      .then((res) => {
        res = res.data;
        console.log(res)
        if (tools.hasStatusOk(res)) {
          this.setState({
            lists4: res.data, 
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
  reset = () => {
    this.formRef.current.resetFields();
  };
  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: "带宽类型",
        dataIndex: "bandwidthName",
        key: "bandwidthName",
      },
      {
        title: "所属业务类型",
        dataIndex: "categoryName",
        key: "categoryName",
      },
      {
        title: "IPS供应商",
        dataIndex: "ispVendors",
        key: "ispVendors",
        render: (text, record) => record.ispVendors.map((item) => <Tag color="#2db7f5" key={item.id}> {item.ispVendor} </Tag>)
      },
      {
        title: "操作",
        key: "control",
        render: (text, record) => {
          const controls = [];
          controls.push(
            <span
              key="2"
              className="control-btn blue"
              onClick={() => this.onAddNextShow(record)}
            >
              <Tooltip placement="top" title="添加阶梯价格">
                <PlusSquareOutlined />
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
      },
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

  /**
   * 添加 模态框出现
   * @item: 当前选中的那条数据
   * @type: add添加/tempadd模板入库
   * **/
  onModalShow () {
    this.setState({
      modalShow: true
    });
  }
  onAddNextShow = (record) => {
    this.setState({
      AddNextShow: true,
    });
    this.id = record.id;
  }
  onAddNextShowClose = () => {
    this.setState({
      AddNextShow: false,
    });
  }
  onFinish = (value) => {
    value.categoryId = value.categoryId[value.categoryId.length - 1];
    value.houseId = this.props.houseId;
    http
      .post(`${BSS_ADMIN_URL}/api/goods/bandwidth-type/add`, tools.clearEmpty(value))
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.onModalClose();
          this.onGetListData();
          message.success("添加成功");
        } else {
          tools.dealFail(res);
        }
      })
      .catch(() => {
      });
  };
  // 关闭
  onModalClose = () => {
    this.setState({
      modalShow: false,
    });
  }
  expandedRowRender (data) {
    const columns = [
      { title: '带宽大小(M)', dataIndex: 'bandwidthSize', key: 'bandwidthSize' },
      { title: '基本价', dataIndex: 'price', key: 'price',  render: (text, record) => <Tag color="#87d068">{record && record.price}</Tag>},
      {
        title: '操作',
        key: 'control',
        fixed: 'right',
        width: 160,
        render: (text, record) => {
          const controls = [];
          controls.push(
            <Edit record={record} updatalists={() => this.updatalists()}>
              <span
                key="1"
                className="control-btn blue1"
              >
                <Tooltip placement="top" title="修改价格">
                  <FormOutlined></FormOutlined>
                </Tooltip>
              </span>
            </Edit>
          );
          controls.push(
            <Popconfirm
              key="3"
              title="确定删除吗?"
              onConfirm={() => this.onDel(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <span className="control-btn red1">
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
    return <Table columns={columns} rowKey={(record) => record.id}  dataSource={data} pagination={false} />;
  }
  updatalists = () => {
    this.onGetListData();
  }
  onDel = (id) => {
    http
      .delete(`${BSS_ADMIN_URL}/api/goods/bandwidth-price/${id}/delete`)
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.onGetListData();
          message.success("删除成功");
        } else {
          tools.dealFail(res);
        }
      })
      .catch(() => {
      });
  }
  handleOk = (val) => {
    val.bandwidthId = this.id;
    val.price = parseInt(val.price);
    val.bandwidthSize = parseInt(val.bandwidthSize);
    http
      .post(`${BSS_ADMIN_URL}/api/goods/bandwidth-price/add`, tools.clearEmpty(val))
      .then((res) => {
        res = res.data;
        if (res.code === 20000) {
          this.onAddNextShowClose();
          this.onGetListData();
          message.success("添加成功");
        } else {
          tools.dealFail(res);
        }
      })
      .catch(() => {
      });
  }
  render () {
    const {houseList} = this.props.areaResouse;
    const {lists, page, pageSize, total, lists2, loading, lists4} =  this.state;
    return (
      <main className="mian">
        {/* 操作 */}
        <div className="g-operate">
          <Button className="actions-btn" size="middle" onClick={() => {this.onModalShow();}}>添加</Button>
          <Button className="actions-btn" size="middle" onClick={() => {this.onGetListData();}}>刷新</Button>
        </div>
        {/* 数据展示 */}
        <div className="g-table">
          <Table
            columns={this.makeColumns()}
            rowKey={(record) => record.id}
            loading={loading}
            dataSource={lists}
            pagination={false}
            expandable={{
              indentSize: 0,
              expandedRowRender: (record) => this.expandedRowRender(record.bandwidthPrices)
            }}
          />
        </div>
        {/* <div className="g-pagination">
          <Pagination current={page} total={total} pageSize={pageSize}
            showSizeChanger
            showTotal={(total) => `共 ${total} 条`}
            onChange={(current, size) => {this.onPageChange(current, size);}}
            onShowSizeChange={(current, size) => {this.onPageSizeChange(current, size);}}
          />
        </div> */}
        <Modal
          title="添加"
          maskClosable={false}
          width="50%"
          destroyOnClose
          visible={this.state.modalShow}
          footer={null}
          onCancel={this.onModalClose}
          modalLoading={this.state.modalLoading}>
          <div>
            <Form
              name="form_in_modal"
              ref={this.formRef}
              onFinish={(value) => {
                this.onFinish(value);
              }}
              className="g-modal-field"
            >
              <FormItem
                label="所属业务类型"
                name="categoryId"
                rules={[
                  { required: true, message: "必填" },
                ]}
                {...formItemLayout2}
              >
                <Cascader options={this.props.lists2}  placeholder="请选择" fieldNames={{ label: 'name', value: 'id', children: 'children' }}/>
              </FormItem>
              <FormItem
                label="类型名"
                name="bandwidthName"
                rules={[
                  { required: true, message: "必填" },
                ]}
                {...formItemLayout2}
              >
                <Input
                  placeholder="请输入类型名"
                />
              </FormItem>
              <FormItem
                label="IPS供应商"
                name="ispVendors"
                rules={[
                  { required: true, message: "必填" },
                ]}
                {...formItemLayout2}
              >
                <Select
                  allowClear
                  placeholder="请选择IPS供应商"
                  mode="multiple"
                >
                  {lists4.map((value) => (
                    <Option value={value} key={value}>
                      {value}
                    </Option>
                  ))}
                </Select>
              </FormItem>
              <div className="actions-btn">
                <Button
                  htmlType="submit"
                  className="action-btn ok"
                >
                提交
                </Button>
                <Button
                  htmlType="reset"
                  className="action-btn ok"
                  onClick={this.reset}
                >
                重置
                </Button>
                <Button
                  onClick={this.onModalClose}
                  className="action-btn ok"
                  style={{ margin: "0 auto" }}
                >
                取消
                </Button>
              </div>
            </Form>
          </div>
        </Modal>
        <Modal
          title="添加阶梯价格"
          maskClosable={false}
          width="50%"
          destroyOnClose
          visible={this.state.AddNextShow}
          footer={null}
          onCancel={this.onAddNextShowClose}
        >
          <Add onOK={(val) => this.handleOk(val)} onClose={this.onAddNextShowClose} />
        </Modal>
      </main>
    );
  }
}
