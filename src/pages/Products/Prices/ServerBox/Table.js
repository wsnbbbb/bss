/* eslint-disable react/prop-types */
import React, { useContext, useState, useEffect, useRef } from 'react';
import P from 'prop-types';
import { Table, Input, Button, Popconfirm, Form, Tag, Tooltip, loading} from 'antd';
import { SYS_DICT_PRODUCT, SYS_DICT_SERVER, SYS_DICT_COMMON } from '@src/config/sysDict'; // 全局变量
import {
  FormOutlined,
} from "@ant-design/icons";
import Edit from './container/Edit';
class EditableTable extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    updateList: P.func, // 更新table列表回调
    updatePath: P.string, // 修改价格调用api
    data: P.any, // 传递过来的数据源
  };
  constructor (props) {
    super(props);
    this.state = {
      loading: false,
    };
  }
  makeColumns (type) {
    const columns = [
      {
        title: "服务器类型",
        dataIndex: "serverType",
        key: "serverType",
        render: (text, record) => <Tag color="#2db7f5">{(record && SYS_DICT_SERVER.se_unittype[record.serverType])}</Tag>
      },
      {
        title: "基础价",
        dataIndex: "price",
        key: "price",
        // render: (text, record) => <Tag color="#87d068">{record && record.price}</Tag>
      },
      {
        title: "币种",
        dataIndex: "currency",
        key: "currency",
        render: (text, record) => (record && SYS_DICT_COMMON.currency[record.currency])
      },
      {
        title: "操作",
        key: 'control',
        fixed: 'right',
        width: 160,
        render: (text, record) => {
          const controls = [];
          controls.push(
            <Edit record={record} updatalists={() => this.updatalists()}>
              <span
                key="1"
                className="control-btn blue"
              >
                <Tooltip placement="top" title="修改价格">
                  <FormOutlined></FormOutlined>
                </Tooltip>
              </span>
            </Edit>
          );
          return controls;
        }
      },
    ];
    if (type === 2) {
      columns[0] = {
        title: "扩展能力",
        dataIndex: "configName",
        key: "configName",
      };
    }
    if (type === 3) {
      columns[0] = {
        title: "插槽数",
        dataIndex: "slot",
        key: "slot",
      };
    }
    if (type === 4) {
      columns[0] = {
        title: "支持raid卡",
        dataIndex: "isRaid",
        key: "isRaid",
        render: (text, record) => <Tag color="#2db7f5">{(record && SYS_DICT_COMMON.bool[record.isRaid])}</Tag>
      };
    }
    if (type === 5) {
      columns[0] = {
        title: "网卡数量",
        dataIndex: "networkNum",
        key: "networkNum",
      };
    }
    return columns;
  }
  updatalists = () => {
    this.props.updata(this.props.type);
  }
  render () {
    const { data } = this.props;
    const { type } = this.props;
    // const { loading } = this.state;
    return (
      <div>
        <Table
          rowClassName={() => 'editable-row'}
          rowKey={(record) => record.id}
          loading={this.props.loading}
          dataSource={data}
          columns={this.makeColumns(type)}
        />
      </div>
    );
  }
}

export default EditableTable;
