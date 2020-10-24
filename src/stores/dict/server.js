import { observable, action, computed, runInAction, flow} from 'mobx';
import { message } from 'antd';
import tools from '@src/util/tools';
import _ from 'lodash';
import {ApiService as Fetchapi} from '@src/util/fetch-api'; // 自己写的工具函数，封装了请求数据的通用接口
class Server {
  @observable cms_del_flag = {};// 内容状态
  @observable releaseStatus = {};// 发布状态
  @observable source = {};// 来源
  @observable sale_status ={};// 销售状态
  @observable server_brand = {};// 服务器品牌
  @observable server_model = {};// 服务器型号
  @observable server_type = {};// 服务器类型
  @observable server_spec = {};// 服务器规格
  @observable server_use_type = {};// 服务器用途
  @observable server_status  = {};// 服务器销售状态
  @observable business_type   = {};// 业务类型(服务器中有使用，不知道其他地方是否需要)
  @observable server_disk_spec  = {};// 服务器硬盘规格
  @observable server_fault_category  = {};// 服务器故障状态

  @action setCdf = (list) => {
    this.cms_del_flag = _.assign({}, list);
  }
  @action setServerDiskSpec = (list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.server_disk_spec = obj;
  }
  @action setRs = (list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.releaseStatus =  obj;

  }
  @action setSc=(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.source =  obj;
  }
  @action setSt=(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.sale_status =  obj;
  }

  @action setServerBrand=(list) => {
    // let obj = {};
    // _.map(list, (item) => {
    //   obj[item.keyValues] = item.keyNames;
    // });
    this.server_brand =  list;
  }
  @action setServerModel  =(list) => {
    this.server_model  =  list;
  }
  @action setServerType =(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.server_type =  obj;
  }
  @action setServerSpec =(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.server_spec =  obj;
  }
  @action setServerUseType  =(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.server_use_type  =  obj;
  }
  @action setBusinessType  =(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.business_type  =  obj;
  }
  @action setServerStatus  =(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.server_status  =  obj;
  }
  @action setServerFaultStatus  =(list) => {
    this.server_fault_category  =  list;
  }
  /**
   * 获取服务器硬盘支持规格
   */
  fetchServerDiskSpec = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'server_disk_spec'});
        const data = response.data.data;
        this.setServerDiskSpec(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /**
   * 获取发布状态
   */
  fetchRs = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'releaseStatus'});
        const data = response.data.data;
        this.setRs(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /**
   * 获取来源
   */
  fetchSc = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'source'});
        const data = response.data.data;
        this.setSc(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );


  /** 销售状态 */
  fetchSt = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'sale_status'});
        const data = response.data.data;
        this.setSt(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /** 服务器品牌 */
  fetchServerBrand = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/userdict`, {keyType: "server_brand"});
        const data = response.data.data;
        this.setServerBrand(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /** 服务器型号 */
  fetchServerModel = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/userdict`, {keyType: "server_model"});
        const data = response.data.data;
        this.setServerModel(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /** 服务器类型 因为类型较少且字典值在页面进行逻辑判断，所以代码中使用commvar中配置的*/
  fetchServerType = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'se_unittype'});
        const data = response.data.data;
        this.setServerType(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );
  // 服务器规格
  fetchServerSpec = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'mem_spec'});
        const data = response.data.data;
        this.setServerSpec(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );
  // 服务器用途
  fetchServerUseType = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'server_useage'});
        const data = response.data.data;
        this.setServerUseType(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );
  // 服务器销售状态
  fetchServerStatus = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'market'});
        const data = response.data.data;
        this.setServerStatus(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );
  // 服务器显示方式
  fetchBusinessType = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: '1'});
        const data = response.data.data;
        this.setBusinessType(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );
   // 服务器故障状态
   fetchServerFaultStatus = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/userdict`, {keyType: 'server_fault_category'});
        const data = response.data.data;
        this.setServerFaultStatus(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );
}

const server = new Server();
export default server;
