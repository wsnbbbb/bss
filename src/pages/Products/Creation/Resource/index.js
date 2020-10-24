import React from 'react';
import P from 'prop-types';
import { withRouter } from 'react-router';
import http from '@src/util/http';
import tools from '@src/util/tools';
import { inject, observer} from 'mobx-react';
import { Steps, Button, message, Breadcrumb, Cascader, Modal, Spin } from 'antd';
import '../index.less';
import Base from './Base';
import Transaction from './Transaction.jsx';
import Res from './Res/index.js';
import moment from 'moment';
import { stringify } from 'qs';
const { Step } = Steps;
const steps = 4;
@withRouter
@inject("areaResouse")
class App extends React.Component {
  static propTypes = {
    location: P.any,
    history: P.any,
    userinfo: P.any,
    areaResouse: P.any,
  };
  constructor (props) {
    super(props);
    this.resourceConfigs = [];
    this.state = {
      loading: false,
      current: 0,
      categoryOptions: [],
      categoryOk: false,
      defaultMinRes: [], // 业务类型带过来的最小资源
      selectedCategoryId: undefined, // 下拉框选择的业务类型（点击确认才会存入categoryId）
      categoryId: undefined, // 确定的目录Id 是个数组，包含父级
      productInfo: {
        baseInfo: {}, // 产品基本信息
        resInfo: {}, // 资源信息
        transactionInfo: {
          currency: 1, // 默认整个系统使用统一的币种 人民币
        }, // 交易信息
      }, // 产品配置
    };
  }

  componentDidMount () {
    if (this.props.areaResouse.houseList.length <= 0) {
      this.props.areaResouse.fetchHouse();
    }
    if (this.props.areaResouse.rootAreaList.length <= 0) {
      this.props.areaResouse.fetchArea();
    }
    this.fetchCategory();
  }

  // 获取所有资源业务类型
  fetchCategory () {
    this.setState({
      loading: true,
    });
    http.get(`${BSS_ADMIN_URL}/api/goods/category?type=1`)
      .then((res) => {
        res = res.data;
        if (tools.hasStatusOk(res)) {
          this.setState({
            loading: false,
            categoryOptions: tools.dataToJson(null, res.data),
          });
        } else {
          this.setState({ loading: false });
          tools.dealFail(res);
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  // 选择业务类型
  setCategory = (value, selectedOptions) => {
    let minRes = [];
    let lastIndex = selectedOptions.length - 1;
    _.map(selectedOptions[lastIndex].resourceConfigs, (res) => {
      minRes.push(res.configId);
    });
    this.setState({
      categoryOk: true,
      categoryId: value,
      defaultMinRes: minRes, // 业务类型下的最小资源

    });
    this.next();
  }

  // 下一步
  next () {
    const current = this.state.current + 1;
    this.setState({ current });
  }

  // 上一步
  prev () {
    const current = this.state.current - 1;
    this.setState({ current });
  }

  // 保存配置信息
  saveContent (type, info) {
    console.log(info);
    let productInfo = {...this.state.productInfo};
    productInfo[type] = info;
    this.setState({
      productInfo: productInfo
    });
  }

  // postData 提交产品数据
 postData = () => {
   let param = {};
   const {categoryId} = this.state;
   const {baseInfo, resInfo, transactionInfo} = this.state.productInfo;
   let lastcategoryId;
   if (categoryId && categoryId.length > 0) {
     lastcategoryId = categoryId[categoryId.length - 1];
   }
   if (!lastcategoryId) {
     Modal.error({
       title: '请选择业务类型'
     });
   }
   // 产品图片处理
   if (!baseInfo.logo) {
     Modal.error({
       title: '请到基础配置页面，上传logo '
     });
     return;
   }
   param['resourceConfig'] = {config: JSON.stringify(resInfo)};
   // 设置交易配置
   param['tradingConfig'] = {
     ...transactionInfo,
     grossProfit: transactionInfo.grossProfit / 100
   };
   // 服务对象
   if (baseInfo.salesObjectList && baseInfo.salesObjectList.length > 0) {
     let lists = [];
     _.map(baseInfo.salesObjectList, (item) => {
       lists.push({
         objectId: item,
         objectName: '',
       });
     });
     param['salesObjectList'] = lists;
   }
   // 销售区域
   if (baseInfo.salesRegionList && baseInfo.salesRegionList.length > 0) {
     let lists = [];
     _.map(baseInfo.salesRegionList, (item) => {
       lists.push({
         areaId: item,
         areaName: '',
       });
     });
     param['salesRegionList'] = lists;
   }
   //  基本配置处理
   param['productMaster'] = {
     "categoryId": lastcategoryId || null,
     "description": baseInfo.description || '',
     "logo": baseInfo.logo,
     "name": baseInfo.name || '',
     "salesType": baseInfo.salesType,
   };
   if (baseInfo.salesType == 2) { // 自定义销售时间 需要传开始和结束时间
     param['productMaster'] = {
       ...param['productMaster'],
       "salesBegin": baseInfo.salesTime && baseInfo.salesTime[0] || null,
       "salesEnd": baseInfo.salesTime && baseInfo.salesTime[1] || null,
     };
   }
   this.setState({
     loading: true,
   });
   http.post(`${BSS_ADMIN_URL}/api/goods/product-master`, param)
     .then((res) => {
       res = res.data;
       if (tools.hasStatusOk(res)) {
         tools.auto_close_result('ok', '操作成功');
         this.setState({ loading: false });
         this.props.history.push('/products/manage');
       } else {
         this.setState({ loading: false });
         tools.dealFail(res);
       }
     })
     .catch(() => {
       this.setState({ loading: false });
     });
 }

 render () {
   const { current, categoryOk, categoryId, productInfo, defaultMinRes, loading} = this.state;
   return (
     <Spin spinning={loading}>
       <div className="bread">
         <Breadcrumb>
           <Breadcrumb.Item>产品管理</Breadcrumb.Item>
           <Breadcrumb.Item>产品创建</Breadcrumb.Item>
           <Breadcrumb.Item>资源型</Breadcrumb.Item>
         </Breadcrumb>
       </div>
       {/* 选中业务类型 */}
       {categoryOk && <div>
         <span>当前业务类型：</span>
         <Cascader
           disabled
           value={categoryId}
           style={{width: 800}}
           options={this.state.categoryOptions}
           fieldNames={{label: "name", value: "id", children: "children"}}
         />
         {/* <Button onClick={() => {this.categoryOk('reset');}}>重新选择</Button> */}
       </div>}
       {/* 配置产品信息 */}
       <div style={{marginTop: 20}}>
         <Steps current={current}>
           <Step key="category" title="选择业务类型" ></Step>
           <Step key="base" title="基础配置" ></Step>
           <Step key="res" title="资源配置" ></Step>
           <Step key="transaction" title="交易配置" ></Step>
         </Steps>
         {current == 0 && <div className="steps-content">
           <Cascader
             style={{width: 800}}
             defaultValue={categoryId}
             options={this.state.categoryOptions}
             onChange={this.setCategory}
             fieldNames={{label: "name", value: "id", children: "children"}}
           />
         </div>}
         {current == 1 && <div className="steps-content"><Base defaultValue={productInfo.baseInfo}
           saveContent={(info) => {this.saveContent('baseInfo', info);}}></Base></div>}
         {current == 2 && <div className="steps-content"><Res defaultValue={productInfo.resInfo} defaultMinRes={defaultMinRes}
           categoryId={categoryId}
           saveContent={(info) => {this.saveContent('resInfo', info);}}></Res></div>}
         {current == 3 && <div className="steps-content"><Transaction defaultValue={productInfo.transactionInfo}
           saveContent={(info) => {this.saveContent('transactionInfo', info);}}></Transaction></div>}
         <div className="steps-action">
           {current < steps - 1 && (
             <Button type="primary" onClick={() => this.next()}>下一步</Button>
           )}
           {current === steps - 1 && (
             <Button type="primary" onClick={this.postData}>完成</Button>
           )}
           {current > 0 && (
             <Button style={{ margin: '0 8px' }} onClick={() => this.prev()}>上一步</Button>
           )}
         </div>
       </div>
     </Spin>
   );
 }
}

export default App;
