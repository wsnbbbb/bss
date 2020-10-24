/**
 * 用于选择raid类型,为其他组件提供
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
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const { TreeNode } = TreeSelect;

@withRouter
@inject('root')
@inject('serverPartDict')
class RamRadio extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    root: P.any,
    serverPartDict: P.any,
    disabled: P.bool, // 父组件 来控制子组件是否可用 比如：前置条件机房已经有了 就让使用子组件
    disabledTip: P.string, // 不能使用子组件原因
    fetchPath: P.string, // 获取数据地址
    title: P.string,
    powers: P.array, // 当前登录用户权限
    onSelect: P.func, // 确认选择
  };
  formRefAdd = React.createRef();
  constructor (props) {
    super(props);
    this.selectAreaNode = {}; // 选中的地区节点信息
    this.selectedRows = []; // 选中行数据
    this.searchParam = {};
    this.houseId = '';
    this.uw = 0;
    this.state = {
      nwoData: {}, // 获取的机柜数据
      orgionLists: [], // 第一次获取的list数据（原始数据）
      lists: [], //
      page: 1,
      pageSize: 10,
      loading: false,
      showModal: false,
      memName: '',
    };
  }
  componentDidMount () {
  }
  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextProps.houseId !== this.props.houseId;
  // }
  componentWillReceiveProps (nextProps) {
    // if (nextProps.houseId && nextProps.houseId !== this.props.houseId) {
    //   this.getDetail();
    // }

  }

  /**
   * 获取内存条信息
   * @param {
   * houseId:string, 区域id
   * }  fileds
   */
  getDetail (fileds = {}) {
    this.setState({
      loading: true,
    });
    http.get(this.props.fetchPath, {
      params: fileds
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            loading: false,
            lists: res.data.records,
            orgionLists: res.data.records,
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
      memName: `${selectedRows[0].raidBrand}-${selectedRows[0].raidModel}-${selectedRows[0].raidCache}`,
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
    this.formRefAdd.current.resetFields();
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
    if (this.props.disabled) {
      Modal.warning({
        title: this.props.disabledTip
      });
      return;
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

  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: "品牌",
        dataIndex: "raidBrand",
        key: "raidBrand",
      },
      {
        title: "型号",
        dataIndex: "raidModel",
        key: "raidModel",
      },

      {
        title: "缓存",
        dataIndex: "raidCache",
        key: "raidCache",
      },
      {
        title: "类型",
        dataIndex: "raidType",
        key: "raidType",
        render: (text, record) => this.props.serverPartDict.raid_type[text]
      },
      {
        title: "备注",
        dataIndex: "remark",
        key: "remark",
      },
    ];
    return columns;
  }

  render () {
    const {lists, showModal, loading, memName} = this.state;
    return (
      <React.Fragment>
        <Modal
          title={this.props.title || '选择raid卡型号'}
          maskClosable={false}
          width="90%"
          destroyOnClose
          footer={false}
          onCancel={this.onClose}
          visible={showModal}
        >
          {/* 搜索 */}
          <div className="g-search">
            <Form ref={this.searchFormRef} name="searchbox" layout="inline" onFinish={(values) => {this.onSearch(values);}}>
              <Form.Item name="raidModel">
                <Input
                  allowClear
                  placeholder="请选择Raid卡型号"
                ></Input>
              </Form.Item>
              <Form.Item shouldUpdate>
                <Button type="primary" htmlType="submit" >搜索</Button>
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
          <Input style={{width: 300}} placeholder="选择raid卡型号" value={memName}></Input>
        </span>
      </React.Fragment>
    );
  }
}
export default RamRadio;


