import { observable, action, computed, runInAction, flow} from 'mobx';
import { message } from 'antd';
import tools from '@src/util/tools';
import {ApiService as Fetchapi} from '@src/util/fetch-api'; // 自己写的工具函数，封装了请求数据的通用接口
class Cabinet {
  @observable cabinetStatus = []; // 机柜状态字典值
  @observable cabinetAttr = []; // 机柜属性字典值

  @action setCabinetStatus = (list) => {
    this.cabinetStatus = list;
    console.log(this.cabinetStatus)
  }

  /**
   * 获取地区信息
   * **/
  @action fetchCabinetStatus = async (params = {}) => {
    try {
      const res = await Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyDesc: 'cabinet_status'})
        .runInAction((res) => {
          console.log(res);
          let list = res.data.data;
          this.setCabinetStatus(list);
        });
    } catch (err) {
      message.error("网络错误，请重试");
    }
  };

  /**
   * 获取区域
   */

  fetchStatus = flow(
    function * () {
      try {
        const response = yield Fetchapi.newFetchGet(`${BSS_ADMIN_URL}/api/user/dict`, {keyDesc: 'cabinet_status'});
        const data = response.data.data;
        this.setCabinetStatus(data);
      } catch (error) {
        console.log(error);
      }
    }.bind(this)
  );

}

const cabinet = new Cabinet();
export default cabinet;
