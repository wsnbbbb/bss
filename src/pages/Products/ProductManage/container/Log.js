import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Modal, Table } from 'antd';
import {
  EyeOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { inject, observer } from "mobx-react";
import tools from "@src/util/tools"; // 工具
import qs from "qs";
import _ from "lodash";
import http from "@src/util/http";
import { SYS_DICT_SERVERPART } from '@src/config/sysDict'; // 系统字典
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
export default class Log extends Component {
    static propTypes = {
      prop: PropTypes.func,
      id: PropTypes.string,
      children: PropTypes.any,
    }
    constructor (props) {
      super(props);
      this.state = {
        loading: false,
        showModal: false,
        lists: [],
      };
    }
    modalShow () {
      this.setState({loading: true});
      http
        .get(`${BSS_ADMIN_URL}/api/goods/product-master/${this.props.id}/editLog`)
        .then((res) => {
          res = res.data;
          if (tools.hasStatusOk(res)) {
            this.setState({
              lists: res.data,
            });
          } else {
            tools.dealFail(res);
          }
          this.setState({ loading: false });
        })
        .catch(() => {
          this.setState({ loading: false });
        });
      this.setState({
        showModal: true
      });
    }
    onClose = () => {
      this.setState({ showModal: false });
    };
    // 构建字段 机房
    makeColumns () {
      const columns = [
        {
          title: "序号",
          dataIndex: "id",
          key: "id",
          render: (text, record, index) => index + 1,
        },
        {
          title: "执行人",
          dataIndex: "editName",
          key: "editName",
        },
        {
          title: "操作",
          dataIndex: "editContent",
          key: "editContent",
        },
        {
          title: "时间",
          dataIndex: "editTime",
          key: "editTime",
          render: (text, record) => tools.getTime(text)
        },
      ];
      return columns;
    }
    render () {
      let { showModal, lists, loading} = this.state;
      return (
        <main style={{ float: 'left' }}>
          <Modal
            title="日志"
            maskClosable={false}
            width="60%"
            destroyOnClose
            footer={null}
            onCancel={this.onClose}
            visible={showModal}
          >
            <div className="g-table">
              <Table
                columns={this.makeColumns()}
                rowKey={(record) => record.id}
                loading={loading}
                dataSource={lists}
                pagination={false}
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
