import { observable, action, computed, runInAction, flow} from 'mobx';
import { message } from 'antd';
import tools from '@src/util/tools';
import _ from 'lodash';
import {ApiService as Fetchapi} from '@src/util/fetch-api'; // 自己写的工具函数，封装了请求数据的通用接口
class Device {
  @observable devicemodel = {}; // 网络设备型号
  @observable devicebrand = {}; // 网络设备品牌

  @action setDeviceModel = (list) => {
    // let lists = {};
    // _.map(list, (item) => {
    //   lists[item.keyValues] = item.keyNames;
    // });
    this.devicemodel = _.assign({}, list);
  }

  @action setDeviceBrand = (list) => {
    // let lists = {};
    // _.map(list, (item) => {
    //   lists[item.keyValues] = item.keyNames;
    // });
    this.devicebrand = _.assign({}, list);
  }


  /**
   * 获取设备型号
   */

  fetchDeviceModel = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/userdict`, {keyType: 'network_devices_type'});
        const data = response.data.data;
        this.setDeviceModel(data);
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
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/userdict`, {keyType: 'network_devices_brand'});
        const data = response.data.data;
        this.setDeviceBrand(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );
}

const device = new Device();
export default device;
