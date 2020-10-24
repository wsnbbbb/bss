/* eslint-disable react/prop-types */
/** 资源模块/外机列表页 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import _ from 'lodash';
import {
  Form, Button, Input, Select, Radio, Pagination, Modal, InputNumber, Spin,
} from 'antd';
import { inject, observer} from 'mobx-react';
import { Link } from 'react-router-dom';
import http from '@src/util/http';
import tools from '@src/util/tools'; // 工具
import { cabinetStatusColor } from '@src/config/commvar'; // 全局变量
import { SYS_DICT_SERVERPART, SYS_DICT_COMMON} from '@src/config/sysDict'; // 全局变量
import { User } from '@src/util/user.js';
import debounce from 'lodash/debounce';
// ==================
// 所需的所有组件
// ==================
import PriceTable from '@src/pages/Products/container/PriceTable';
const { confirm } = Modal;
const { Option } = Select;
@observer
@inject("areaResouse")
export default class List extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    userinfo: P.any,
    diskSize: P.any, // 核心数下拉列表
    models: P.any, // 型号下拉列表
    activeKey: P.string, // 当前打开的tabkey 即机房id
    houseId: P.string, //
  };
  searchFormRef = React.createRef();
  constructor (props) {
    super(props);
    this.searchParam = {}, // 存储查询条件（顶部查询条件）
    this.state = {
      lists: [], //
      loading: false, // 外机数据正在加载中
      page: 1, // 当前第几页
      pageSize: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      modalShow: false,   // 机房增 修 查 状态模的显示
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      type: undefined, // 快速设置类型
      config: {}, // 参数
      price: undefined, // 基础价格
      copyedHouseId: undefined,  // 复制的机房
      hasPriceHouse: [],  // 设置价格的机房
    };
    this.setPrice = debounce(this.setPrice, 800);
  }
  componentDidMount () {
    if (this.props.activeKey && (this.props.activeKey == this.props.houseId)) {
      this.onGetListData();
    }
  }

  // 查询当前页面所需列表数据
  onGetListData = (values) => {
    const params = _.assign({}, {
      page: this.state.page,
      pageSize: this.state.pageSize,
      houseId: this.props.houseId,
    }, this.searchParam, {
      ...values
    });
    this.setState({
      loading: true,
    });


    http.get(`${BSS_ADMIN_URL}/api/goods/diskprice`, {
      params: tools.clearEmpty(params)
    })
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            lists: res.data.records,
            total: res.data.total,
          });
        } else {
          tools.dealFail(res);
        }
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
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
    this.onGetListData(values);
  }

  /**
   * 重置搜索条件
   */
  onResetSearch = () => {
    this.searchFormRef.current.resetFields();
  };

  // 表单页码改变
  onPageChange (page, pageSize) {
    this.setState({
      page: page,
    });
    this.onGetListData({
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
    this.onGetListData({
      page: page,
      pageSize: pageSize
    });
  }

  /**
   * 快速设置弹窗
   * **/
  onModalShow () {
    const { houseList } = this.props.areaResouse;
    // 获取已设置机房列表
    http.get(`${BSS_ADMIN_URL}/api/goods/cpuprice/4/price_house`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          let lists = _.filter(houseList, (house) => _.includes(res.data, house.id));
          this.setState({
            modalLoading: false,
            hasPriceHouse: lists
          });
        } else {
          this.setState({ modalLoading: false });
          tools.dealFail(res);
        }
      })
      .catch(() => {
        this.setState({ modalLoading: false });
      });
    this.setState({
      modalShow: true,
      config: {},
    });
  }

  // 快速设置确认操作
  onModalOk = () => {
    let param = {};
    let url = `${BSS_ADMIN_URL}/api/goods/diskprice`;
    const { type, copyedHouseId, config, price } = this.state;
    if (type == undefined) {
      Modal.error({
        title: "请选择快速设置方式"
      });
      return;
    }
    // 从机房复制
    if (type == 1) {
      if (!copyedHouseId) {
        Modal.error({
          title: '请选择机房'
        });
        return;
      }
      if (copyedHouseId == this.props.houseId) {
        Modal.error({
          title: '不能选择相同的机房作为复制源'
        });
        return;
      }
      param['houseId'] = this.props.houseId;
      // url = `${url}?setting_type=${type}&beaddhouseId=${copyedHouseId}`;
      url = `${url}/${type}/${copyedHouseId}/addbatch`;
    } else { // 根据参数批量设置
      if (!price) {
        Modal.error({
          title: '请输入价格'
        });
        return;
      }
      url = `${url}/${type}/null/addbatch`;
      param = {
        ...param,
        ...config,
        houseId: this.props.houseId,
        price: price,
        currency: 1
      };
    }
    // 提交信息
    this.setState({loading: true});
    http.post(`${url}`, param)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.onGetListData();
          this.onModalClose();
          tools.auto_close_result('ok', '操作成功');
        } else {
          tools.dealFail(res);
        }
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  onChangeType = (e) => {
    this.setState({
      type: e.target.value
    });
  }

  // 关闭快速设置价格弹窗
  onModalClose = () => {
    this.setState({
      modalShow: false
    });
  }


  // 修改快速设置参数方式
  onChangeConfig = (filedName, value) => {
    let conifg = {
      ...this.state.config
    };
    conifg[filedName] = value;
    this.setState({
      config: conifg
    });
  }
  // 设置快速复制的来源机房
  setOriginHouse = (val) => {
    this.setState({
      copyedHouseId: val
    });
  }

  // 设置价格
  setPrice = (val) => {
    this.setState({
      price: val
    });
  }

  render () {
    const columns = [{
      title: "配置",
      dataIndex: "configName",
      key: "configName",
    },
    {
      title: "类型",
      dataIndex: "diskShort",
      key: "diskShort",
      render: (text) => SYS_DICT_SERVERPART.disk_short[text]
    },
    {
      title: "接口",
      dataIndex: "interfaceType",
      key: "interfaceType",
      render: (text) => SYS_DICT_SERVERPART.disk_interface_type[text]
    },
    {
      title: "容量(G)",
      dataIndex: "diskSize",
      key: "diskSize",
    },
    {
      title: "规格",
      dataIndex: "diskMeasure",
      key: "diskMeasure",
      render: (text) => SYS_DICT_SERVERPART.server_disk_spec[text]
    },
    {
      title: "用途",
      dataIndex: "useType",
      key: "useType",
      render: (text) => SYS_DICT_SERVERPART.use_type[text]
    },
    {
      title: "基础价(/月)",
      dataIndex: "price",
      key: "price",
    }, {
      title: "币种",
      dataIndex: "currency",
      key: "currency",
      render: (text) => SYS_DICT_COMMON.currency[text] || ''
    }];
    const {lists, page, pageSize, total, loading, hasPriceHouse} =  this.state;
    const {diskSize} =  this.props;
    return (
      <main className="mian">
        {/* 搜索 */}
        <div className="g-search">
          <Form ref={this.searchFormRef} name="searchbox" layout="inline" onFinish={(values) => {this.onSearch(values);}}>
            <Form.Item name="diskShort">
              <Select
                style={{width: 200}}
                placeholder="硬盘类型" allowClear>
                {
                  _.map(SYS_DICT_SERVERPART.disk_short, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item name="interfaceType">
              <Select
                style={{width: 150}}
                placeholder="硬盘接口类型" allowClear>
                {
                  _.map(SYS_DICT_SERVERPART.disk_interface_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item name="diskSize">
              <Select
                style={{width: 200}}
                placeholder="容量" allowClear>
                {
                  _.map(diskSize, (item, key) => <Option value={item} key={item} > {item} </Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item name="diskMeasure">
              <Select
                style={{width: 200}}
                placeholder="规格" allowClear>
                {
                  _.map(SYS_DICT_SERVERPART.server_disk_spec, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                }
              </Select>
            </Form.Item>
            <Form.Item name="useType">
              <Select
                style={{width: 200}}
                placeholder="用途" allowClear>
                {
                  _.map(SYS_DICT_SERVERPART.use_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                }
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" >搜索</Button>
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={this.onResetSearch} >重置</Button>
            </Form.Item>
          </Form>
        </div>
        {/* 操作 */}
        <div className="g-operate">
          <Button className="actions-btn" size="middle" onClick={() => {this.onModalShow();}}>快速设置</Button>
          <Button className="actions-btn" size="middle" onClick={() => {this.onGetListData();}}>刷新列表</Button>
        </div>
        {/* 数据展示 */}
        <div className="g-table">
          <Spin spinning={loading}>
            <PriceTable data={lists} postData={{houseId: this.props.houseId}} postUrl={`${BSS_ADMIN_URL}/api/goods/diskprice`} columns={columns}
              updateList={this.onGetListData}  ></PriceTable>
          </Spin>
          <div className="g-pagination">
            <Pagination current={page} total={total} pageSize={pageSize}
              showSizeChanger
              showTotal={(total) => `共 ${total} 条`}
              onChange={(current, size) => {this.onPageChange(current, size);}}
              onShowSizeChange={(current, size) => {this.onPageSizeChange(current, size);}}
            />
          </div>
        </div>
        <Modal
          title="快速设置"
          maskClosable={false}
          width="700px"
          onOk={this.onModalOk}
          destroyOnClose
          onCancel={this.onModalClose}
          visible={this.state.modalShow}
          modalLoading={this.state.modalLoading}>
          <div className="fileds-form">
            <Radio.Group value={this.state.type} onChange={this.onChangeType}>
              <Radio value={1}>
                <span style={{paddingRight: 20}}>从已设置机房复制</span>
                <Select style={{ width: 400 }} onChange={this.setOriginHouse}
                  allowClear
                  filterOption={tools.filterOption}>
                  {
                    _.map(hasPriceHouse, (house) => <Select.Option key={house.id} value={house.id}>{house.fullName}</Select.Option>)
                  }
                </Select>
              </Radio>
              <div style={{marginTop: 20}}>
                <Radio value={2}>
                  <span>选择参数批量设置</span>
                  <div className="fileds">
                    <div className="filed">
                      <span className="filed-lable">硬盘类型</span>
                      <Select
                        onChange={(val) => {this.onChangeConfig('diskShort', val);}}
                        style={{width: 200}}
                        placeholder="硬盘类型" allowClear>
                        <Select.Option value={null} key={null}>任意</Select.Option>
                        {
                          _.map(SYS_DICT_SERVERPART.disk_short, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                        }
                      </Select>
                    </div>
                    <div className="filed">
                      <span className="filed-lable">硬盘接口类型</span>
                      <Select
                        onChange={(val) => {this.onChangeConfig('interfaceType', val);}}
                        style={{width: 150}}
                        placeholder="硬盘接口类型" allowClear>
                        <Select.Option value={null} key={null}>任意</Select.Option>
                        {
                          _.map(SYS_DICT_SERVERPART.disk_interface_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                        }
                      </Select>
                    </div>
                    <div className="filed">
                      <span className="filed-lable">容量</span>
                      <Select
                        onChange={(val) => {this.onChangeConfig('diskSize', val);}}
                        style={{width: 200}}
                        placeholder="容量" allowClear>
                        <Select.Option value={null} key={null}>任意</Select.Option>
                        {
                          _.map(diskSize, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                        }
                      </Select>
                    </div>
                    <div className="filed">
                      <span className="filed-lable">规格</span>
                      <Select
                        onChange={(val) => {this.onChangeConfig('diskMeasure', val);}}
                        style={{width: 200}}
                        placeholder="规格" allowClear>
                        <Select.Option value={null} key={null}>任意</Select.Option>
                        {
                          _.map(SYS_DICT_SERVERPART.server_disk_spec, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                        }
                      </Select>
                    </div>
                    <div className="filed">
                      <span className="filed-lable">用途</span>
                      <Select
                        onChange={(val) => {this.onChangeConfig('useType', val);}}
                        style={{width: 200}}
                        placeholder="用途" allowClear>
                        <Select.Option value={null} key={null}>任意</Select.Option>
                        {
                          _.map(SYS_DICT_SERVERPART.use_type, (item, key) => <Option value={parseInt(key)} key={key} > {item} </Option>)
                        }
                      </Select>
                    </div>
                    <div className="filed">
                      <span className="filed-lable">基础价(人民币)</span>
                      <InputNumber onChange={this.setPrice} />
                    </div>
                  </div>
                </Radio>
              </div>

            </Radio.Group>
          </div>
        </Modal>
      </main>
    );
  }
}
