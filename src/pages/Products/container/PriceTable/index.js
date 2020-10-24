/* eslint-disable react/prop-types */
import React, { useContext, useState, useEffect, useRef } from 'react';
import P from 'prop-types';
import { Table, Input, Button, Popconfirm, Form, Tag, Tooltip, loading} from 'antd';
import { SYS_DICT_PRODUCT, SYS_DICT_SERVER, SYS_DICT_COMMON } from '@src/config/sysDict'; // 全局变量
import {
  FormOutlined,
} from "@ant-design/icons";
import Edit from './Edit';
class EditableTable extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    updateList: P.func, // 更新table列表回调
    postUrl: P.string, // 修改价格调用api
    postData: P.any, // 额外参数
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
        title: "操作",
        key: 'control',
        fixed: 'right',
        width: 160,
        render: (text, record) => {
          const controls = [];
          controls.push(
            <Edit record={record} postData={this.props.postData} postUrl={this.props.postUrl} updateList={this.props.updateList}>
              <span
                key="1"
                className="control-btn blue"
              >
                <Tooltip placement="top" title={record.price  === "null" ? "添加价格" : "修改价格"}>
                  <FormOutlined></FormOutlined>
                </Tooltip>
              </span>
            </Edit>
          );
          return controls;
        }
      },
    ];
    return this.props.columns.concat(columns);
  }

  render () {
    const { data } = this.props;
    const { loading } = this.state;
    return (
      <div>
        <Table
          rowKey={(record) => record.configname}
          loading={loading}
          dataSource={data}
          pagination={false}
          columns={this.makeColumns()}
        />
      </div>
    );
  }
}

export default EditableTable;
