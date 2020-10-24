import React, { Component } from 'react';
import P from 'prop-types';
import { Modal, Card, Radio, Divider, Form, } from 'antd';
import {
  EyeOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { inject, observer } from "mobx-react";
import tools from "@src/util/tools"; // 工具
import qs from "qs";
import _ from "lodash";
import http from "@src/util/http";
import { SYS_DICT_PRODUCT, SYS_DICT_SERVERPART, SYS_DICT_SERVER, SYS_DICT_COMMON } from '@src/config/sysDict'; // 系统字典
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
const { Meta } = Card;
const FormItem = Form.Item;
export default class Preview extends Component {
    static propTypes = {
      children: P.any,
      id: P.string,
    }
    constructor (props) {
      super(props);
      this.formRef = React.createRef();
      this.state = {
        loading: false,
        showModal: false,
        data: {},
        houses: [],
        trdingCode: 0,
        resConfig: {}
      };
    }
    modalShow () {
      http
        .get(`${BSS_ADMIN_URL}/api/goods/product-master/${this.props.id}`)
        .then((res) => {
          res = res.data;
          if (tools.hasStatusOk(res)) {
            let str = res.data.resourceConfig && res.data.resourceConfig.config;
            let config = JSON.parse(str);
            this.setState({
              data: res.data,
              houses: config.houses.options,
              trdingCode: res.data.tradingConfig.tradingMode,
              resConfig: config.config || {}
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
    render () {
      let { showModal, data, houses, resConfig} = this.state;
      return (
        <main style={{ float: 'left' }}>
          <Modal
            title="产品预览"
            maskClosable={false}
            width="60%"
            destroyOnClose
            footer={null}
            onCancel={this.onClose}
            visible={showModal}
          >
            <p className="p">{data && data.productMaster && data.productMaster.name}</p>
            <Divider dashed />
            <div className="div">
              <span className="span">区域：</span>
              <Radio.Group buttonStyle="solid" >
                {
                  houses && houses.map((item) => <Radio.Button key={item.key} value={item.key}>{item.children}</Radio.Button>)
                }
              </Radio.Group>
            </div>
            <Divider dashed />
            <div className="div">
              <span className="span">计费模式：</span> <Radio.Group value={this.state.trdingCode} buttonStyle="solid">
                {_.map(SYS_DICT_PRODUCT.pay_model, (value, key) => <Radio.Button key={key} value={parseInt(key)}>{value}</Radio.Button>)}
              </Radio.Group>
            </div>
            <Divider />
            <p className="p">服务器配置：</p>
            {resConfig['2'] && <div className="div">
              <p className="p">CPU</p>
              {resConfig['2'].coreNum && resConfig['2'].coreNum.limit && resConfig['2'].coreNum.userSee && <div className="config-item">
                <span className="span2">核心</span>
                <Radio.Group  value={resConfig['2'].coreNum.defaultValue} buttonStyle="solid">
                  {resConfig['2'].coreNum.values.map((item) => <Radio.Button key={item} value={item}>{item}</Radio.Button>)}
                </Radio.Group>
              </div>}
              {resConfig['2'].models &&  resConfig['2'].models.limit && resConfig['2'].models.userSee && <div className="config-item">
                <span className="span2">型号</span>
                <Radio.Group  value={resConfig['2'].models.defaultValue} buttonStyle="solid">
                  {resConfig['2'].models.values.map((item) => <Radio.Button key={item} value={item}>{item}</Radio.Button>)}
                </Radio.Group>
              </div>}
            </div>}
            {resConfig['3'] && <div className="div">
              <p className="p">内存</p>
              {resConfig['3'].memType && resConfig['3'].memType.limit && resConfig['3'].memType.userSee && <div className="config-item">
                <span className="span2">类型</span>
                <Radio.Group  value={resConfig['3'].memType.defaultValue} buttonStyle="solid">
                  {resConfig['3'].memType.values.map((item) => <Radio.Button key={item} value={item}>{SYS_DICT_SERVERPART.memory_type[item]}</Radio.Button>)}
                </Radio.Group>
              </div>}
              {resConfig['3'].memSize && resConfig['3'].memSize.limit && resConfig['3'].memSize.userSee && <div className="config-item">
                <span className="span2">容量</span>
                <Radio.Group  value={resConfig['3'].memSize.defaultValue} buttonStyle="solid">
                  {resConfig['3'].memSize.values.map((item) => <Radio.Button key={item} value={item}>{item}</Radio.Button>)}
                </Radio.Group>
              </div>}
            </div>}
            {resConfig['4'] && <div className="div">
              <p className="p">硬盘</p>
              {resConfig['4'].interfaceType && resConfig['4'].interfaceType.limit && resConfig['4'].interfaceType.userSee && <div className="config-item">
                <span className="span2">接口</span>
                <Radio.Group  value={resConfig['4'].interfaceType.defaultValue} buttonStyle="solid">
                  {resConfig['4'].interfaceType.values.map((item) => <Radio.Button key={item} value={item}>{SYS_DICT_SERVERPART.disk_interface_type[item]}</Radio.Button>)}
                </Radio.Group>
              </div>}
              {resConfig['4'].diskSize && resConfig['4'].diskSize.limit && resConfig['4'].diskSize.userSee && <div className="config-item">
                <span className="span2">容量</span>
                <Radio.Group  value={resConfig['4'].diskSize.defaultValue} buttonStyle="solid">
                  {resConfig['4'].diskSize.values.map((item) => <Radio.Button key={item} value={item}>{item}</Radio.Button>)}
                </Radio.Group>
              </div>}
              {resConfig['4'].deviceSpec && resConfig['4'].deviceSpec.limit && resConfig['4'].deviceSpec.userSee && <div className="config-item">
                <span className="span2">规格</span>
                <Radio.Group  value={resConfig['4'].deviceSpec.defaultValue} buttonStyle="solid">
                  {resConfig['4'].deviceSpec.values.map((item) => <Radio.Button key={item} value={item}>{SYS_DICT_SERVERPART.server_disk_spec[item]}</Radio.Button>)}
                </Radio.Group>
              </div>}
              {resConfig['4'].useType && resConfig['4'].useType.limit && resConfig['4'].useType.userSee && <div className="config-item">
                <span className="span2">用途</span>
                <Radio.Group  value={resConfig['4'].useType.defaultValue} buttonStyle="solid">
                  {resConfig['4'].useType.values.map((item) => <Radio.Button key={item} value={item}>{SYS_DICT_SERVERPART.use_type[item]}</Radio.Button>)}
                </Radio.Group>
              </div>}
            </div>}
            {resConfig['1'] && <div className="div">
              <p className="p">机箱</p>
              {resConfig['1'].dserverType && resConfig['1'].dserverType.limit && resConfig['1'].dserverType.userSee && <div className="config-item">
                <span className="span2">类型</span>
                <Radio.Group  value={resConfig['1'].dserverType.defaultValue} buttonStyle="solid">
                  {resConfig['1'].dserverType.values.map((item) => <Radio.Button key={item} value={item}>{SYS_DICT_SERVER.se_unittype[item]}</Radio.Button>)}
                </Radio.Group>
              </div>}
              {resConfig['1'].networkNum && resConfig['1'].networkNum.limit && resConfig['1'].networkNum.userSee && <div className="config-item">
                <span className="span2">网卡数量</span>
                <Radio.Group  value={resConfig['1'].networkNum.defaultValue} buttonStyle="solid">
                  {resConfig['1'].networkNum.values.map((item) => <Radio.Button key={item} value={item}>{item}</Radio.Button>)}
                </Radio.Group>
              </div>}
              {resConfig['1'].mem && resConfig['1'].mem.limit && resConfig['1'].mem.userSee && <div className="config-item">
                <p>内存扩展能力</p>
                <span className="span2">最大容量</span>
                <Radio.Group  value={resConfig['1'].mem.defaultValue} buttonStyle="solid">
                  {resConfig['1'].mem.values.map((item) => <Radio.Button key={item} value={item}>{item}</Radio.Button>)}
                </Radio.Group>
              </div>}
              {resConfig['1'].disk && resConfig['1'].disk.limit && resConfig['1'].disk.userSee && <div className="config-item">
                <p>硬盘扩展能力</p>
                <span className="span2">插槽数</span>
                <Radio.Group  value={resConfig['1'].disk.defaultValue} buttonStyle="solid">
                  {resConfig['1'].disk.values.map((item) => <Radio.Button key={item} value={item}>{item}</Radio.Button>)}
                </Radio.Group>
              </div>}
              {resConfig['1'].raid && resConfig['1'].raid.limit && resConfig['1'].raid.userSee && <div className="config-item">
                <p>Raid卡</p>
                <span className="span2">是否支持</span>
                <Radio.Group  value={resConfig['1'].raid.defaultValue} buttonStyle="solid">
                  {resConfig['1'].raid.values.map((item) => <Radio.Button key={item} value={item}>{SYS_DICT_COMMON.bool[item]}</Radio.Button>)}
                </Radio.Group>
              </div>}
            </div>}
          </Modal>
          <span onClick={() => {this.modalShow();}}>
            {this.props.children}
          </span>
        </main>
      );
    }
}
