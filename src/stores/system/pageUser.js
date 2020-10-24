// app全局性状态管理
import { observable, action, computed, runInAction} from 'mobx';
import {ApiService as Fetchapi} from '@src/util/fetch-api'; // 自己写的工具函数，封装了请求数据的通用接口
class UserAdminStore {
  @observable showmodal = false;// 增 修 查状态改变

  /**
   * 修改增 修 查状态改变
   * @flag：oon开|off关|其他值则当前状态取反
   * **/
  @action changeShowmodal= (flag) => {
    switch (flag) {
    case 'on':
      this.showmodal = true;
      break;
    case 'off':
      this.showmodal = false;
      break;
    default:
      this.showmodal = !this.showmodal;
      break;
    }

  }

  /**
   * 列表数据
   * @payload
   * **/
  @action getData = async (payload) => {
    try {
      const res = await Fetchapi.getTopicsList(payload);
      runInAction(() => {
        this.staffList = res.data;
      });
    } catch (e) {
      console.error(e);
    }
  }


  @action test = async (payload) => {
    try {
      const res = await Fetchapi.newFetch('mockapi/test', payload);
      return res.data;
    } catch (err) {
      message.error('网络错误，请重试');
    }
  };
}

let userAdminStore = new UserAdminStore();
export default userAdminStore;
