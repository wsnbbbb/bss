import { observable, action, computed, runInAction, flow} from 'mobx';
import { message } from 'antd';
import tools from '@src/util/tools';
import _ from 'lodash';
import {ApiService as Fetchapi} from '@src/util/fetch-api'; // 自己写的工具函数，封装了请求数据的通用接口
class Cabinet {
  @observable HouseLevel = {}; // 机房等级
  @action setHouseLevel = (list) => {
    this.HouseLevel = _.assign({}, list);
  }

  /**
   * 获取机房等级
   */

  fetchHouseLevel = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/userdict`, {keyType: 'house_level'});
        const data = response.data.data;
        this.setHouseLevel(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );
}

const cabinet = new Cabinet();
export default cabinet;
