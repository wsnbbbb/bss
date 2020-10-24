import { observable, action, computed, runInAction, flow } from 'mobx';
import { message } from 'antd';
import tools from '@src/util/tools';
import _ from 'lodash';
import { ApiService as Fetchapi } from '@src/util/fetch-api'; // 自己写的工具函数，封装了请求数据的通用接口
class Ipresource {

  @observable house = {};// 机房区域
  @observable ipType = {};// ip类型
  @observable businessType = {};// 业务类型
  @observable bandwidthType = {};// 带宽类型
  @observable showType = {};// 显示方式
  @observable isWall = {};// 是否过墙
  @observable isDefense = {};// 是否防御
  @observable source = {};// ip来源
  @observable isLock = {};// 锁定状态
  @observable resStatus = {};// 资源状态
  @observable specialStatus = {};// 特殊状态
  @observable appropriateTypes = {};// 适用客户类型
  @observable defenseline = {};// 防御线路


  @action setHouseShowMode = (list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.house = obj;
  }
  @action setIptype = (list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    console.log(obj);
    this.ipType = obj;
  }
  @action setbusinessType = (list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.businessType = obj;
  }
  @action setbandwidthType  =(list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.id] = item.bandwidthName;
    });
    this.bandwidthType  =  obj;
    console.log(this.bandwidthType)
  }
  @action setshowType = (list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.showType = obj;
  }
  @action setisWall = (list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.isWall = obj;
  }
  @action setisDefense = (list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.isDefense = obj;
  }
  @action setsource = (list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.source = obj;
  }
  @action setisLock = (list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.isLock = obj;
  }
  @action setresStatus = (list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.resStatus = obj;
  }
  @action setspecialStatus = (list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.specialStatus = obj;
  }
  @action setappropriateTypes = (list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.appropriateTypes = obj;
  }
  @action setIpStatus = (list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.ip_res_status = obj;
  }
  @action setSpecialStatus = (list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.special_status = obj;
  }
  @action setdefenseline = (list) => {
    let obj = {};
    _.map(list, (item) => {
      obj[item.keyValues] = item.keyNames;
    });
    this.defenseline = obj;
  }
  // 机房区域
  fetchHouse = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/product/area`, { keyType: 'name' });
        const data = response.data.data;
        this.setHouseShowMode(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  // ip类型
  fetchIptype = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, { keyType: 'ip_type' });
        const data = response.data.data;
        console.log(data);
        this.setIptype(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  // 业务类型
  fetchbusinessType = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, { keyType: 'business_type' });
        const data = response.data.data;
        this.setbusinessType(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  // 带宽类型
  fetchbandwidthType = flow(
    function * () {
      try {
        // const response = yield Fetchapi.newFetchGet(`http://10.3.9.24:8080/api/goods/bandwidth-type/list`);
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/goods/bandwidth-type/list`);
        const data = response.data.data;
        console.log(response)
        this.setbandwidthType(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );
  // 显示方式
  fetchshowType = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, { keyType: 'show_type' });
        const data = response.data.data;
        this.setshowType(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );
  // 是否过墙
  fetchisWall = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, { keyType: 'boolean' });
        const data = response.data.data;
        this.setisWall(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  // 是否防御
  fetchisDefense = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, { keyType: 'boolean' });
        const data = response.data.data;
        this.setisDefense(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  // ip来源
  fetchsource = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, { keyType: 'ip_source' });
        const data = response.data.data;
        this.setsource(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  // 锁定方式
  fetchisLock = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, { keyType: 'boolean' });
        const data = response.data.data;
        this.setisLock(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  // 资源状态
  fetchresStatus = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, { keyType: 'ip_res_status' });
        const data = response.data.data;
        this.setresStatus(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  // 特殊状态
  fetchspecialStatus = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, { keyType: 'special_status' });
        const data = response.data.data;
        this.setspecialStatus(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  // 适用客户类型
  fetchappropriateTypes = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, { keyType: 'appropriate_types' });
        const data = response.data.data;
        this.setappropriateTypes(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  //  防御线路
  fetchdefenseline = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/userdict`, { keyType: 'defense_line' });
        const data = response.data.data;
        this.setdefenseline(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );


}

const ipresource = new Ipresource();
export default ipresource;
