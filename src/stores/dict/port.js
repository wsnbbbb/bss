import { observable, action, computed, runInAction, flow} from 'mobx';
import { message } from 'antd';
import tools from '@src/util/tools';
import _ from 'lodash';
import {ApiService as Fetchapi} from '@src/util/fetch-api'; // 自己写的工具函数，封装了请求数据的通用接口
class Port {
  @observable porttype = {}; // 端口类型
  @observable portstatus = {}; // 端口状态
  @observable portprefix = {}; // 端口前缀
  @action setPortType = (list) => {
    let lists = {};
    _.map(list, (item) => {
      lists[item.keyValues] = item.keyNames;
    });
    this.porttype = _.assign({}, lists);
  }
  @action setportstatus = (list) => {
    let lists = {};
    _.map(list, (item) => {
      lists[item.keyValues] = item.keyNames;
    });
    this.portstatus = _.assign({}, lists);
  }
  @action setportPrefix = (list) => {
    // let lists = {};
    // _.map(list, (item) => {
    //   lists[item.keyValues] = item.keyNames;
    // });
    this.portprefix = _.assign({}, list);
  }


  /**
   * 获取端口
   */
  fetchPortType = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'port_type'});
        const data = response.data.data;
        this.setPortType(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /**
   * 获取端口状态
   */

  fetchPortStatus = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyType: 'port_use'});
        const data = response.data.data;
        this.setportstatus(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

  /**
   * 获取端口前缀
   */

  fetchPortPrefix = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/userdict`, {keyType: 'port_prefix'});
        const data = response.data.data;
        this.setportPrefix(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

}

const port = new Port();
export default port;
