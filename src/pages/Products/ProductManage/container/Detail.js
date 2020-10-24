import React, { Component } from 'react';
import P from 'prop-types';
import { Modal, Descriptions, Badge, Tag, Divider, Radio} from 'antd';
import {
  EyeOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { inject, observer } from "mobx-react";
import tools from "@src/util/tools"; // 工具
import qs from "qs";
import _ from "lodash";
import http from "@src/util/http";
import {SYS_DICT_PRODUCT, SYS_DICT_COMMON} from '@src/config/sysDict'; // 系统字典
import regExpConfig from '@src/config/regExp'; // 全局通用正则表达式
export default class Detail extends Component {
    static propTypes = {
      prop: P.func,
      children: P.any,
      id: P.string, // 产品id
    }
    constructor (props) {
      super(props);
      this.state = {
        loading: false,
        showModal: false,
        data: {},
        resConfig: {},
      };
    }
    modalShow () {
      this.setState({loading: true});
      http
        .get(`${BSS_ADMIN_URL}/api/goods/product-master/${this.props.id}`)
        .then((res) => {
          res = res.data;
          if (tools.hasStatusOk(res)) {
            let str = res.data.resourceConfig && res.data.resourceConfig.config;
            let config = JSON.parse(str);
            this.setState({
              data: res.data,
              resConfig: config
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
      let { showModal, data, resConfig} = this.state;
      return (
        <main style={{ float: 'left' }}>
          <Modal
            title="详情"
            maskClosable={false}
            width="60%"
            destroyOnClose
            footer={null}
            onCancel={this.onClose}
            visible={showModal}
          >
            <Descriptions title="产品详情" bordered size="middle">
              <Descriptions.Item label="产品名称" span={3}>{data && data.productMaster && data.productMaster.name}</Descriptions.Item>
              <Descriptions.Item label="产品图片" span={3}>
                <img style={{width: 300, height: 300}} src={data && data.productMaster && data.productMaster.logo ? `${FILE_URL}/file/${data.productMaster.logo}` : ''} />
              </Descriptions.Item>
              <Descriptions.Item label="产品描述" span={3}>{data && data.productMaster && data.productMaster.description}</Descriptions.Item>
              <Descriptions.Item label="所属业务" span={3}>{data && data.category && data.category.name}</Descriptions.Item>
              <Descriptions.Item label="销售区域" span={3}>{data && data.salesRegionList && data.salesRegionList.map((item) => <Tag color="#87d068" key={item.id}>{item.areaName}</Tag>)}</Descriptions.Item>
              <Descriptions.Item label="状态" span={3}>
                <Badge status="processing" text={data && data.productMaster && SYS_DICT_PRODUCT.product_master_status[data.productMaster.status]} />
              </Descriptions.Item>
              <Descriptions.Item label="基本价格">{data && data.productMaster && data.productMaster.price}</Descriptions.Item>
              <Descriptions.Item label="运营成本">{data && data.tradingConfig && data.tradingConfig.operatingCosts}</Descriptions.Item>
              <Descriptions.Item label="毛利率">{data && data.tradingConfig && data.tradingConfig.grossProfit}</Descriptions.Item>
              <Descriptions.Item label="币种">{data && data.tradingConfig && SYS_DICT_COMMON.currency[data.tradingConfig.currency]}</Descriptions.Item>
              <Descriptions.Item label="产品标签">{data && data.productLabelList && data.productLabelList.map((item) => <Tag color="#2db7f5" key={item.id}>{item.labelName}</Tag>)}</Descriptions.Item>
              <Descriptions.Item label="销售对象"> {data && data.salesObjectList && data.salesObjectList.map((item) => <Tag color="#f50" key={item.id}>{item.objectName}</Tag>)}</Descriptions.Item>
              <Descriptions.Item label="在售开始时间" span={1.5}>{data && data.productMaster && tools.getTime(data.productMaster.salesBegin)}</Descriptions.Item>
              <Descriptions.Item label="在售结束时间" span={1.5}>{data && data.productMaster && tools.getTime(data.productMaster.salesEnd)}</Descriptions.Item>
              <Descriptions.Item label="计费模式" span={1.5}>{data && data.tradingConfig && SYS_DICT_PRODUCT.pay_model[data.tradingConfig.tradingMode]}</Descriptions.Item>
              <Descriptions.Item label="交易模式" span={1.5}>{data && data.tradingConfig && SYS_DICT_PRODUCT.customer_pay_type[data.tradingConfig.chargingMode]}</Descriptions.Item>
              <Descriptions.Item label="资源机房" span={3}>
                {resConfig && resConfig.houses && resConfig.houses.options && _.map(resConfig.houses.options, (item) => <Tag color="cyan" key={item.id}>{item.children}</Tag>)}
                <br />
              </Descriptions.Item>
              <Descriptions.Item label="资源配置" span={3}>
                {JSON.stringify(resConfig.config)}
              </Descriptions.Item>
            </Descriptions>
          </Modal>
          <span onClick={() => {this.modalShow();}}>
            {this.props.children}
          </span>
        </main>
      );
    }
}
