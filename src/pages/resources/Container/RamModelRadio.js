/**
 * 用于选择机柜,为其他组件提供
 */
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
  Pagination,
  Tooltip,
  Divider,
  Select,
  TreeSelect
} from 'antd';
import { EyeOutlined, FormOutlined, DeleteOutlined} from '@ant-design/icons';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';
import {observable} from "mobx";
import {formItemLayout, houseAttribute, UBitStatus} from '@src/config/commvar'; // 全局通用变量
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import { SYS_DICT_SERVERPART } from '@src/config/sysDict';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const { TreeNode } = TreeSelect;

@withRouter
@inject('root')
class RamRadio extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    root: P.any,
    children: P.any,
    powers: P.array, // 当前登录用户权限
    onSelect: P.func, // 确认选择
    fetchPath: P.func, // 查询url
  };
  formRefSearch = React.createRef();
  constructor (props) {
    super(props);
    this.selectedRows = []; // 选中行数据
    this.searchParam = {}; // 搜索条件（不包含分页）
    this.state = {
      lists: [],
      page: 1,
      pageSize: 10,
      loading: false,
      showModal: false,
    };
  }
  componentDidMount () {
  }
  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextProps.regionId !== this.props.regionId;
  // }
  componentWillReceiveProps (nextProps) {
    // if (nextProps.regionId && nextProps.regionId !== this.props.regionId) {
    //   this.getDetail();
    // }

  }

  /**
   * 获取内存条信息
   * @param {
   * us:number, u位数
   * regionId:string, 区域id
   * }  fileds
   */
  getDetail (fileds = {}) {
    const params = _.assign({}, {
      page: this.state.page,
      pageSize: this.state.pageSize,
    }, this.searchParam, {
      ...fileds
    });
    this.setState({
      loading: true,
    });
    http.get(this.props.fetchPath, {
      params: params
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            loading: false,
            lists: res.data.records,
            total: res.data.total
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

  // 选择选中行
  selectedRow (selectedRowKeys, selectedRows) {
    this.selectedRows = selectedRows;
    this.props.onSelect(selectedRowKeys, selectedRows[0]);
    this.setState({
      showModal: false,
    });
  }

  /**
   * 搜索
   * @param {obj} values 搜索条件
   */
  onSearch (values) {
    this.searchParam = values;
    this.setState({
      page: 1,
    });
    this.getDetail(values);
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.formRefSearch.current.resetFields();
  };

  // 表单页码改变
  onPageChange (page, pageSize) {
    this.setState({
      page: page,
    });
    this.getDetail({
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
    this.getDetail({
      page: page,
      pageSize: pageSize
    });
  }

  modalShow () {
    this.getDetail();
    this.setState({
      showModal: true
    });
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.setState({showModal: false});
  };

  // 构建字段
  makeColumns () {
    const columns = [
      // {

      //   dataIndex: 'id',
      //   key: 'id',
      //   render: (text, record, index) => index + 1
      // },
      {
        title: '内存型号名称',
        dataIndex: 'memName',
        key: 'memName'
      },
      {
        title: '产品组',
        dataIndex: 'productMapId',
        key: 'productMapId',

      },
      {
        title: '内存容量(GB)',
        dataIndex: 'memSize',
        key: 'memSize',

      },
      {
        title: '内存主频(MHZ)',
        dataIndex: 'memHz',
        key: 'memHz',
      },
      {
        title: '内存品牌',
        dataIndex: 'memBrand',
        key: 'memBrand',
      },
      {
        title: '内存型号',
        dataIndex: 'memModel',
        key: 'memModel',
      },
      {
        title: '内存规格',
        dataIndex: 'memSpec',
        key: 'memSpec',
        render: (text, record) => SYS_DICT_SERVERPART.mem_spec[text] || ''
      },
      {
        title: '内存类型',
        dataIndex: 'memType',
        key: 'memType',
        render: (text, record) => SYS_DICT_SERVERPART.memory_type[text] || ''
      },
      // {
      //   title: '内存校验',
      //   dataIndex: 'memVerify',
      //   key: 'memVerify',
      //   render: (text,record)=>{
      //     return this.props.serverDict.mem_verify[text]
      //   }
      // },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
      }
    ];
    return columns;
  }

  render () {
    const {lists, showModal, loading} = this.state;
    return (
      <React.Fragment>
        <Modal
          title={'选择内存卡型号'}
          maskClosable={false}
          width="98%"
          destroyOnClose
          footer={false}
          onCancel={this.onClose}
          visible={showModal}
        >
          {/* 搜索 */}
          <div className="g-search">
            <Form ref={this.searchFormRef} name="searchbox" layout="inline" onFinish={(values) => {this.onSearch(values);}}>
              <Form.Item name="memType">
                <Select
                  style={{ width: 240 }}
                  allowClear
                  placeholder="请选择内存类型"
                >
                  {_.map(SYS_DICT_SERVERPART.memory_type, (value, key) => (
                    <Option value={key} key={key}>
                      {value}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="memSize">
                <Input placeholder="请输入内存容量" allowClear />
              </Form.Item>
              <Form.Item name="memBrand">
                <Input
                  allowClear
                  placeholder="请输入内存品牌"
                >
                </Input>
              </Form.Item>
              <Form.Item name="memSpec">
                <Select
                  style={{ width: 240 }}
                  allowClear
                  placeholder="请选择内存规格"
                >
                  {_.map(SYS_DICT_SERVERPART.mem_spec, (value, key) => (
                    <Option value={key} key={key}>
                      {value}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item shouldUpdate>
                <Button type="primary" htmlType="submit" >搜索</Button>
                <Button type="primary" onClick={this.onResetSearch}>重置</Button>
              </Form.Item>
            </Form>
          </div>
          {/* 数据展示 */}
          <div className="g-table">
            <Table
              columns={this.makeColumns()}
              rowKey={(record) => record.id}
              loading={loading}
              dataSource={lists}
              pagination={false}
              rowSelection={{
                type: 'radio',
                onChange: (selectedRowKeys, selectedRows) => {this.selectedRow(selectedRowKeys, selectedRows);}
              }}/>
          </div>
          <div className="g-pagination">
            <Pagination current={this.state.page} total={this.state.total} pageSize={this.state.pageSize}
              showSizeChanger
              showTotal={(total) => `共 ${total} 条`}
              onChange={(current, size) => {this.onPageChange(current, size);}}
              onShowSizeChange={(current, size) => {this.onPageSizeChange(current, size);}}
            />
          </div>
        </Modal>
        <span onClick={() => {this.modalShow();}}>
          {this.props.children}
        </span>
      </React.Fragment>
    );
  }
}
export default RamRadio;


