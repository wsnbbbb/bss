/** 资源管理/节点编号的查看和编辑 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import {
  Input,
  Table,
  Modal,
} from 'antd';
import { inject, observer} from 'mobx-react';
import { withRouter } from 'react-router';

@withRouter
@inject('portDict')
@observer
class AddNode extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    match: P.any,
    portDict: P.any,
    powers: P.array, // 当前登录用户权限
    children: P.any,
    onSelect: P.func, // 自定义节点编号编辑确认
    title: P.string, // 弹窗title
    nodeParam: P.any, // 节点生成参数
    onOk: P.func, // 弹框确认
    onClose: P.func, // 只关闭弹窗
  };
  formRefAdd = React.createRef();
  formRefEdit = React.createRef();
  constructor (props) {
    super(props);
    this.newDataLen = 0; // 新数据个数
    this.nowData = {}; // 操作后的数据
    this.state = {
      nodeNum: this.props.nodeParam.nodeNum,
      sortWay: this.props.nodeParam.sortWay,
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

  // 展示组件
  modalShow () {
    const {sortWay, nodeNum } = this.props.nodeParam;
    if (sortWay == undefined || nodeNum == undefined) {
      Modal.error({
        title: '请选择节点类型并输入节点数'
      });
      return false;
    }
    let lists = this.state.lists;
    switch (sortWay) {
    case '0': // 按照数字排序
      lists = [];
      for (let i = 0; i < nodeNum; i++) {
        lists.push({
          id: null,
          index: i + 1,
          node: i + 1,
        });
      }
      break;
    case '1': // 大写字母ascil码65(A)- 90(Z)
      lists = [];
      for (let i = 0; i < nodeNum; i++) {
        lists.push({
          id: null,
          index: i + 1,
          node: String.fromCharCode(65 + i),
        });
      }
      break;
    case '2': // 自定义
      if ((this.state.nodeNum == undefined) || (this.state.sortWay != sortWay)) {
        // 自定义类型 而且用户修改数量，就让他重新输入节点名称，为自己犯的错误付出点代价，下次才能认真填数量
        lists = [];
        for (let i = 0; i < nodeNum; i++) {
          lists.push({
            id: null,
            index: i + 1,
            node: undefined,
          });
        }
      } else {
        lists = [...this.state.lists];
        // 如果数量增加
        if (nodeNum > this.state.nodeNum) {
          for (let i = this.state.nodeNum; i < nodeNum; i++) {
            lists.push({
              id: null,
              index: i + 1,
              node: undefined,
            });
          }
        }
        if (nodeNum < this.state.nodeNum) {
          lists.splice(nodeNum, this.state.nodeNum);
        }
      }
      break;
    }
    this.nowData = lists;
    this.setState({
      showModal: true,
      lists: lists,
      nodeNum: nodeNum,
      sortWay: sortWay,
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
      index: item.index,
      id: item.id,
      node: value
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
      },
      {
        title: '节点编号',
        dataIndex: 'node',
        width: 150,
        key: 'node',
        render: (text, record, index) => <div>
          <Input
            key={record.index}
            style={{width: "80%"}}
            value={text}
            disabled={this.props.nodeParam.sortWay != '2'}
            onChange={(e) => {this.changeNodeName(e.target.value, index);}} />
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
          okText="保存"
          cancelText="取消"
          onOk={this.onOk}
          onCancel={this.onClose}
          visible={showModal}
        >
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
export default AddNode;


