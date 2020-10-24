/* eslint-disable react/prop-types */
/** 交易系统 交易模式 **/

// ==================
// 所需的各种插件
// ==================

import React from 'react';
import P from 'prop-types';
import {
  Button,
  Table,
  Pagination,
  Tooltip,
  Divider,
} from 'antd';
import {
  FormOutlined,
} from "@ant-design/icons";
import { inject, observer } from 'mobx-react';
import http from '@src/util/http';
import { User } from '@src/util/user.js';
import tools from '@src/util/tools'; // 工具
import { modeType } from '@src/config/commvar'; // 工具
import Axios from 'axios';

// ==================
// 所需的所有组件
// ==================
import Add from './container/Add';


@inject('root')
@observer
export default class list extends React.Component {
  static propTypes = {
    location: P.any, // 当前位置
    history: P.any,
    root: P.any, // 全局状态
    match: P.any, // 路径
  };

  searchFormRef = React.createRef();

  constructor (props) {
    super(props);
    console.log(this.props),
    this.selectedRow = {
      length: 0,
      keys: [],
      rows: [],
    }; // 选中数据
    this.searchParam = {}; // 搜索条件，因为不需要条件更新来及时的重新渲染组件，所以不放在state中
    this.state = {
      searchParam: {}, // 搜索条件
      lists: [], // 当前表格全部数据有层级关系 用于排序操作
      loading: false, // 表格数据是否正在加载中
      page: 1, // 当前第几页
      pageSize: 20, // 每页多少条
      total: 0, // 数据库总共多少条数据
      modalLoading: false, // 添加/修改/查看 是否正在请求中
      nowData: {}, // 当前选中ip的信息，用于查看详情、修改
      modalShow: false,   // ip增 修 查 状态模的显示
      selectedRowKeys: [], // 选中的行
      regionInfo: {},
      productList:[]
    };
  }

  componentDidMount () {
    this.onGetListData();
    this.getProductList();
  }


  // 获取产品类型
  getProductList () {
    Axios({
      method: 'get',
      // url: 'http://10.2.5.226:7007/admin/mode/products',
      url: `${TRADING_API}/admin/mode/products`,
      headers: {
        'Authorization': 'token ' + User.getToken(),
      },
    })
      .then((res) => {
        // console.log(res)
        res = res.data;
        console.log(res);
        if (tools.hasStatusOk(res)) {
          this.setState({
            productList: res.data
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

  // 查询当前页面所需列表数据
  onGetListData (values) {
    // 区域的数据
    values = values || this.state.regionInfo;
    const params = _.assign({}, {
      page: 1,
    }, this.searchParam, {
      ...values
    });
    this.setState({
      loading: true,
    });
    Axios({
      method: 'get',
      // url: 'http://10.2.5.226:7007/admin/mode/page',
      url: `${TRADING_API}/admin/mode/page`,
      headers: {
        'Authorization': 'token ' + User.getToken(),
      },
      params: params
    })
      .then((res) => {
        // console.log(res)
        res = res.data;
        console.log(res);
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


  // 表单页码改变
  onPageChange (page, pageSize) {
    this.setState({
      page: page,
    });
    this.onGetListData({
      page: page,
      size: pageSize
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
      size: pageSize
    });
  }

  // 重置搜索条件
  onResetSearch = () => {
    this.searchFormRef.current.resetFields();
  };

  /**
* 搜索
* @param {obj} values 搜索条件
*/
  onSearchfrom (values) {
    this.searchParam = values;
    this.setState({ searchValue: values });
    this.onGetListData(values);
  }

  // 查看、修改、添加弹窗
  onModalShow (type, data) {
    if (type == 'up') {
      if (data.modeType == '0301') {
        let datas = {
          ...data,
          style_Prepayment: 'block',
          style_postpaid: 'none',
          orderPayCycle: data.parameter.orderPayCycle,
          orderMaxNoPay: data.parameter.orderMaxNoPay,
          billingCycle: data.parameter.billingCycle,
          billPayCycle: data.parameter.billPayCycle,
        };

        if (datas.orderPayCycle !== null) {
          if (datas.orderPayCycle.indexOf('d') !== -1) {
            datas.unit1 = 'd';
            datas.orderPayCycle = datas.orderPayCycle.split('d')[0];
          } else {
            datas.unit1 = 'h';
            datas.orderPayCycle = datas.orderPayCycle.split('h')[0];
          }
        }

        if (datas.billingCycle !== null) {
          if (datas.billingCycle.indexOf('d') !== -1) {
            datas.unit2 = 'd';
            datas.billingCycle = datas.billingCycle.split('d')[0];
          } else {
            datas.unit2 = 'h';
            datas.billingCycle = datas.billingCycle.split('h')[0];
          }
        }

        if (datas.billPayCycle !== null) {
          if (datas.billPayCycle.indexOf('d') !== -1) {
            datas.unit3 = 'd';
            datas.billPayCycle = datas.billPayCycle.split('d')[0];
          } else {
            datas.unit3 = 'h';
            datas.billPayCycle = datas.billPayCycle.split('h')[0];
          }
        }

        console.log(datas);
        this.setState({
          modalShow: true,
          nowData: datas,
          operateType: type,
        });

      } else if (data.modeType == '0302') {
        let datas = {
          ...data,
          style_Prepayment: 'none',
          style_postpaid: 'block',
          orderPayCycle: data.parameter.orderPayCycle,
          orderMaxNoPay: data.parameter.orderMaxNoPay,
          billingCycle: data.parameter.billingCycle,
          billPayCycle: data.parameter.billPayCycle,
        };
        if (datas.orderPayCycle !== null) {
          if (datas.orderPayCycle.indexOf('d') !== -1) {
            datas.unit1 = 'd';
            datas.orderPayCycle = datas.orderPayCycle.split('d')[0];
          } else {
            datas.unit1 = 'h';
            datas.orderPayCycle = datas.orderPayCycle.split('h')[0];
          }
        }

        if (datas.billingCycle !== null) {
          if (datas.billingCycle.indexOf('d') !== -1) {
            datas.unit2 = 'd';
            datas.billingCycle = datas.billingCycle.split('d')[0];
          } else {
            datas.unit2 = 'h';
            datas.billingCycle = datas.billingCycle.split('h')[0];
          }
        }

        if (datas.billPayCycle !== null) {
          if (datas.billPayCycle.indexOf('d') !== -1) {
            datas.unit3 = 'd';
            datas.billPayCycle = datas.billPayCycle.split('d')[0];
          } else {
            datas.unit3 = 'h';
            datas.billPayCycle = datas.billPayCycle.split('h')[0];
          }
        }

        console.log(datas);
        this.setState({
          modalShow: true,
          nowData: datas,
          operateType: type,
        });
      }
    } else {
      if (data.modeType == '0301') {
        let datas = {
          ...data,
          style_Prepayment: 'block',
          style_postpaid: 'none',
          unit1: 'd',
          unit2: 'd',
          unit3: 'd',
        };
        this.setState({
          modalShow: true,
          nowData: datas,
          operateType: type,
        });
      } else {
        let datas = {
          ...data,
          style_Prepayment: 'none',
          style_postpaid: 'block',
          unit1: 'd',
          unit2: 'd',
          unit3: 'd',
        };
        console.log(datas);
        this.setState({
          modalShow: true,
          nowData: datas,
          operateType: type,
        });
      }
    }
  }

  changePassword (data) {
    this.setState({
      changemodalShow: true,
      nowData: data,
    });
  }

  onModalClose = () => {
    this.setState({
      modalShow: false,
      changemodalShow: false
    });
  }

  // 添加、修改用户信息
  onModalOk (obj) {
    if (this.state.operateType == 'add') {
      console.log(obj);
      let param = tools.clearNull(obj);
      Axios({
        method: 'post',
        // url: 'http://10.2.5.226:7007/admin/mode/add',
        url: `${TRADING_API}/admin/mode/add`,
        headers: {
          'Authorization': 'token ' + User.getToken(),
        },
        data: param
      })
      // http.post(`${BSS_ADMIN_URL}/api/customer/agencyLevel/add`, param)
        .then((res) => {
          res = res.data;
          console.log(res);
          if (tools.hasStatusOk(res)) {
            this.setState({
              modalLoading: false,
              modalShow: false,
            });
            this.onGetListData();
            tools.auto_close_result('ok', '操作成功');
          } else {
            tools.dealFail(res);
          }
          this.setState({ modalLoading: false });
        })
        .catch(() => {
          this.setState({ modalLoading: false });
        });
    } else {
      console.log(obj);
      this.setState({
        loading: true,
        modalLoading: true,
      });
      // http.put(`${BSS_ADMIN_URL}/api/customer/agencyLevel/${obj.id}/update`, obj)
      Axios({
        method: 'put',
        // url: 'http://10.2.5.226:7007/admin/mode/edit',
        url: `${TRADING_API}/admin/mode/edit`,
        headers: {
          'Authorization': 'token ' + User.getToken(),
        },
        data: obj
      })
        .then((res) => {
          console.log(res);
          res = res.data;
          if (tools.hasStatusOk(res)) {
            tools.auto_close_result('ok', '操作成功');
            this.setState({
              page: 1,
              modalLoading: false,
              modalShow: false,
            });
            this.onGetListData({ page: 1 });
          } else {
            tools.dealFail(res);
          }
          this.setState({ modalLoading: false, loading: false });
        })
        .catch(() => {
          this.setState({ modalLoading: false, loading: false });
        });
    }
  }


  onChangepassWord (obj) {
    console.log(obj);
  }

  // 构建字段
  makeColumns () {
    const {productList} = this.state;
    const columns = [
      {
        title: '模式ID',
        dataIndex: 'id',
        key: 'id',
      },
      {
        title: '模式名',
        dataIndex: 'modeName',
        key: 'modeName',
      },
      {
        title: '模式类型',
        dataIndex: 'modeType',
        key: 'modeType',
        render: (text, record) => modeType[text]
      },
      {
        title: '使用的产品/业务',
        dataIndex: 'product',
        key: 'product',
        render: (text, record) => (
          productList.map((e) => {
            if (e.id == text) {
              console.log(e.name);
              return e.name;
            }
          }))
      },
      {
        title: '回调地址',
        dataIndex: 'notifyUrl',
        key: 'notifyUrl',
      },
      {
        title: '参数配置',
        dataIndex: 'parameter',
        key: 'parameter',
        width: 400,
        render: (text, record) => {
          if (record.modeType == '0301') {
              // if(text.orderPayCycle.indexOf('h')>0){
              //   text.orderPayCycle=text.orderPayCycle.replace('h','小时')
              // }else{
              //   text.orderPayCycle=text.orderPayCycle.replace('d','天')
              // }
              return  "订单付款周期:" + text.orderPayCycle + ", 未支付订单数量:" + text.orderMaxNoPay;
          } else {
            // if(text.billingCycle.indexOf('h')>0){
            //   text.billingCycle=text.billingCycle.replace('h','小时')
            // }else{
            //   text.billingCycle=text.billingCycle.replace('d','天')
            // }
            // if(text.billPayCycle.indexOf('h')>0){
            //   text.billPayCycle=text.billPayCycle.replace('h','小时')
            // }else{
            //   text.billPayCycle=text.billPayCycle.replace('d','天')
            // }
            return " 计费周期:" + text.billingCycle + ", 账单支付周期:" + text.billPayCycle;
          }
        }
      },
      {
        title: "操作",
        key: "control",
        fixed: "right",
        width: 240,
        render: (text, record) => {
          const controls = [];
          controls.push(
            <span
              key="1"
              className="control-btn blue"
              onClick={() => this.onModalShow("up", record)}
            >
              <Tooltip placement="top" title="编辑">
                <FormOutlined></FormOutlined>
              </Tooltip>
            </span>
          );
          const result = [];
          controls.forEach((item, index) => {
            if (index) {
              result.push(<Divider key={`line${index}`} type="vertical" />);
            }
            result.push(item);
          });
          return result;
        },
      },
    ];
    return columns;
  }

  render () {
    const { lists, loading, page, pageSize, total } = this.state;
    return (
      <main className="mian">
        {/* 操作 */}
        <div className="g-operate">
          <Button size="middle" className="actions-btn" onClick={() => this.onModalShow("add", { modeType: '0301' })}>自定义交易模式</Button>
        </div>
        {/* 数据展示 */}
        <div className="g-table">
          <Table
            scroll={{ x: 1600 }}
            columns={this.makeColumns()}
            rowKey={(record) => record.id}
            loading={loading}
            dataSource={lists}
            pagination={false}
          />
          <div className="g-pagination">
            <Pagination current={page} total={total} pageSize={pageSize}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `共 ${total} 条`}
              onChange={(current, size) => {this.onPageChange(current, size);}}
              onShowSizeChange={(current, size) => {this.onPageSizeChange(current, size);}} />
          </div>
        </div>
        {/* 新增&修改&查看 模态框 */}
        <Add
          visible={this.state.modalShow}
          modalLoading={this.state.modalLoading}
          data={this.state.nowData}
          operateType={this.state.operateType}
          onOk={(v) => this.onModalOk(v)}
          onClose={() => this.onModalClose()}
          num={this.state.num}
          productList={this.state.productList}
        />
      </main>
    );
  }
}
