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
import {SYS_DICT_CABINET} from '@src/config/sysDict'; // 系统字典
import tools from '@src/util/tools'; // 工具
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
import RegionInput from '@src/pages/resources/container/RegionInput';
// ==================
// Definition
// ==================
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const { TreeNode } = TreeSelect;

@withRouter
@inject('root')
class CabinetRadio extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    root: P.any,
    children: P.any,
    title: P.string, // 弹窗title
    uw: P.number, // 占用U位数
    disabled: P.bool, // 父组件 来控制子组件是否可用 比如：前置条件机房已经有了 就让使用子组件
    disabledTip: P.string, // 不能使用子组件原因
    style: P.any, // 样式
    fetchPath: P.string, // 获取数据的查询条件及请求接口（不同模块使用机柜的查询条件不同）
    powers: P.array, // 当前登录用户权限
    defaultData: P.any,  // 当前选中的信息
    onSelect: P.func, // 确认选择
  };
  formRefAdd = React.createRef();
  constructor (props) {
    super(props);
    this.selectAreaNode = {}; // 选中的地区节点信息
    this.selectedRows = []; // 选中行数据
    this.uw = 0;
    this.state = {
      fetchPath: this.props.fetchPath,
      nwoData: {}, // 获取的机柜数据
      orgionLists: [], // 第一次获取的list数据（原始数据）
      lists: [], // 通过机柜名称查询后的数据
      loading: false,
      showModal: false,
      cabinetName: '',
    };
  }

  /**
   * 获取机柜详情信息
   * @param {
   * fileds:{} 输入的查询条件
   * }
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
            lists: res.data,
            orgionLists: res.data,
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
    this.props.onSelect(selectedRowKeys, selectedRows);
    this.setState({
      showModal: false,
      cabinetName: selectedRows[0].name,
    });
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.formRefAdd.current.resetFields();
  };

  modalShow () {
    if (this.props.disabled) {
      Modal.error({
        title: this.props.disabledTip
      });
      return false;
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
        title: '机柜名称',
        dataIndex: 'name',
        width: 150,
        key: 'name',
      },
      {
        title: '位置码',
        dataIndex: 'physicsLocationCode',
        key: 'physicsLocationCode'
      },
      {
        title: '行/列',
        dataIndex: 'row',
        key: 'row',
        render: (text, record) => `${record.row}/${record.coulmn}`
      },
      {
        title: '规格',
        dataIndex: 'spec',
        key: 'spec'
      },
      {
        title: '机柜属性',
        dataIndex: 'attribute',
        width: 100,
        key: 'attribute',
        render: (text, record) => SYS_DICT_CABINET.cabinet_attribute[text] || '未知属性'
      },
      {
        title: '总U位数',
        dataIndex: 'us',
        key: 'us'
      },
      {
        title: '剩余U位',
        dataIndex: 'usremain',
        key: 'usremain'
      },
      {
        title: '剩余最大U位数',
        dataIndex: 'usmaxremain',
        key: 'usmaxremain'
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark'
      }
    ];
    return columns;
  }

  render () {
    const {lists, showModal, loading, cabinetName} = this.state;
    return (
      <main className="mian">
        <Modal
          title={this.props.title || '选择机柜'}
          maskClosable={false}
          width="90%"
          destroyOnClose
          footer={false}
          onOk={this.onModalOk}
          onCancel={this.onClose}
          visible={showModal}
        >
          {/* 搜索 */}
          <div className="g-search">
            <Form ref={this.searchFormRef} name="searchbox" layout="inline" onFinish={(values) => {this.getDetail(values);}}>
              <Form.Item name="name">
                <Input placeholder="机柜名称" allowClear/>
              </Form.Item>
              <Form.Item>
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
              }}
            />
          </div>
        </Modal>
        <span onClick={() => {this.modalShow();}}>
          {this.props.children}
        </span>
      </main>
    );
  }
}
export default CabinetRadio;


