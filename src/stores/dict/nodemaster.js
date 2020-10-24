import { observable, action, computed, runInAction, flow} from 'mobx';
import { message } from 'antd';
import tools from '@src/util/tools';
import _ from 'lodash';
import {ApiService as Fetchapi} from '@src/util/fetch-api'; // 自己写的工具函数，封装了请求数据的通用接口
class NodeMaster {
  @observable device_model = {}; // 外机设备型号
  @observable device_brand = {}; // 外机设备品牌
  @observable device_spec = {}; // 外机设备品牌

  @action setDeviceModel = (list) => {
    // let lists = {};
    // _.map(list, (item) => {
    //   lists[item.keyValues] = item.keyNames;
    // });
    this.device_model = _.assign({}, list);
  }

  @action setDeviceBrand = (list) => {
    // let lists = {};
    // _.map(list, (item) => {
    //   lists[item.keyValues] = item.keyNames;
    // });
    this.device_brand = _.assign({}, list);
  }
  @action setDeviceSpec = (list) => {
    // let lists = {};
    // _.map(list, (item) => {
    //   lists[item.keyValues] = item.keyNames;
    // });
    this.device_spec = _.assign({}, list);
  }

  /**
   * 获取设备型号
   */

  fetchDeviceModel = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/userdict`, {keyType: 'node_server_model'});
        const data = response.data.data;
        this.setDeviceModel(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /**
   * 获取外机规格
   */

  fetchDeviceSpec = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/userdict`, {keyType: 'node_server_spec'});
        const data = response.data.data;
        this.setDeviceSpec(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /**
   * 获取网络设备品牌
   */

  fetchDeviceBrand = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/userdict`, {keyType: 'node_server_brand'});
        const data = response.data.data;
        this.setDeviceBrand(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

}

const nodeMaster = new NodeMaster();
export default nodeMaster;
