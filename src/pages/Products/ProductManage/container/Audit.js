import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'antd'
import {
    EyeOutlined,
    FormOutlined,
  } from "@ant-design/icons";
import { inject, observer } from "mobx-react";
import tools from "@src/util/tools"; // 工具
import qs from "qs";
import _ from "lodash";
import http from "@src/util/http";
import {SYS_DICT_SERVERPART} from '@src/config/sysDict'; // 系统字典
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
export default class Audit extends Component {
    static propTypes = {
        prop: PropTypes.func,
    }
    constructor (props) {
        super(props);
        this.state = {
          loading: false,
          showModal: false,
        };
      }
    modalShow () {
        this.setState({
          showModal: true
        });
    }
    onClose = () => {
        this.setState({ showModal: false });
    };
    render() {
        let {showModal} = this.state;
        return (
            <main style={{float: 'left'}}>
                <Modal
                title='审核'
                maskClosable={false}
                width="50%"
                destroyOnClose
                footer={null}
                onCancel={this.onClose}
                visible={showModal}
                >
                <p>审核组件</p>
                </Modal>
                <span onClick={() => { this.modalShow(); }}>
                    {this.props.children}
                </span>
            </main>
        )
    }
}
