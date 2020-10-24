/** 资源管理/修改节点编号，针对自定义情况下 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import http from '@src/util/http';
import {
  Input,
  Table,
  Modal,
} from 'antd';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';

@withRouter
@observer
class EditNode extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    defaultValues: P.any, // 默认的节点编号
    children: P.array,
    onSelect: P.func, // 自定义节点编号编辑确认
    title: P.string, // 弹窗title
    nodeParam: P.any, // 节点生成参数
    onOk: P.func, // 弹框确认
    onClose: P.func, // 只关闭弹窗
  };
  formRefAddNode = React.createRef();
  formRefEditNode = React.createRef();
  constructor (props) {
    super(props);
    this.portkeys = {}; // 已存在的端口好，用于检测端口重复
    this.newDataLen = 0; // 新数据个数
    this.sortWay = this.props.nodeParam.sortWay;
    this.nodeNum = this.props.nodeParam.nodeNum;
    this.state = {
      lists: this.props.defaultValues,  // table表中的数据
      loading: false,
      showModal: false,
      showModalEdit: false,
      Editloading: false,
      lastNum: this.props.nodeParam.nodeNum, // 记录最后一次操作结果，又要避免重复累加的情况。
    };
  }
  componentDidMount () {
  }
  // shouldComponentUpdate (nextProps, nextState) {
  //   return nextState.someData !== this.state.someData;
  // }
  componentWillReceiveProps (nextProps) {
  }

  // 展示组件
  modalShow () {
    const {sortWay, nodeNum } = this.props.nodeParam;
    if (sortWay == undefined || nodeNum == undefined) {
      Modal.error({
        title: '请选择节点类型并输入节点数'
      });
      return false;
    }
    let lists = [...this.state.lists];
    switch (sortWay) {
    case '0': // 按照数字排序
      lists = [];
      for (let i = 0; i < nodeNum; i++) {
        lists.push({
          name: i + 1,
          id: null,
        });
      }
      break;
    case '1': // 大写字母ascil码65(A)- 90(Z)
      lists = [];
      for (let i = 0; i < nodeNum; i++) {
        lists.push({
          name: String.fromCharCode(65 + i),
          id: null,
        });
      }
      break;
    case '2': // 自定义
      if (this.nodeNum <= nodeNum && nodeNum !== this.state.lastNum) {
        // 自定义类型 针对原生数据节点数增加只累加；比已有的数据少则不做处理（因为被占用的节点是不可以删除的，&&不知道哪些节点可以删除）
        // 针对用户来回修改但未保存的数据，根据数量做增删操作
        if (nodeNum < this.state.lastNum) { // 当前数据数量针对上一次为保存的修改，减少了
          lists.splice(nodeNum, this.state.lastNum - nodeNum);
        } else if (nodeNum > this.state.lastNum) {
          for (let i = this.state.lastNum; i < nodeNum; i++) {
            lists.push({
              name: undefined,
              id: null,
            });
          }
        }
      }
      break;
    }
    this.setState({
      showModal: true,
      lists: lists,
      lastNum: nodeNum,
    });
  }
  // 端口管理确认
  onOk = () => {
    this.props.onSelect(this.state.lists);
    this.setState({
      showModal: false
    });
  }

  /** 点击关闭时触发 **/
  onClose = () => {
    this.setState({showModal: false});
  };

  // 修改节点名称
  changeNodeName (value, index) {
    let reg = new RegExp('-');
    if (reg.test(value)) {
      Modal.error({
        title: '节点名称不允许有中划线-'
      });
      return;
    }
    const newData = [...this.state.lists];
    const item = newData[index];
    newData.splice(index, 1, {
      name: value,
      id: item.id,
    });
    this.setState({
      lists: newData
    });
  }

  // 构建字段
  makeColumns () {
    const columns = [
      {
        title: '序号',
        dataIndex: 'index',
        width: 150,
        key: 'index',
        render: (text, record, index) => index + 1
      },
      {
        title: '节点编号',
        dataIndex: 'name',
        width: 150,
        key: 'name',
        render: (text, record, index) => <div>
          <Input
            style={{width: "80%"}}
            value={text}
            disabled={this.props.nodeParam.sortWay != '2'}
            onChange={(e) => {this.changeNodeName(e.target.value, index, record);}} />
        </div>
      }
    ];
    return columns;
  }

  render () {
    const {lists, showModal, loading} = this.state;
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
          visible={showModal}>
          {/* 数据展示 */}
          <div className="g-table">
            <Table
              columns={this.makeColumns()}
              rowKey={(record) => record.index}
              loading={loading}
              dataSource={lists}
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
export default EditNode;


